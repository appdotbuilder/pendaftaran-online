
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type CreateTrainingProgramInput, type TrainingProgram } from '../schema';

export const createTrainingProgram = async (input: CreateTrainingProgramInput): Promise<TrainingProgram> => {
  try {
    // Insert training program record
    const result = await db.insert(trainingProgramsTable)
      .values({
        name: input.name,
        description: input.description,
        duration_hours: input.duration_hours,
        price: input.price.toString(), // Convert number to string for numeric column
        max_participants: input.max_participants,
        start_date: input.start_date,
        end_date: input.end_date,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const program = result[0];
    return {
      ...program,
      price: parseFloat(program.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Training program creation failed:', error);
    throw error;
  }
};
