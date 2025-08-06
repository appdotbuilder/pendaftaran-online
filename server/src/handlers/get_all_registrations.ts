
import { db } from '../db';
import { registrationsTable, usersTable, trainingProgramsTable } from '../db/schema';
import { type Registration } from '../schema';
import { eq } from 'drizzle-orm';

export async function getAllRegistrations(): Promise<Registration[]> {
  try {
    // Get all registrations with joined user and program data
    const results = await db.select({
      // Registration fields
      id: registrationsTable.id,
      user_id: registrationsTable.user_id,
      program_id: registrationsTable.program_id,
      status: registrationsTable.status,
      registration_date: registrationsTable.registration_date,
      notes: registrationsTable.notes,
      created_at: registrationsTable.created_at,
      updated_at: registrationsTable.updated_at,
    })
      .from(registrationsTable)
      .innerJoin(usersTable, eq(registrationsTable.user_id, usersTable.id))
      .innerJoin(trainingProgramsTable, eq(registrationsTable.program_id, trainingProgramsTable.id))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch all registrations:', error);
    throw error;
  }
}
