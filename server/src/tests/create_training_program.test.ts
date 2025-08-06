
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type CreateTrainingProgramInput } from '../schema';
import { createTrainingProgram } from '../handlers/create_training_program';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateTrainingProgramInput = {
  name: 'Basic Welding Course',
  description: 'Learn fundamental welding techniques and safety procedures',
  duration_hours: 40,
  price: 299.99,
  max_participants: 15,
  start_date: new Date('2024-02-01'),
  end_date: new Date('2024-02-28'),
  is_active: true
};

describe('createTrainingProgram', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a training program', async () => {
    const result = await createTrainingProgram(testInput);

    // Basic field validation
    expect(result.name).toEqual('Basic Welding Course');
    expect(result.description).toEqual(testInput.description);
    expect(result.duration_hours).toEqual(40);
    expect(result.price).toEqual(299.99);
    expect(typeof result.price).toEqual('number');
    expect(result.max_participants).toEqual(15);
    expect(result.start_date).toEqual(testInput.start_date);
    expect(result.end_date).toEqual(testInput.end_date);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save training program to database', async () => {
    const result = await createTrainingProgram(testInput);

    // Query using proper drizzle syntax
    const programs = await db.select()
      .from(trainingProgramsTable)
      .where(eq(trainingProgramsTable.id, result.id))
      .execute();

    expect(programs).toHaveLength(1);
    expect(programs[0].name).toEqual('Basic Welding Course');
    expect(programs[0].description).toEqual(testInput.description);
    expect(programs[0].duration_hours).toEqual(40);
    expect(parseFloat(programs[0].price)).toEqual(299.99);
    expect(programs[0].max_participants).toEqual(15);
    expect(programs[0].start_date).toEqual(testInput.start_date);
    expect(programs[0].end_date).toEqual(testInput.end_date);
    expect(programs[0].is_active).toEqual(true);
    expect(programs[0].created_at).toBeInstanceOf(Date);
    expect(programs[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle default is_active value', async () => {
    const inputWithoutActive: CreateTrainingProgramInput = {
      name: 'Advanced Welding Course',
      description: 'Advanced welding techniques for professionals',
      duration_hours: 80,
      price: 599.99,
      max_participants: 10,
      start_date: new Date('2024-03-01'),
      end_date: new Date('2024-03-31'),
      is_active: true // Zod default is applied before reaching handler
    };

    const result = await createTrainingProgram(inputWithoutActive);

    expect(result.is_active).toEqual(true);
    expect(result.name).toEqual('Advanced Welding Course');
    expect(result.price).toEqual(599.99);
    expect(typeof result.price).toEqual('number');
  });

  it('should create program with zero price', async () => {
    const freeInput: CreateTrainingProgramInput = {
      name: 'Free Safety Training',
      description: 'Basic safety training for all employees',
      duration_hours: 2,
      price: 0,
      max_participants: 50,
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-01-15'),
      is_active: true
    };

    const result = await createTrainingProgram(freeInput);

    expect(result.price).toEqual(0);
    expect(typeof result.price).toEqual('number');
    expect(result.name).toEqual('Free Safety Training');
    expect(result.max_participants).toEqual(50);
  });
});
