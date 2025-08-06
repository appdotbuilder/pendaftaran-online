
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, trainingProgramsTable, registrationsTable, paymentsTable } from '../db/schema';
import { type CreateUserInput, type CreateTrainingProgramInput, type CreateRegistrationInput, type CreatePaymentInput, type UpdatePaymentStatusInput } from '../schema';
import { updatePaymentStatus } from '../handlers/update_payment_status';
import { eq } from 'drizzle-orm';

// Test data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  password: 'password123',
  full_name: 'Test User',
  phone: '1234567890',
  address: '123 Test Street',
  role: 'student'
};

const testProgram: CreateTrainingProgramInput = {
  name: 'Test Program',
  description: 'A test training program',
  duration_hours: 40,
  price: 500.00,
  max_participants: 20,
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-31'),
  is_active: true
};

const testPayment: CreatePaymentInput = {
  registration_id: 0, // Will be set after creating registration
  amount: 500.00,
  payment_method: 'bank_transfer',
  transaction_id: 'TXN123',
  notes: 'Initial payment'
};

describe('updatePaymentStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update payment status', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create training program
    const programResult = await db.insert(trainingProgramsTable)
      .values({
        ...testProgram,
        price: testProgram.price.toString()
      })
      .returning()
      .execute();
    const programId = programResult[0].id;

    // Create registration
    const registrationResult = await db.insert(registrationsTable)
      .values({
        user_id: userId,
        program_id: programId,
        notes: null
      })
      .returning()
      .execute();
    const registrationId = registrationResult[0].id;

    // Create payment
    const paymentResult = await db.insert(paymentsTable)
      .values({
        ...testPayment,
        registration_id: registrationId,
        amount: testPayment.amount.toString()
      })
      .returning()
      .execute();
    const paymentId = paymentResult[0].id;

    // Update payment status
    const updateInput: UpdatePaymentStatusInput = {
      id: paymentId,
      payment_status: 'paid',
      payment_date: new Date('2024-01-15'),
      transaction_id: 'TXN456',
      notes: 'Payment confirmed'
    };

    const result = await updatePaymentStatus(updateInput);

    // Verify returned data
    expect(result.id).toEqual(paymentId);
    expect(result.payment_status).toEqual('paid');
    expect(result.payment_date).toEqual(new Date('2024-01-15'));
    expect(result.transaction_id).toEqual('TXN456');
    expect(result.notes).toEqual('Payment confirmed');
    expect(result.amount).toEqual(500.00);
    expect(typeof result.amount).toBe('number');
  });

  it('should save updated payment to database', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create training program
    const programResult = await db.insert(trainingProgramsTable)
      .values({
        ...testProgram,
        price: testProgram.price.toString()
      })
      .returning()
      .execute();
    const programId = programResult[0].id;

    // Create registration
    const registrationResult = await db.insert(registrationsTable)
      .values({
        user_id: userId,
        program_id: programId,
        notes: null
      })
      .returning()
      .execute();
    const registrationId = registrationResult[0].id;

    // Create payment
    const paymentResult = await db.insert(paymentsTable)
      .values({
        ...testPayment,
        registration_id: registrationId,
        amount: testPayment.amount.toString()
      })
      .returning()
      .execute();
    const paymentId = paymentResult[0].id;

    // Update payment status
    const updateInput: UpdatePaymentStatusInput = {
      id: paymentId,
      payment_status: 'paid',
      payment_date: new Date('2024-01-15'),
      transaction_id: 'TXN456',
      notes: 'Payment confirmed'
    };

    await updatePaymentStatus(updateInput);

    // Verify database was updated
    const payments = await db.select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentId))
      .execute();

    expect(payments).toHaveLength(1);
    const payment = payments[0];
    expect(payment.payment_status).toEqual('paid');
    expect(payment.payment_date).toEqual(new Date('2024-01-15'));
    expect(payment.transaction_id).toEqual('TXN456');
    expect(payment.notes).toEqual('Payment confirmed');
    expect(parseFloat(payment.amount)).toEqual(500.00);
  });

  it('should update only provided fields', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create training program
    const programResult = await db.insert(trainingProgramsTable)
      .values({
        ...testProgram,
        price: testProgram.price.toString()
      })
      .returning()
      .execute();
    const programId = programResult[0].id;

    // Create registration
    const registrationResult = await db.insert(registrationsTable)
      .values({
        user_id: userId,
        program_id: programId,
        notes: null
      })
      .returning()
      .execute();
    const registrationId = registrationResult[0].id;

    // Create payment
    const paymentResult = await db.insert(paymentsTable)
      .values({
        ...testPayment,
        registration_id: registrationId,
        amount: testPayment.amount.toString()
      })
      .returning()
      .execute();
    const paymentId = paymentResult[0].id;

    // Update only payment status
    const updateInput: UpdatePaymentStatusInput = {
      id: paymentId,
      payment_status: 'failed',
      payment_date: null,
      transaction_id: null,
      notes: null
    };

    const result = await updatePaymentStatus(updateInput);

    // Verify only status was updated, other fields preserved
    expect(result.payment_status).toEqual('failed');
    expect(result.payment_date).toBeNull();
    expect(result.transaction_id).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.registration_id).toEqual(registrationId);
    expect(result.amount).toEqual(500.00);
  });

  it('should throw error when payment not found', async () => {
    const updateInput: UpdatePaymentStatusInput = {
      id: 999,
      payment_status: 'paid',
      payment_date: new Date(),
      transaction_id: 'TXN123',
      notes: 'Test note'
    };

    await expect(updatePaymentStatus(updateInput)).rejects.toThrow(/payment with id 999 not found/i);
  });
});
