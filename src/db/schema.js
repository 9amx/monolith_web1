import { pgTable, text, timestamp, jsonb, boolean, integer, serial, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username'),
  name: text('name'),
  role: text('role').notNull().default('Viewer'), // Super Admin, Admin, Editor, Viewer
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  hasDashboardAccess: boolean('has_dashboard_access').default(false).notNull(),
  bankDetails: text('bank_details'),
  rocketAccount: text('rocket_account'),
  binancePayId: text('binance_pay_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invites = pgTable('invites', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const boards = pgTable('boards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
});

export const columns = pgTable('columns', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull(), // Used to sort columns
});

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  columnId: text('column_id').notNull().references(() => columns.id),
  boardId: text('board_id').notNull().references(() => boards.id),
  clientId: text('client_id').references(() => clients.id),
  title: text('title').notNull(),
  projectFileName: text('project_file_name'),
  description: text('description').default(''),
  orderIndex: integer('order_index').notNull(), // Used to sort cards within a column
  labels: jsonb('labels').default('[]'),
  assignees: jsonb('assignees').default('[]'),
  comments: jsonb('comments').default('[]'),
  checklist: jsonb('checklist').default('[]'),
  projectLinks: jsonb('project_links').default('[]'),
  referenceLinks: jsonb('reference_links').default('[]'),
  attachments: jsonb('attachments').default('[]'),
  deadlineHours: integer('deadline_hours'),
  timerStartedAt: timestamp('timer_started_at'),
  notified50: boolean('notified_50').default(false).notNull(),
  notified80: boolean('notified_80').default(false).notNull(),
  notifiedOverdue: boolean('notified_overdue').default(false).notNull(),
  penaltyPercent: integer('penalty_percent').default(0).notNull(),
  ratePerMinute: integer('rate_per_minute'),
  deliveredDuration: real('delivered_duration'),
  clientPaymentAmount: integer('client_payment_amount'),
});

export const clients = pgTable('clients', {
  id: text('id').primaryKey(), // using text so we can easily transition from Date.now().toString()
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id),
  amount: real('amount').notNull(),
  profit: real('profit').default(0).notNull(),
  date: timestamp('date').defaultNow().notNull(),
});

export const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  type: text('type').notNull(), // 'signup' or 'reset'
  expiresAt: timestamp('expires_at').notNull(),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  cardId: text('card_id').notNull().references(() => cards.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  editorId: integer('editor_id').notNull().references(() => users.id),
  videoLink: text('video_link').notNull(),
  status: text('status').default('pending').notNull(),
  isPaid: boolean('is_paid').default(false).notNull(),
  clientInvoiceId: text('client_invoice_id'),
  editorInvoiceId: text('editor_invoice_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
