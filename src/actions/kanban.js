"use server";

import { db } from '@/db';
import { boards, columns, cards, users, clients, submissions, invoices } from '@/db/schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { getCurrentUser } from './auth';
import { sendCardAssignmentEmail, sendSubmissionEmail, sendCommentEmailToAdmin, sendReplyEmailToUser } from '@/lib/mailer';
import { unstable_noStore as noStore } from 'next/cache';

// Helper to seed a default board if it doesn't exist
export async function getOrCreateBoard() {
  const allBoards = await db.select().from(boards);
  if (allBoards.length > 0) return allBoards[0];

  const [newBoard] = await db.insert(boards).values({
    id: 'b_default',
    title: 'Main Workspace'
  }).returning();

  // Seed default columns
  await db.insert(columns).values([
    { id: 'c_todo', boardId: newBoard.id, title: 'To Do', orderIndex: 0 },
    { id: 'c_in_progress', boardId: newBoard.id, title: 'In Progress', orderIndex: 1 },
    { id: 'c_review', boardId: newBoard.id, title: 'Review', orderIndex: 2 },
    { id: 'c_done', boardId: newBoard.id, title: 'Done', orderIndex: 3 }
  ]);

  return newBoard;
}

export async function getKanbanData() {
  noStore();
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const board = await getOrCreateBoard();
    
    const cols = await db.select().from(columns).where(eq(columns.boardId, board.id)).orderBy(asc(columns.orderIndex));
    const crds = await db.select().from(cards).where(eq(cards.boardId, board.id)).orderBy(asc(cards.orderIndex));
    const allUsers = await db.select().from(users);
    const allClients = await db.select().from(clients);

    // Transform to the shape the frontend expects
    const data = {
      columns: {},
      cards: {},
      columnOrder: [],
      users: allUsers,
      clients: allClients,
    };

    for (const c of cols) {
      data.columns[c.id] = {
        id: c.id,
        title: c.title,
        cardIds: []
      };
      data.columnOrder.push(c.id);
    }

    // Sort cards by their orderIndex within each column
    const cardsByCol = {};
    for (const c of crds) {
      if (!cardsByCol[c.columnId]) cardsByCol[c.columnId] = [];
      cardsByCol[c.columnId].push(c);
      
      data.cards[c.id] = {
        ...c,
        labels: typeof c.labels === 'string' ? JSON.parse(c.labels) : c.labels,
        assignees: typeof c.assignees === 'string' ? JSON.parse(c.assignees) : c.assignees,
        comments: typeof c.comments === 'string' ? JSON.parse(c.comments) : c.comments,
        checklist: typeof c.checklist === 'string' ? JSON.parse(c.checklist) : c.checklist,
        projectLinks: typeof c.projectLinks === 'string' ? JSON.parse(c.projectLinks) : (c.projectLinks || []),
        attachments: typeof c.attachments === 'string' ? JSON.parse(c.attachments) : (c.attachments || []),
      };
    }

    for (const colId of data.columnOrder) {
      const colCards = cardsByCol[colId] || [];
      colCards.sort((a, b) => a.orderIndex - b.orderIndex);
      data.columns[colId].cardIds = colCards.map(c => c.id);
    }

    return data;
  } catch (err) {
    const fs = require('fs');
    fs.writeFileSync('d:\\Monolith\\get_kanban_error.log', err.stack || err.message);
    throw err;
  }
}

export async function addCard(cardData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const board = await getOrCreateBoard();

  // Find the highest orderIndex in the target column
  const crds = await db.select().from(cards).where(eq(cards.columnId, cardData.columnId));
  const maxOrder = crds.length > 0 ? Math.max(...crds.map(c => c.orderIndex)) : -1;

  await db.insert(cards).values({
    id: cardData.id,
    columnId: cardData.columnId,
    boardId: board.id,
    title: cardData.title,
    orderIndex: maxOrder + 1,
    labels: cardData.labels || [],
    assignees: cardData.assignees || [],
    comments: cardData.comments || [],
    checklist: cardData.checklist || [],
    clientId: cardData.clientId || null,
    projectLinks: cardData.projectLinks || [],
    attachments: cardData.attachments || [],
  });
  return { success: true };
}

export async function deleteCard(cardId) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Super Admin') throw new Error("Unauthorized");
  
  await db.delete(submissions).where(eq(submissions.cardId, cardId));
  await db.delete(cards).where(eq(cards.id, cardId));
  return { success: true };
}

export async function addColumn(colId, title) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const board = await getOrCreateBoard();
  const cols = await db.select().from(columns).where(eq(columns.boardId, board.id));
  const maxOrder = cols.length > 0 ? Math.max(...cols.map(c => c.orderIndex)) : -1;

  await db.insert(columns).values({
    id: colId,
    boardId: board.id,
    title,
    orderIndex: maxOrder + 1
  });
  return { success: true };
}

export async function renameColumn(colId, title) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await db.update(columns).set({ title }).where(eq(columns.id, colId));
  return { success: true };
}

