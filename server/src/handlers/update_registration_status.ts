
import { db } from '../db';
import { registrationsTable } from '../db/schema';
import { type UpdateRegistrationStatusInput, type Registration } from '../schema';
import { eq } from 'drizzle-orm';

export const updateRegistrationStatus = async (input: UpdateRegistrationStatusInput): Promise<Registration> => {
  try {
    // Update registration record
    const result = await db.update(registrationsTable)
      .set({
        status: input.status,
        notes: input.notes,
        updated_at: new Date()
      })
      .where(eq(registrationsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Registration with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Registration status update failed:', error);
    throw error;
  }
};
