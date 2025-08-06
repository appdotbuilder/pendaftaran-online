
import { db } from '../db';
import { paymentsTable, registrationsTable } from '../db/schema';
import { type CreatePaymentInput, type Payment } from '../schema';
import { eq } from 'drizzle-orm';

export const createPayment = async (input: CreatePaymentInput): Promise<Payment> => {
  try {
    // Verify registration exists
    const existingRegistration = await db.select()
      .from(registrationsTable)
      .where(eq(registrationsTable.id, input.registration_id))
      .execute();

    if (existingRegistration.length === 0) {
      throw new Error('Registration not found');
    }

    // Insert payment record
    const result = await db.insert(paymentsTable)
      .values({
        registration_id: input.registration_id,
        amount: input.amount.toString(), // Convert number to string for numeric column
        payment_method: input.payment_method,
        payment_status: 'pending', // Default status
        payment_date: null, // Will be set when payment is completed
        transaction_id: input.transaction_id,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const payment = result[0];
    return {
      ...payment,
      amount: parseFloat(payment.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw error;
  }
};