export async function deleteColumn(colId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  // First delete all cards in the column
  await db.delete(cards).where(eq(cards.columnId, colId));
  // Then delete the column
  await db.delete(columns).where(eq(columns.id, colId));
  return { success: true };
}

export async function updateCard(cardId, updates) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const [currentCard] = await db.select().from(cards).where(eq(cards.id, cardId));
  if (!currentCard) {
    console.warn("updateCard: Card not found for id", cardId);
    return { success: false, error: "Card not found" };
  }

  const updateData = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.projectFileName !== undefined) updateData.projectFileName = updates.projectFileName;
  if (updates.clientPaymentAmount !== undefined) updateData.clientPaymentAmount = updates.clientPaymentAmount;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.labels !== undefined) updateData.labels = updates.labels;
  if (updates.assignees !== undefined) updateData.assignees = updates.assignees;
    if (updates.comments !== undefined) {
      const oldComments = typeof currentCard.comments === 'string' 
        ? JSON.parse(currentCard.comments) 
        : (currentCard.comments || []);
      const newComments = updates.comments;
      
      // Detect new comment
      const newlyAddedComment = newComments.find(nc => !oldComments.some(oc => oc.id === nc.id));
      if (newlyAddedComment) {
        if (user.role !== 'Super Admin') {
          // Find admin email
          const admins = await db.select().from(users).where(eq(users.role, 'Super Admin'));
          const admin = admins[0];
          if (admin?.email) {
            await sendCommentEmailToAdmin(admin.email, currentCard.title, newlyAddedComment.text, user.name);
          }
        }
      } else {
        // Check for new reply
        let newlyAddedReply = null;
        for (const nc of newComments) {
          const oc = oldComments.find(o => o.id === nc.id);
          if (oc) {
            const added = (nc.replies || []).find(nr => !(oc.replies || []).some(or => or.id === nr.id));
            if (added) {
              newlyAddedReply = added;
              break;
            }
          }
        }
        
        if (newlyAddedReply && user.role === 'Super Admin') {
          // Send to assigned user
          const assignees = typeof currentCard.assignees === 'string' 
            ? JSON.parse(currentCard.assignees) 
            : (currentCard.assignees || []);
            
          if (assignees.length > 0) {
            const parsedId = parseInt(assignees[0]);
            if (!isNaN(parsedId)) {
              const assignedUser = await db.select().from(users).where(eq(users.id, parsedId));
              if (assignedUser[0]?.email) {
                await sendReplyEmailToUser(assignedUser[0].email, currentCard.title, newlyAddedReply.text, user.name);
              }
            }
          }
        }
      }
      updateData.comments = updates.comments;
    }

  if (updates.checklist !== undefined) updateData.checklist = updates.checklist;
  if (updates.clientId !== undefined) updateData.clientId = updates.clientId;
  if (updates.projectLinks !== undefined) updateData.projectLinks = updates.projectLinks;
  if (updates.referenceLinks !== undefined) updateData.referenceLinks = updates.referenceLinks;
  if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
  if (updates.deadlineHours !== undefined) updateData.deadlineHours = updates.deadlineHours;
  if (updates.ratePerMinute !== undefined) updateData.ratePerMinute = updates.ratePerMinute;
  
  if (updates.assignees !== undefined) {
    const oldAssignees = typeof currentCard.assignees === 'string' 
      ? JSON.parse(currentCard.assignees) 
      : (currentCard.assignees || []);
      
    const newAssignees = updates.assignees.filter(id => !oldAssignees.includes(id));
    if (newAssignees.length > 0) {
      // Start the timer if not already started
      if (!currentCard.timerStartedAt) {
        updateData.timerStartedAt = new Date();
      }
    }
  }

  await db.update(cards).set(updateData).where(eq(cards.id, cardId));

  return { success: true };
}

export async function notifyNewAssignees(cardId, assigneeIds) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const [currentCard] = await db.select().from(cards).where(eq(cards.id, cardId));
  if (!currentCard) return { success: false, error: "Card not found" };

  const parsedIds = assigneeIds.map(id => parseInt(id)).filter(id => !isNaN(id));
  if (parsedIds.length === 0) return { success: true };

  const newlyAssignedUsers = await db.select().from(users).where(inArray(users.id, parsedIds));
  if (newlyAssignedUsers.length === 0) return { success: true };

  const [col] = await db.select().from(columns).where(eq(columns.id, currentCard.columnId));
  
  let clientName = null;
  if (currentCard.clientId) {
    const [client] = await db.select().from(clients).where(eq(clients.id, currentCard.clientId));
    if (client) clientName = client.name;
  }

  const parseJSONB = (val, defaultVal = []) => typeof val === 'string' ? JSON.parse(val) : (val || defaultVal);
  const cardDetails = {
    title: currentCard.title,
    projectFileName: currentCard.projectFileName,
    description: currentCard.description,
    columnTitle: col?.title,
    clientName,
    projectLinks: parseJSONB(currentCard.projectLinks),
    attachments: parseJSONB(currentCard.attachments),
    deadlineHours: currentCard.deadlineHours,
  };

  const assignedBy = user.name || user.email.split('@')[0];

  for (const assignedUser of newlyAssignedUsers) {
    sendCardAssignmentEmail(assignedUser.email, cardDetails, assignedBy).catch(err => {
      console.error("Failed to send assignment email:", err);
    });
  }

  return { success: true };
}

