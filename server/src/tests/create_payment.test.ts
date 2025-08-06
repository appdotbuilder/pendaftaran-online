
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { paymentsTable, registrationsTable, usersTable, trainingProgramsTable } from '../db/schema';
import { type CreatePaymentInput } from '../schema';
import { createPayment } from '../handlers/create_payment';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  full_name: 'Test User',
  phone: '1234567890',
  address: '123 Test St',
  role: 'student' as const
};

const testProgram = {
  name: 'Test Training Program',
  description: 'A test training program',
  duration_hours: 40,
  price: '1000.00',
  max_participants: 20,
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-31'),
  is_active: true
};

const testRegistration = {
  user_id: 0, // Will be set after user creation
  program_id: 0, // Will be set after program creation
  status: 'pending' as const,
  notes: 'Test registration'
};

describe('createPayment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let registrationId: number;

  beforeEach(async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create training program
    const programResult = await db.insert(trainingProgramsTable)
      .values(testProgram)
      .returning()
      .execute();

    // Create registration
    const registrationResult = await db.insert(registrationsTable)
      .values({
        ...testRegistration,
        user_id: userResult[0].id,
        program_id: programResult[0].id
      })
      .returning()
      .execute();

    registrationId = registrationResult[0].id;
  });

  it('should create a payment', async () => {
    const testInput: CreatePaymentInput = {
      registration_id: registrationId,
      amount: 1000.00,
      payment_method: 'bank_transfer',
      transaction_id: 'TXN-123456',
      notes: 'Test payment'
    };

    const result = await createPayment(testInput);

    // Basic field validation
    expect(result.registration_id).toEqual(registrationId);
    expect(result.amount).toEqual(1000.00);
    expect(typeof result.amount).toBe('number');
    expect(result.payment_method).toEqual('bank_transfer');
    expect(result.payment_status).toEqual('pending');
    expect(result.payment_date).toBeNull();
    expect(result.transaction_id).toEqual('TXN-123456');
    expect(result.notes).toEqual('Test payment');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save payment to database', async () => {
    const testInput: CreatePaymentInput = {
      registration_id: registrationId,
      amount: 500.50,
      payment_method: 'credit_card',
      transaction_id: null,
      notes: null
    };

    const result = await createPayment(testInput);

    // Query database to verify payment was saved
    const payments = await db.select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, result.id))
      .execute();

    expect(payments).toHaveLength(1);
    expect(payments[0].registration_id).toEqual(registrationId);
    expect(parseFloat(payments[0].amount)).toEqual(500.50);
    expect(payments[0].payment_method).toEqual('credit_card');
    expect(payments[0].payment_status).toEqual('pending');
    expect(payments[0].transaction_id).toBeNull();
    expect(payments[0].notes).toBeNull();
    expect(payments[0].created_at).toBeInstanceOf(Date);
    expect(payments[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent registration', async () => {
    const testInput: CreatePaymentInput = {
      registration_id: 99999, // Non-existent registration ID
      amount: 1000.00,
      payment_method: 'bank_transfer',
      transaction_id: 'TXN-123456',
      notes: 'Test payment'
    };

    await expect(createPayment(testInput)).rejects.toThrow(/registration not found/i);
  });

  it('should handle different payment methods', async () => {
    const paymentMethods = ['bank_transfer', 'credit_card', 'e_wallet', 'cash'] as const;

    for (const method of paymentMethods) {
      const testInput: CreatePaymentInput = {
        registration_id: registrationId,
        amount: 100.00,
        payment_method: method,
        transaction_id: `TXN-${method}`,
        notes: `Payment via ${method}`
      };

      const result = await createPayment(testInput);
      expect(result.payment_method).toEqual(method);
      expect(result.transaction_id).toEqual(`TXN-${method}`);
    }
  });
});
