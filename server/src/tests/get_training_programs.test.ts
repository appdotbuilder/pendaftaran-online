
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type CreateTrainingProgramInput } from '../schema';
import { getTrainingPrograms } from '../handlers/get_training_programs';

// Test training program inputs
const activeProgram: CreateTrainingProgramInput = {
  name: 'Active Training Program',
  description: 'An active training program for testing',
  duration_hours: 40,
  price: 999.99,
  max_participants: 20,
  start_date: new Date('2024-06-01'),
  end_date: new Date('2024-06-30'),
  is_active: true
};

const inactiveProgram: CreateTrainingProgramInput = {
  name: 'Inactive Training Program',
  description: 'An inactive training program for testing',
  duration_hours: 30,
  price: 599.99,
  max_participants: 15,
  start_date: new Date('2024-07-01'),
  end_date: new Date('2024-07-31'),
  is_active: false
};

describe('getTrainingPrograms', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no training programs exist', async () => {
    const result = await getTrainingPrograms();

    expect(result).toEqual([]);
  });

  it('should return only active training programs', async () => {
    // Create both active and inactive programs
    await db.insert(trainingProgramsTable)
      .values([
        {
          ...activeProgram,
          price: activeProgram.price.toString()
        },
        {
          ...inactiveProgram,
          price: inactiveProgram.price.toString()
        }
      ])
      .execute();

    const result = await getTrainingPrograms();

    // Should only return the active program
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Active Training Program');
    expect(result[0].description).toEqual(activeProgram.description);
    expect(result[0].duration_hours).toEqual(40);
    expect(result[0].price).toEqual(999.99);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].max_participants).toEqual(20);
    expect(result[0].is_active).toBe(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple active training programs', async () => {
    const secondActiveProgram: CreateTrainingProgramInput = {
      name: 'Second Active Program',
      description: 'Another active training program',
      duration_hours: 60,
      price: 1299.99,
      max_participants: 25,
      start_date: new Date('2024-08-01'),
      end_date: new Date('2024-08-31'),
      is_active: true
    };

    // Create multiple active programs and one inactive
    await db.insert(trainingProgramsTable)
      .values([
        {
          ...activeProgram,
          price: activeProgram.price.toString()
        },
        {
          ...secondActiveProgram,
          price: secondActiveProgram.price.toString()
        },
        {
          ...inactiveProgram,
          price: inactiveProgram.price.toString()
        }
      ])
      .execute();

    const result = await getTrainingPrograms();

    // Should return only the 2 active programs
    expect(result).toHaveLength(2);
    
    // Check that all returned programs are active
    result.forEach(program => {
      expect(program.is_active).toBe(true);
      expect(typeof program.price).toBe('number');
      expect(program.id).toBeDefined();
      expect(program.created_at).toBeInstanceOf(Date);
      expect(program.updated_at).toBeInstanceOf(Date);
    });

    // Check specific program names
    const programNames = result.map(p => p.name);
    expect(programNames).toContain('Active Training Program');
    expect(programNames).toContain('Second Active Program');
    expect(programNames).not.toContain('Inactive Training Program');
  });

  it('should correctly convert numeric price field', async () => {
    await db.insert(trainingProgramsTable)
      .values({
        ...activeProgram,
        price: activeProgram.price.toString()
      })
      .execute();

    const result = await getTrainingPrograms();

    expect(result).toHaveLength(1);
    expect(result[0].price).toEqual(999.99);
    expect(typeof result[0].price).toBe('number');
  });
});