export async function updateColumnOrder(columnOrder) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const updatePromises = columnOrder.map((columnId, index) =>
    db.update(columns).set({ orderIndex: index }).where(eq(columns.id, columnId))
  );

  if (updatePromises.length > 0) {
    await db.batch(updatePromises);
  }

  return { success: true };
}

// Bulk update card order and column assignments (used for drag and drop)
export async function updateBoardState(newColumns) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // newColumns is expected to be an array of objects: { id: columnId, cardIds: [id1, id2] }
  // We need to update the columnId and orderIndex for every card
  const updatePromises = [];
  
  for (const col of newColumns) {
    for (let i = 0; i < col.cardIds.length; i++) {
      const cardId = col.cardIds[i];
      updatePromises.push(
        db.update(cards)
          .set({ columnId: col.id, orderIndex: i })
          .where(eq(cards.id, cardId))
      );
    }
  }
  if (updatePromises.length > 0) {
    await db.batch(updatePromises);
  }
  return { success: true };
}

export async function submitProject(cardId, clientId, videoLink, duration, editorLocalDate) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
  if (!card) return { success: false, error: "Card not found" };

  const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
  if (!client) throw new Error("Client not found");

  // Save the duration to the card if provided
  let parsedDuration = null;
  if (duration !== undefined) {
    parsedDuration = parseFloat(duration);
    if (!isNaN(parsedDuration)) {
      await db.update(cards).set({ deliveredDuration: parsedDuration }).where(eq(cards.id, cardId));
    } else {
      parsedDuration = null;
    }
  }

  // Generate PDF Invoice ID
  const clientInvoiceId = Date.now().toString().slice(-6);

  // Insert submission
  await db.insert(submissions).values({
    cardId,
    clientId,
    editorId: user.id,
    videoLink,
    status: 'reviewing',
    clientInvoiceId,
  });

  const { generateInvoiceBuffer } = await import('../lib/generateInvoice.js');
  
  const bdDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' });
  const editorDate = editorLocalDate || bdDate;

  // Base Invoice Data
  const baseInvoiceData = {
    invoiceNo: clientInvoiceId,
    clientName: client.name,
    clientEmail: client.email || 'no-email@client.com',
    projectFileName: card.projectFileName,
    amount: card.clientPaymentAmount || 0,
    description: card.description || '',
    videoLink: videoLink,
    duration: parsedDuration ? `${parsedDuration} Minutes` : 'Unknown Duration',
    subtotal: `$${card.clientPaymentAmount || 0}`,
    total: `$${card.clientPaymentAmount || 0}`,
    items: [
      {
        title: card.projectFileName || card.title || 'Video Editing Service',
        description: card.description || 'Professional video editing including cuts, transitions, color grading, sound sync & effects.',
        duration: parsedDuration ? `${parsedDuration} Minutes` : 'N/A',
        total: `$${card.clientPaymentAmount || 0}`
      }
    ]
  };

  // Generate PDF Invoice for Client (Bangladesh Time)
  const clientInvoiceData = { ...baseInvoiceData, date: bdDate };
  const clientPdfBuffer = await generateInvoiceBuffer(clientInvoiceData);

  // Generate PDF Invoice for Admin/Editor (Editor Local Time)
  const editorInvoiceData = { ...baseInvoiceData, date: editorDate };
  const adminPdfBuffer = await generateInvoiceBuffer(editorInvoiceData);

  // Send invoice to client
  const { sendClientInvoiceEmail, sendSubmissionEmail } = await import('../lib/mailer.js');
  if (client.email && client.email !== 'no-email@client.com') {
    await sendClientInvoiceEmail(client.email, clientInvoiceData, clientPdfBuffer);
  }

  // Log invoice in DB
  await db.insert(invoices).values({
    clientId,
    amount: clientInvoiceData.amount,
    profit: clientInvoiceData.amount,
  });

  // Notify all admins/super admins
  const adminUsers = await db.select().from(users).where(inArray(users.role, ['Admin', 'Super Admin']));
  const submittedBy = {
    name: user.name,
    email: user.email,
    username: user.username
  };

  for (const admin of adminUsers) {
    if (admin.email) {
      await sendSubmissionEmail(
        admin.email, 
        { clientName: client.name, cardTitle: card.title, projectFileName: card.projectFileName, videoLink, duration }, 
        submittedBy,
        adminPdfBuffer
      );
    }
  }

  return { success: true };
}

export async function addClientFromBoard(name) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = Date.now().toString();
  const [newClient] = await db.insert(clients).values({
    id,
    name,
    email: 'no-email@client.com',
  }).returning();

  return newClient;
}
