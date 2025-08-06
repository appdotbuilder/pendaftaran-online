
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createUserInputSchema,
  createTrainingProgramInputSchema,
  createRegistrationInputSchema,
  getUserRegistrationsInputSchema,
  createPaymentInputSchema,
  updatePaymentStatusInputSchema,
  createDocumentInputSchema,
  updateDocumentStatusInputSchema,
  updateRegistrationStatusInputSchema,
  createTrainingScheduleInputSchema,
  getTrainingScheduleInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { createTrainingProgram } from './handlers/create_training_program';
import { getTrainingPrograms } from './handlers/get_training_programs';
import { createRegistration } from './handlers/create_registration';
import { getUserRegistrations } from './handlers/get_user_registrations';
import { createPayment } from './handlers/create_payment';
import { updatePaymentStatus } from './handlers/update_payment_status';
import { createDocument } from './handlers/create_document';
import { updateDocumentStatus } from './handlers/update_document_status';
import { updateRegistrationStatus } from './handlers/update_registration_status';
import { createTrainingSchedule } from './handlers/create_training_schedule';
import { getTrainingSchedule } from './handlers/get_training_schedule';
import { getAllRegistrations } from './handlers/get_all_registrations';
import { getAllPayments } from './handlers/get_all_payments';
import { getPendingDocuments } from './handlers/get_pending_documents';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  // Training program management
  createTrainingProgram: publicProcedure
    .input(createTrainingProgramInputSchema)
    .mutation(({ input }) => createTrainingProgram(input)),

  getTrainingPrograms: publicProcedure
    .query(() => getTrainingPrograms()),

  // Registration management
  createRegistration: publicProcedure
    .input(createRegistrationInputSchema)
    .mutation(({ input }) => createRegistration(input)),

  getUserRegistrations: publicProcedure
    .input(getUserRegistrationsInputSchema)
    .query(({ input }) => getUserRegistrations(input)),

  updateRegistrationStatus: publicProcedure
    .input(updateRegistrationStatusInputSchema)
    .mutation(({ input }) => updateRegistrationStatus(input)),

  getAllRegistrations: publicProcedure
    .query(() => getAllRegistrations()),

  // Payment management
  createPayment: publicProcedure
    .input(createPaymentInputSchema)
    .mutation(({ input }) => createPayment(input)),

  updatePaymentStatus: publicProcedure
    .input(updatePaymentStatusInputSchema)
    .mutation(({ input }) => updatePaymentStatus(input)),

  getAllPayments: publicProcedure
    .query(() => getAllPayments()),

  // Document management
  createDocument: publicProcedure
    .input(createDocumentInputSchema)
    .mutation(({ input }) => createDocument(input)),

  updateDocumentStatus: publicProcedure
    .input(updateDocumentStatusInputSchema)
    .mutation(({ input }) => updateDocumentStatus(input)),

  getPendingDocuments: publicProcedure
    .query(() => getPendingDocuments()),

  // Training schedule management
  createTrainingSchedule: publicProcedure
    .input(createTrainingScheduleInputSchema)
    .mutation(({ input }) => createTrainingSchedule(input)),

  getTrainingSchedule: publicProcedure
    .input(getTrainingScheduleInputSchema)
    .query(({ input }) => getTrainingSchedule(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
