
import { db } from '../db';
import { paymentsTable } from '../db/schema';
import { type UpdatePaymentStatusInput, type Payment } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePaymentStatus = async (input: UpdatePaymentStatusInput): Promise<Payment> => {
  try {
    // Build update data object, only including provided fields
    const updateData: any = {
      payment_status: input.payment_status,
      updated_at: new Date()
    };

    // Include optional fields if provided
    if (input.payment_date !== undefined) {
      updateData.payment_date = input.payment_date;
    }
    if (input.transaction_id !== undefined) {
      updateData.transaction_id = input.transaction_id;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    // Update payment record
    const result = await db.update(paymentsTable)
      .set(updateData)
      .where(eq(paymentsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Payment with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const payment = result[0];
    return {
      ...payment,
      amount: parseFloat(payment.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Payment status update failed:', error);
    throw error;
  }
};
