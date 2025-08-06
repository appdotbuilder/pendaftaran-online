
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trainingProgramsTable, trainingSchedulesTable } from '../db/schema';
import { type GetTrainingScheduleInput, type CreateTrainingProgramInput, type CreateTrainingScheduleInput } from '../schema';
import { getTrainingSchedule } from '../handlers/get_training_schedule';

// Test data
const testProgram: CreateTrainingProgramInput = {
  name: 'Test Program',
  description: 'A test training program',
  duration_hours: 40,
  price: 500,
  max_participants: 20,
  start_date: new Date('2024-01-15'),
  end_date: new Date('2024-01-19'),
  is_active: true
};

const testSchedule1: CreateTrainingScheduleInput = {
  program_id: 1,
  session_title: 'Introduction Session',
  session_date: new Date('2024-01-15'),
  start_time: '09:00',
  end_time: '12:00',
  location: 'Room A',
  materials: 'Slides, handouts'
};

const testSchedule2: CreateTrainingScheduleInput = {
  program_id: 1,
  session_title: 'Advanced Topics',
  session_date: new Date('2024-01-16'),
  start_time: '13:00',
  end_time: '17:00',
  location: 'Room B',
  materials: 'Workbook, exercises'
};

describe('getTrainingSchedule', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array for non-existent program', async () => {
    const input: GetTrainingScheduleInput = { program_id: 999 };
    const result = await getTrainingSchedule(input);

    expect(result).toEqual([]);
  });

  it('should return empty array for program with no schedule', async () => {
    // Create program without schedule
    await db.insert(trainingProgramsTable).values({
      ...testProgram,
      price: testProgram.price.toString()
    });

    const input: GetTrainingScheduleInput = { program_id: 1 };
    const result = await getTrainingSchedule(input);

    expect(result).toEqual([]);
  });

  it('should return single schedule session', async () => {
    // Create program
    await db.insert(trainingProgramsTable).values({
      ...testProgram,
      price: testProgram.price.toString()
    });

    // Create single schedule
    await db.insert(trainingSchedulesTable).values(testSchedule1);

    const input: GetTrainingScheduleInput = { program_id: 1 };
    const result = await getTrainingSchedule(input);

    expect(result).toHaveLength(1);
    expect(result[0].session_title).toEqual('Introduction Session');
    expect(result[0].program_id).toEqual(1);
    expect(result[0].session_date).toBeInstanceOf(Date);
    expect(result[0].start_time).toEqual('09:00');
    expect(result[0].end_time).toEqual('12:00');
    expect(result[0].location).toEqual('Room A');
    expect(result[0].materials).toEqual('Slides, handouts');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple schedule sessions ordered by id', async () => {
    // Create program
    await db.insert(trainingProgramsTable).values({
      ...testProgram,
      price: testProgram.price.toString()
    });

    // Create multiple schedules
    await db.insert(trainingSchedulesTable).values([testSchedule1, testSchedule2]);

    const input: GetTrainingScheduleInput = { program_id: 1 };
    const result = await getTrainingSchedule(input);

    expect(result).toHaveLength(2);
    expect(result[0].session_title).toEqual('Introduction Session');
    expect(result[1].session_title).toEqual('Advanced Topics');

    // Verify both belong to same program
    result.forEach(schedule => {
      expect(schedule.program_id).toEqual(1);
      expect(schedule.session_date).toBeInstanceOf(Date);
      expect(schedule.created_at).toBeInstanceOf(Date);
      expect(schedule.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should only return schedules for specified program', async () => {
    // Create two programs
    await db.insert(trainingProgramsTable).values([
      {
        ...testProgram,
        price: testProgram.price.toString()
      },
      {
        ...testProgram,
        name: 'Second Program',
        price: testProgram.price.toString()
      }
    ]);

    // Create schedules for different programs
    await db.insert(trainingSchedulesTable).values([
      testSchedule1, // program_id: 1
      {
        ...testSchedule2,
        program_id: 2 // Different program
      }
    ]);

    const input: GetTrainingScheduleInput = { program_id: 1 };
    const result = await getTrainingSchedule(input);

    expect(result).toHaveLength(1);
    expect(result[0].program_id).toEqual(1);
    expect(result[0].session_title).toEqual('Introduction Session');
  });
});
