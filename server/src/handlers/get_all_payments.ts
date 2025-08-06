
import { db } from '../db';
import { paymentsTable } from '../db/schema';
import { type Payment } from '../schema';

export async function getAllPayments(): Promise<Payment[]> {
  try {
    const results = await db.select()
      .from(paymentsTable)
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount) // Convert string back to number
    }));
  } catch (error) {
    console.error('Get all payments failed:', error);
    throw error;
  }
}
