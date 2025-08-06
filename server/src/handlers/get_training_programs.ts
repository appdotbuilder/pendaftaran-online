
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type TrainingProgram } from '../schema';
import { eq } from 'drizzle-orm';

export const getTrainingPrograms = async (): Promise<TrainingProgram[]> => {
  try {
    // Query only active training programs
    const result = await db.select()
      .from(trainingProgramsTable)
      .where(eq(trainingProgramsTable.is_active, true))
      .execute();

    // Convert numeric fields back to numbers before returning
    return result.map(program => ({
      ...program,
      price: parseFloat(program.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch training programs:', error);
    throw error;
  }
};
