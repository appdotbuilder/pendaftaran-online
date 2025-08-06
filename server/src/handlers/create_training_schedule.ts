
import { db } from '../db';
import { trainingSchedulesTable } from '../db/schema';
import { type CreateTrainingScheduleInput, type TrainingSchedule } from '../schema';

export const createTrainingSchedule = async (input: CreateTrainingScheduleInput): Promise<TrainingSchedule> => {
  try {
    // Insert training schedule record
    const result = await db.insert(trainingSchedulesTable)
      .values({
        program_id: input.program_id,
        session_title: input.session_title,
        session_date: input.session_date,
        start_time: input.start_time,
        end_time: input.end_time,
        location: input.location,
        materials: input.materials
      })
      .returning()
      .execute();

    const schedule = result[0];
    return schedule;
  } catch (error) {
    console.error('Training schedule creation failed:', error);
    throw error;
  }
};
