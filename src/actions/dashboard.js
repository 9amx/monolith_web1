"use server";

import { db } from '@/db';
import { clients, invoices, submissions, cards, users, columns } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUser } from './auth';
import { getOrCreateBoard } from './kanban';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

export async function getDashboardData() {
  noStore();
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
  const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.date));

  const allSubmissions = await db.select({
    id: submissions.id,
    videoLink: submissions.videoLink,
    status: submissions.status,
    isPaid: submissions.isPaid,
    createdAt: submissions.createdAt,
    clientId: clients.id,
    clientName: clients.name,
    clientEmail: clients.email,
    cardTitle: cards.title,
    projectFileName: cards.projectFileName,
    description: cards.description,
    editorName: users.name,
    editorEmail: users.email,
    editorBankDetails: users.bankDetails,
    editorRocketAccount: users.rocketAccount,
    editorBinancePayId: users.binancePayId,
    ratePerMinute: cards.ratePerMinute,
    deliveredDuration: cards.deliveredDuration,
    penaltyPercent: cards.penaltyPercent,
    clientPaymentAmount: cards.clientPaymentAmount,
    clientInvoiceId: submissions.clientInvoiceId,
    editorInvoiceId: submissions.editorInvoiceId
  }).from(submissions)
    .leftJoin(clients, eq(submissions.clientId, clients.id))
    .leftJoin(cards, eq(submissions.cardId, cards.id))
    .leftJoin(users, eq(submissions.editorId, users.id))
    .orderBy(desc(submissions.createdAt));

  return {
    clients: allClients.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString()
    })),
    invoices: allInvoices.map(i => ({
      ...i,
      date: i.date.toISOString()
    })),
    submissions: allSubmissions.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString()
    }))
  };
}

export async function addClientAction(name, email) {
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  const id = Date.now().toString();

  const [newClient] = await db.insert(clients).values({
    id,
    name,
    email,
  }).returning();

  // Auto-create list and card on projects board
  const board = await getOrCreateBoard();
  
  // Find "Client List" column in this board
  let [clientListCol] = await db.select().from(columns).where(
    and(
      eq(columns.title, 'Client List'),
      eq(columns.boardId, board.id)
    )
  );
  
  if (!clientListCol) {
    const cols = await db.select().from(columns).where(eq(columns.boardId, board.id));
    const maxOrder = cols.length > 0 ? Math.max(...cols.map(c => c.orderIndex)) : -1;
    
    [clientListCol] = await db.insert(columns).values({
      id: `col_${Date.now()}_cl`,
      boardId: board.id,
      title: 'Client List',
      orderIndex: maxOrder + 1,
    }).returning();
  }

  // Create card for the client
  const crds = await db.select().from(cards).where(eq(cards.columnId, clientListCol.id));
  const maxCardOrder = crds.length > 0 ? Math.max(...crds.map(c => c.orderIndex)) : -1;

  await db.insert(cards).values({
    id: `c_${Date.now()}_${id}`,
    columnId: clientListCol.id,
    boardId: board.id,
    title: name,
    clientId: newClient.id,
    orderIndex: maxCardOrder + 1,
    labels: [],
    assignees: [],
    comments: [],
    checklist: [],
  });

  revalidatePath('/projects');
  revalidatePath('/dashboard');

  return { ...newClient, createdAt: newClient.createdAt.toISOString() };
}

export async function updateClientAction(id, data) {
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  const [updated] = await db.update(clients)
    .set({
      name: data.name,
      email: data.email,
    })
    .where(eq(clients.id, id))
    .returning();

  return { ...updated, createdAt: updated.createdAt.toISOString() };
}

export async function deleteClientAction(id) {
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  // 1. Delete submissions for this client (due to foreign key)
  await db.delete(submissions).where(eq(submissions.clientId, id));

  // 2. Delete the card in the "Client List" column if it exists
  const cols = await db.select().from(columns).where(eq(columns.title, 'Client List'));
  const clientListColIds = cols.map(c => c.id);
  
  if (clientListColIds.length > 0) {
    // We import inArray from drizzle-orm for this
    const { inArray } = await import('drizzle-orm');
    await db.delete(cards).where(
      and(
        eq(cards.clientId, id),
        inArray(cards.columnId, clientListColIds)
      )
    );
  }

  // 3. Nullify clientId on any remaining project cards to prevent deletion of actual projects
  await db.update(cards)
    .set({ clientId: null })
    .where(eq(cards.clientId, id));

  // 4. Delete invoices
  await db.delete(invoices).where(eq(invoices.clientId, id));
  
  // 5. Delete client
  await db.delete(clients).where(eq(clients.id, id));

  revalidatePath('/projects');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function logInvoiceAction(clientId, amount, profit) {
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  const [newInvoice] = await db.insert(invoices).values({
    clientId,
    amount,
    profit,
  }).returning();

  return { ...newInvoice, date: newInvoice.date.toISOString() };
}

export async function approveSubmissionAction(id) {
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  // Get the submission to find clientId and card
  const sub = await db.select().from(submissions).where(eq(submissions.id, id));
  if (sub.length > 0) {
    const currentSub = sub[0];
    
    // Check if it's already approved to avoid double logging
    if (currentSub.status !== 'approved') {
      const card = await db.select().from(cards).where(eq(cards.id, currentSub.cardId));
      if (card.length > 0) {
        const amount = card[0].clientPaymentAmount || 0;
        
        // Log invoice in DB
        await db.insert(invoices).values({
          clientId: currentSub.clientId,
          amount: amount,
          profit: amount,
        });
      }
    }
  }

  await db.update(submissions)
    .set({ status: 'approved' })
    .where(eq(submissions.id, id));

  return { success: true };
}

export async function deleteSubmissionAction(id) {
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  await db.delete(submissions).where(eq(submissions.id, id));

  return { success: true };
}

export async function markSubmissionPaidAction(id, isPaid, editorCut, editorInvoiceId) {
  const user = await getCurrentUser();
  if (!user || !user.hasDashboardAccess) throw new Error("Unauthorized");

  const updateData = { isPaid };
  if (editorInvoiceId) {
    updateData.editorInvoiceId = editorInvoiceId;
  }

  await db.update(submissions).set(updateData).where(eq(submissions.id, id));

  // If marking as paid and an editorCut is provided, update the profit of the most recent invoice
  if (isPaid && editorCut !== undefined && editorCut !== null) {
    const sub = await db.select().from(submissions).where(eq(submissions.id, id));
    if (sub.length > 0) {
      const latestInvoices = await db.select()
        .from(invoices)
        .where(eq(invoices.clientId, sub[0].clientId))
        .orderBy(desc(invoices.date))
        .limit(1);

      if (latestInvoices.length > 0) {
        const inv = latestInvoices[0];
        const profit = inv.amount - parseFloat(editorCut);
        await db.update(invoices).set({ profit }).where(eq(invoices.id, inv.id));
      }
    }
  }

  revalidatePath('/dashboard');
  return { success: true };
}
