import { db } from '../db/index.js';
import { cards, users, submissions } from '../db/schema.js';
import { eq, isNotNull, and } from 'drizzle-orm';
import { sendDeadlineAlert } from './mailer.js';

let cronInitialized = false;

export function initCronJob() {
  if (cronInitialized) return;
  cronInitialized = true;

  console.log("🕒 Initializing deadline tracking cron job...");

  // Run every 1 minute
  setInterval(async () => {
    try {
      // Find cards that have a timer started and a deadline
      const activeCards = await db.select({
        id: cards.id,
        title: cards.title,
        projectFileName: cards.projectFileName,
        timerStartedAt: cards.timerStartedAt,
        deadlineHours: cards.deadlineHours,
        assignees: cards.assignees,
        notified50: cards.notified50,
        notified80: cards.notified80,
        notifiedOverdue: cards.notifiedOverdue,
        penaltyPercent: cards.penaltyPercent,
      })
      .from(cards)
      .where(and(isNotNull(cards.timerStartedAt), isNotNull(cards.deadlineHours)));

      for (const card of activeCards) {
        // Verify if a submission exists for this card
        const existingSubmissions = await db.select({ id: submissions.id })
          .from(submissions)
          .where(eq(submissions.cardId, card.id));
        
        // If submitted, skip this card (timer is stopped)
        if (existingSubmissions.length > 0) continue;

        // Ensure there is an assignee to notify
        const assigneesArray = Array.isArray(card.assignees) ? card.assignees : [];
        if (assigneesArray.length === 0) continue;

        // Get editor email
        const editorId = assigneesArray[0];
        const editorRows = await db.select({ email: users.email }).from(users).where(eq(users.id, editorId));
        if (editorRows.length === 0) continue;
        const editorEmail = editorRows[0].email;

        const now = new Date();
        const startedAt = new Date(card.timerStartedAt);
        const elapsedMs = now - startedAt;
        const elapsedMinutes = elapsedMs / (1000 * 60);
        
        const deadlineMinutes = card.deadlineHours * 60;
        const percentageElapsed = (elapsedMinutes / deadlineMinutes) * 100;

        let updateData = {};
        let shouldUpdate = false;

        // 1. Check 50%
        if (percentageElapsed >= 50 && percentageElapsed < 80 && !card.notified50) {
          await sendDeadlineAlert(editorEmail, '50_percent', card);
          updateData.notified50 = true;
          shouldUpdate = true;
        }

        // 2. Check 80%
        if (percentageElapsed >= 80 && percentageElapsed < 100 && !card.notified80) {
          await sendDeadlineAlert(editorEmail, '80_percent', card);
          updateData.notified80 = true;
          shouldUpdate = true;
        }

        // 3. Check 100% (Overdue)
        if (percentageElapsed >= 100 && !card.notifiedOverdue) {
          await sendDeadlineAlert(editorEmail, 'overdue', card);
          updateData.notifiedOverdue = true;
          shouldUpdate = true;
        }

        // 4. Check Penalties (Overdue by 30 mins)
        if (elapsedMinutes >= deadlineMinutes + 30) {
          // It's been at least 30 mins since deadline
          const overdueMinutes = elapsedMinutes - deadlineMinutes;
          
          // First penalty at 30 mins (2%), then +2% for every full 60 mins after that
          // E.g. 30 mins -> penalty level 1 (2%)
          // 90 mins -> penalty level 2 (4%)
          // 150 mins -> penalty level 3 (6%)
          
          const penaltyLevel = Math.floor((overdueMinutes - 30) / 60) + 1;
          const expectedPenalty = penaltyLevel * 2;

          if (expectedPenalty > card.penaltyPercent) {
            updateData.penaltyPercent = expectedPenalty;
            shouldUpdate = true;
            card.penaltyPercent = expectedPenalty; // For the email template
            await sendDeadlineAlert(editorEmail, 'penalty', card);
          }
        }

        if (shouldUpdate) {
          await db.update(cards).set(updateData).where(eq(cards.id, card.id));
        }
      }

    } catch (error) {
      console.error("Cron Error:", error);
    }
  }, 60 * 1000); // 1 minute interval
}
