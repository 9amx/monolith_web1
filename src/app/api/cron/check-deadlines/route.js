import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cards, users } from '@/db/schema';
import { isNotNull, eq, inArray } from 'drizzle-orm';
import { sendDeadlineWarningEmail, sendOverdueEmail } from '@/lib/mailer';

export async function GET(request) {
  try {
    // 1. Fetch all cards with active deadlines
    const activeCards = await db.select().from(cards)
      .where(isNotNull(cards.deadlineHours));

    const now = new Date();
    let processed = 0;

    for (const card of activeCards) {
      if (!card.timerStartedAt) continue;

      const startedAt = new Date(card.timerStartedAt);
      const elapsedMs = now.getTime() - startedAt.getTime();
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      const percent = (elapsedHours / card.deadlineHours) * 100;
      
      const hoursLeft = card.deadlineHours - elapsedHours;

      let updateData = {};
      let emailsToSend = [];

      // We only care about assignees if we are going to send emails
      const getAssigneeEmails = async () => {
        const assignees = typeof card.assignees === 'string' ? JSON.parse(card.assignees) : (card.assignees || []);
        if (assignees.length === 0) return [];
        const parsedIds = assignees.map(id => parseInt(id)).filter(id => !isNaN(id));
        if (parsedIds.length === 0) return [];
        const assignedUsers = await db.select().from(users).where(inArray(users.id, parsedIds));
        return assignedUsers.map(u => u.email);
      };

      // 50% Warning
      if (percent >= 50 && percent < 80 && !card.notified50) {
        updateData.notified50 = true;
        emailsToSend.push({ type: 'warning', percent: 50 });
      }
      
      // 80% Warning
      if (percent >= 80 && elapsedHours < card.deadlineHours && !card.notified80) {
        updateData.notified80 = true;
        emailsToSend.push({ type: 'warning', percent: 80 });
      }

      // Overdue
      if (elapsedHours > card.deadlineHours && !card.notifiedOverdue) {
        updateData.notifiedOverdue = true;
        emailsToSend.push({ type: 'overdue' });
      }

      // Penalty Calculation
      // Start applying penalty if overdue by more than 30 mins (0.5 hours)
      if (elapsedHours > card.deadlineHours + 0.5) {
        const penaltyHours = elapsedHours - (card.deadlineHours + 0.5);
        // Penalty is 2% immediately after 30 mins, and another 2% for every full hour after that.
        // Wait, the user said "per hour ea 2% kore percentage kete neya hobe".
        // Let's do: floor(penaltyHours) * 2 + 2.
        // e.g. at 31 mins (penaltyHours = 0.016), floor(0.016)*2 + 2 = 0 + 2 = 2%
        // at 90 mins (penaltyHours = 1), floor(1)*2 + 2 = 2 + 2 = 4%
        const currentCalculatedPenalty = (Math.floor(penaltyHours) + 1) * 2;
        
        if (currentCalculatedPenalty > card.penaltyPercent) {
          updateData.penaltyPercent = currentCalculatedPenalty;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await db.update(cards).set(updateData).where(eq(cards.id, card.id));
        processed++;

        if (emailsToSend.length > 0) {
          const emails = await getAssigneeEmails();
          for (const email of emails) {
            for (const notice of emailsToSend) {
              if (notice.type === 'warning') {
                await sendDeadlineWarningEmail(email, card.title, notice.percent, hoursLeft);
              } else if (notice.type === 'overdue') {
                await sendOverdueEmail(email, card.title);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Failed to process deadlines' }, { status: 500 });
  }
}
