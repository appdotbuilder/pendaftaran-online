
import { db } from '../db';
import { registrationsTable } from '../db/schema';
import { type CreateRegistrationInput, type Registration } from '../schema';

export const createRegistration = async (input: CreateRegistrationInput): Promise<Registration> => {
  try {
    // Insert registration record
    const result = await db.insert(registrationsTable)
      .values({
        user_id: input.user_id,
        program_id: input.program_id,
        notes: input.notes
      })
      .returning()
      .execute();

    const registration = result[0];
    return registration;
  } catch (error) {
    console.error('Registration creation failed:', error);
    throw error;
  }
};
