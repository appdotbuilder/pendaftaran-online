
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { registrationsTable, usersTable, trainingProgramsTable } from '../db/schema';
import { type CreateRegistrationInput } from '../schema';
import { createRegistration } from '../handlers/create_registration';
import { eq } from 'drizzle-orm';

// Test input
const testInput: CreateRegistrationInput = {
  user_id: 1,
  program_id: 1,
  notes: 'Test registration notes'
};

describe('createRegistration', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a registration', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        address: 'Test Address',
        role: 'student'
      })
      .execute();

    // Create prerequisite training program
    await db.insert(trainingProgramsTable)
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
      .execute();

    const result = await createRegistration(testInput);

    // Basic field validation
    expect(result.user_id).toEqual(1);
    expect(result.program_id).toEqual(1);
    expect(result.status).toEqual('pending');
    expect(result.notes).toEqual('Test registration notes');
    expect(result.id).toBeDefined();
    expect(result.registration_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save registration to database', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        address: 'Test Address',
        role: 'student'
      })
      .execute();

    // Create prerequisite training program
    await db.insert(trainingProgramsTable)
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
      .execute();

    const result = await createRegistration(testInput);

    // Query using proper drizzle syntax
    const registrations = await db.select()
      .from(registrationsTable)
      .where(eq(registrationsTable.id, result.id))
      .execute();

    expect(registrations).toHaveLength(1);
    expect(registrations[0].user_id).toEqual(1);
    expect(registrations[0].program_id).toEqual(1);
    expect(registrations[0].status).toEqual('pending');
    expect(registrations[0].notes).toEqual('Test registration notes');
    expect(registrations[0].registration_date).toBeInstanceOf(Date);
    expect(registrations[0].created_at).toBeInstanceOf(Date);
    expect(registrations[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create registration with null notes', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        address: 'Test Address',
        role: 'student'
      })
      .execute();

    // Create prerequisite training program
    await db.insert(trainingProgramsTable)
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
      .execute();

    const inputWithNullNotes: CreateRegistrationInput = {
      user_id: 1,
      program_id: 1,
      notes: null
    };

    const result = await createRegistration(inputWithNullNotes);

    expect(result.notes).toBeNull();
    expect(result.user_id).toEqual(1);
    expect(result.program_id).toEqual(1);
    expect(result.status).toEqual('pending');
  });

  it('should fail when user does not exist', async () => {
    // Create prerequisite training program only
    await db.insert(trainingProgramsTable)
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
      .execute();

    await expect(createRegistration(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should fail when training program does not exist', async () => {
    // Create prerequisite user only
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        address: 'Test Address',
        role: 'student'
      })
      .execute();

    await expect(createRegistration(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
