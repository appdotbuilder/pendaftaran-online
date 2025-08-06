
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const registrationStatusEnum = pgEnum('registration_status', ['pending', 'verified', 'rejected', 'completed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['bank_transfer', 'credit_card', 'e_wallet', 'cash']);
export const documentStatusEnum = pgEnum('document_status', ['pending', 'verified', 'rejected']);
export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  full_name: text('full_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  role: userRoleEnum('role').notNull().default('student'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Training programs table
export const trainingProgramsTable = pgTable('training_programs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  duration_hours: integer('duration_hours').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  max_participants: integer('max_participants').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Registrations table
export const registrationsTable = pgTable('registrations', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  program_id: integer('program_id').notNull().references(() => trainingProgramsTable.id),
  status: registrationStatusEnum('status').notNull().default('pending'),
  registration_date: timestamp('registration_date').defaultNow().notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table
export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  registration_id: integer('registration_id').notNull().references(() => registrationsTable.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  payment_status: paymentStatusEnum('payment_status').notNull().default('pending'),
  payment_date: timestamp('payment_date'),
  transaction_id: text('transaction_id'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Documents table
export const documentsTable = pgTable('documents', {
  id: serial('id').primaryKey(),
  registration_id: integer('registration_id').notNull().references(() => registrationsTable.id),
  document_type: text('document_type').notNull(),
  file_path: text('file_path').notNull(),
  file_name: text('file_name').notNull(),
  status: documentStatusEnum('status').notNull().default('pending'),
  verified_by: integer('verified_by').references(() => usersTable.id),
  verified_at: timestamp('verified_at'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Training schedules table
export const trainingSchedulesTable = pgTable('training_schedules', {
  id: serial('id').primaryKey(),
  program_id: integer('program_id').notNull().references(() => trainingProgramsTable.id),
  session_title: text('session_title').notNull(),
  session_date: timestamp('session_date').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  location: text('location'),
  materials: text('materials'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  registrations: many(registrationsTable),
  verifiedDocuments: many(documentsTable),
}));

export const trainingProgramsRelations = relations(trainingProgramsTable, ({ many }) => ({
  registrations: many(registrationsTable),
  schedules: many(trainingSchedulesTable),
}));

export const registrationsRelations = relations(registrationsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [registrationsTable.user_id],
    references: [usersTable.id],
  }),
  program: one(trainingProgramsTable, {
    fields: [registrationsTable.program_id],
    references: [trainingProgramsTable.id],
  }),
  payments: many(paymentsTable),
  documents: many(documentsTable),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  registration: one(registrationsTable, {
    fields: [paymentsTable.registration_id],
    references: [registrationsTable.id],
  }),
}));

export const documentsRelations = relations(documentsTable, ({ one }) => ({
  registration: one(registrationsTable, {
    fields: [documentsTable.registration_id],
    references: [registrationsTable.id],
  }),
  verifiedBy: one(usersTable, {
    fields: [documentsTable.verified_by],
    references: [usersTable.id],
  }),
}));

export const trainingSchedulesRelations = relations(trainingSchedulesTable, ({ one }) => ({
  program: one(trainingProgramsTable, {
    fields: [trainingSchedulesTable.program_id],
    references: [trainingProgramsTable.id],
  }),
}));

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  trainingPrograms: trainingProgramsTable,
  registrations: registrationsTable,
  payments: paymentsTable,
  documents: documentsTable,
  trainingSchedules: trainingSchedulesTable,
};
