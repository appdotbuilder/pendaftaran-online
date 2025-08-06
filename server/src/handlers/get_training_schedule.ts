
import { db } from '../db';
import { trainingSchedulesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetTrainingScheduleInput, type TrainingSchedule } from '../schema';

export async function getTrainingSchedule(input: GetTrainingScheduleInput): Promise<TrainingSchedule[]> {
  try {
    const results = await db.select()
      .from(trainingSchedulesTable)
      .where(eq(trainingSchedulesTable.program_id, input.program_id))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch training schedule:', error);
    throw error;
  }
}
