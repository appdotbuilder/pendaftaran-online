
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, trainingProgramsTable, registrationsTable, paymentsTable } from '../db/schema';
import { getAllPayments } from '../handlers/get_all_payments';

describe('getAllPayments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no payments exist', async () => {
    const result = await getAllPayments();
    expect(result).toEqual([]);
  });

  it('should return all payments', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        address: '123 Test St',
        role: 'student'
      })
      .returning()
      .execute();

    const programResult = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test program',
        duration_hours: 40,
        price: '999.99',
        max_participants: 20,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
        is_active: true
      })
      .returning()
      .execute();

    const registrationResult = await db.insert(registrationsTable)
      .values({
        user_id: userResult[0].id,
        program_id: programResult[0].id,
        status: 'pending',
        notes: 'Test registration'
      })
      .returning()
      .execute();

    // Create test payments
    await db.insert(paymentsTable)
      .values([
        {
          registration_id: registrationResult[0].id,
          amount: '500.00',
          payment_method: 'credit_card',
          payment_status: 'paid',
          payment_date: new Date('2024-01-15'),
          transaction_id: 'txn_001',
          notes: 'First payment'
        },
        {
          registration_id: registrationResult[0].id,
          amount: '250.50',
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          payment_date: null,
          transaction_id: null,
          notes: 'Second payment'
        }
      ])
      .execute();

    const result = await getAllPayments();

    expect(result).toHaveLength(2);

    // Check first payment
    const firstPayment = result.find(p => p.transaction_id === 'txn_001');
    expect(firstPayment).toBeDefined();
    expect(firstPayment!.registration_id).toEqual(registrationResult[0].id);
    expect(firstPayment!.amount).toEqual(500.00);
    expect(typeof firstPayment!.amount).toBe('number');
    expect(firstPayment!.payment_method).toEqual('credit_card');
    expect(firstPayment!.payment_status).toEqual('paid');
    expect(firstPayment!.payment_date).toBeInstanceOf(Date);
    expect(firstPayment!.notes).toEqual('First payment');
    expect(firstPayment!.id).toBeDefined();
    expect(firstPayment!.created_at).toBeInstanceOf(Date);
    expect(firstPayment!.updated_at).toBeInstanceOf(Date);

    // Check second payment
    const secondPayment = result.find(p => p.notes === 'Second payment');
    expect(secondPayment).toBeDefined();
    expect(secondPayment!.amount).toEqual(250.50);
    expect(typeof secondPayment!.amount).toBe('number');
    expect(secondPayment!.payment_method).toEqual('bank_transfer');
    expect(secondPayment!.payment_status).toEqual('pending');
    expect(secondPayment!.payment_date).toBeNull();
    expect(secondPayment!.transaction_id).toBeNull();
  });

  it('should handle multiple payments with different statuses', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'admin@example.com',
        password: 'adminpass',
        full_name: 'Admin User',
        phone: '9876543210',
        address: null,
        role: 'admin'
      })
      .returning()
      .execute();

    const programResult = await db.insert(trainingProgramsTable)
      .values({
        name: 'Advanced Training',
        description: 'Advanced level training program',
        duration_hours: 80,
        price: '1500.00',
        max_participants: 15,
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-28'),
        is_active: true
      })
      .returning()
      .execute();

    const registrationResult = await db.insert(registrationsTable)
      .values({
        user_id: userResult[0].id,
        program_id: programResult[0].id,
        status: 'verified',
        notes: null
      })
      .returning()
      .execute();

    // Create payments with different statuses
    await db.insert(paymentsTable)
      .values([
        {
          registration_id: registrationResult[0].id,
          amount: '1500.00',
          payment_method: 'e_wallet',
          payment_status: 'failed',
          payment_date: new Date('2024-01-20'),
          transaction_id: 'failed_001',
          notes: 'Payment failed due to insufficient funds'
        },
        {
          registration_id: registrationResult[0].id,
          amount: '1500.00',
          payment_method: 'credit_card',
          payment_status: 'refunded',
          payment_date: new Date('2024-01-25'),
          transaction_id: 'refund_001',
          notes: 'Refunded due to program cancellation'
        }
      ])
      .execute();

    const result = await getAllPayments();

    expect(result).toHaveLength(2);

    // Verify different payment statuses
    const failedPayment = result.find(p => p.payment_status === 'failed');
    expect(failedPayment).toBeDefined();
    expect(failedPayment!.amount).toEqual(1500.00);
    expect(failedPayment!.payment_method).toEqual('e_wallet');

    const refundedPayment = result.find(p => p.payment_status === 'refunded');
    expect(refundedPayment).toBeDefined();
    expect(refundedPayment!.amount).toEqual(1500.00);
    expect(refundedPayment!.payment_method).toEqual('credit_card');
  });
});
