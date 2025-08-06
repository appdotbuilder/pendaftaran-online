
import { z } from 'zod';

// Enums
export const registrationStatusEnum = z.enum(['pending', 'verified', 'rejected', 'completed']);
export const paymentStatusEnum = z.enum(['pending', 'paid', 'failed', 'refunded']);
export const paymentMethodEnum = z.enum(['bank_transfer', 'credit_card', 'e_wallet', 'cash']);
export const documentStatusEnum = z.enum(['pending', 'verified', 'rejected']);
export const userRoleEnum = z.enum(['student', 'admin']);

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string(),
  full_name: z.string(),
  phone: z.string(),
  address: z.string().nullable(),
  role: userRoleEnum,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Training program schema
export const trainingProgramSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  duration_hours: z.number().int(),
  price: z.number(),
  max_participants: z.number().int(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type TrainingProgram = z.infer<typeof trainingProgramSchema>;

// Registration schema
export const registrationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  program_id: z.number(),
  status: registrationStatusEnum,
  registration_date: z.coerce.date(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Registration = z.infer<typeof registrationSchema>;

// Payment schema
export const paymentSchema = z.object({
  id: z.number(),
  registration_id: z.number(),
  amount: z.number(),
  payment_method: paymentMethodEnum,
  payment_status: paymentStatusEnum,
  payment_date: z.coerce.date().nullable(),
  transaction_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Payment = z.infer<typeof paymentSchema>;

// Document schema
export const documentSchema = z.object({
  id: z.number(),
  registration_id: z.number(),
  document_type: z.string(),
  file_path: z.string(),
  file_name: z.string(),
  status: documentStatusEnum,
  verified_by: z.number().nullable(),
  verified_at: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Document = z.infer<typeof documentSchema>;

// Training schedule schema
export const trainingScheduleSchema = z.object({
  id: z.number(),
  program_id: z.number(),
  session_title: z.string(),
  session_date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string().nullable(),
  materials: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type TrainingSchedule = z.infer<typeof trainingScheduleSchema>;

// Input schemas for creating records
export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  phone: z.string(),
  address: z.string().nullable(),
  role: userRoleEnum.default('student')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createTrainingProgramInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  duration_hours: z.number().int().positive(),
  price: z.number().nonnegative(),
  max_participants: z.number().int().positive(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  is_active: z.boolean().default(true)
});

export type CreateTrainingProgramInput = z.infer<typeof createTrainingProgramInputSchema>;

export const createRegistrationInputSchema = z.object({
  user_id: z.number(),
  program_id: z.number(),
  notes: z.string().nullable()
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationInputSchema>;

export const createPaymentInputSchema = z.object({
  registration_id: z.number(),
  amount: z.number().positive(),
  payment_method: paymentMethodEnum,
  transaction_id: z.string().nullable(),
  notes: z.string().nullable()
});

export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;

export const createDocumentInputSchema = z.object({
  registration_id: z.number(),
  document_type: z.string(),
  file_path: z.string(),
  file_name: z.string()
});

export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;

export const createTrainingScheduleInputSchema = z.object({
  program_id: z.number(),
  session_title: z.string(),
  session_date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string().nullable(),
  materials: z.string().nullable()
});

export type CreateTrainingScheduleInput = z.infer<typeof createTrainingScheduleInputSchema>;

// Update schemas
export const updateRegistrationStatusInputSchema = z.object({
  id: z.number(),
  status: registrationStatusEnum,
  notes: z.string().nullable()
});

export type UpdateRegistrationStatusInput = z.infer<typeof updateRegistrationStatusInputSchema>;

export const updatePaymentStatusInputSchema = z.object({
  id: z.number(),
  payment_status: paymentStatusEnum,
  payment_date: z.coerce.date().nullable(),
  transaction_id: z.string().nullable(),
  notes: z.string().nullable()
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusInputSchema>;

export const updateDocumentStatusInputSchema = z.object({
  id: z.number(),
  status: documentStatusEnum,
  verified_by: z.number().nullable(),
  notes: z.string().nullable()
});

export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusInputSchema>;

// Query schemas
export const getUserRegistrationsInputSchema = z.object({
  user_id: z.number()
});

export type GetUserRegistrationsInput = z.infer<typeof getUserRegistrationsInputSchema>;

export const getTrainingScheduleInputSchema = z.object({
  program_id: z.number()
});

export type GetTrainingScheduleInput = z.infer<typeof getTrainingScheduleInputSchema>;
