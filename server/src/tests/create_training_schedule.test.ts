
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trainingSchedulesTable, trainingProgramsTable } from '../db/schema';
import { type CreateTrainingScheduleInput } from '../schema';
import { createTrainingSchedule } from '../handlers/create_training_schedule';
import { eq } from 'drizzle-orm';

describe('createTrainingSchedule', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let programId: number;

  beforeEach(async () => {
    // Create a training program first as prerequisite
    const programResult = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test training program',
        duration_hours: 40,
        price: '1500.00',
        max_participants: 20,
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-02-28'),
        is_active: true
      })
      .returning()
      .execute();
    
    programId = programResult[0].id;
  });

  const testInput: CreateTrainingScheduleInput = {
    program_id: 0, // Will be set in beforeEach
    session_title: 'Introduction to Testing',
    session_date: new Date('2024-02-05'),
    start_time: '09:00',
    end_time: '12:00',
    location: 'Training Room A',
    materials: 'Laptop, notebook, pen'
  };

  it('should create a training schedule', async () => {
    const input = { ...testInput, program_id: programId };
    const result = await createTrainingSchedule(input);

    // Basic field validation
    expect(result.program_id).toEqual(programId);
    expect(result.session_title).toEqual('Introduction to Testing');
    expect(result.session_date).toEqual(new Date('2024-02-05'));
    expect(result.start_time).toEqual('09:00');
    expect(result.end_time).toEqual('12:00');
    expect(result.location).toEqual('Training Room A');
    expect(result.materials).toEqual('Laptop, notebook, pen');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save training schedule to database', async () => {
    const input = { ...testInput, program_id: programId };
    const result = await createTrainingSchedule(input);

    // Query using proper drizzle syntax
    const schedules = await db.select()
      .from(trainingSchedulesTable)
      .where(eq(trainingSchedulesTable.id, result.id))
      .execute();

    expect(schedules).toHaveLength(1);
    expect(schedules[0].program_id).toEqual(programId);
    expect(schedules[0].session_title).toEqual('Introduction to Testing');
    expect(schedules[0].session_date).toEqual(new Date('2024-02-05'));
    expect(schedules[0].start_time).toEqual('09:00');
    expect(schedules[0].end_time).toEqual('12:00');
    expect(schedules[0].location).toEqual('Training Room A');
    expect(schedules[0].materials).toEqual('Laptop, notebook, pen');
    expect(schedules[0].created_at).toBeInstanceOf(Date);
    expect(schedules[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null location and materials', async () => {
    const inputWithNulls = {
      ...testInput,
      program_id: programId,
      location: null,
      materials: null
    };
    
    const result = await createTrainingSchedule(inputWithNulls);

    expect(result.location).toBeNull();
    expect(result.materials).toBeNull();
    expect(result.session_title).toEqual('Introduction to Testing');
    expect(result.program_id).toEqual(programId);
  });

  it('should throw error for non-existent program_id', async () => {
    const inputWithInvalidProgram = {
      ...testInput,
      program_id: 99999 // Non-existent program ID
    };

    expect(createTrainingSchedule(inputWithInvalidProgram))
      .rejects.toThrow(/violates foreign key constraint/i);
  });
});
