
import { db } from '../db';
import { registrationsTable } from '../db/schema';
import { type GetUserRegistrationsInput, type Registration } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserRegistrations = async (input: GetUserRegistrationsInput): Promise<Registration[]> => {
  try {
    const results = await db.select()
      .from(registrationsTable)
      .where(eq(registrationsTable.user_id, input.user_id))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get user registrations:', error);
    throw error;
  }
};
