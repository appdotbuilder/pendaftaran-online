
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, trainingProgramsTable, registrationsTable } from '../db/schema';
import { type UpdateRegistrationStatusInput } from '../schema';
import { updateRegistrationStatus } from '../handlers/update_registration_status';
import { eq } from 'drizzle-orm';

describe('updateRegistrationStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update registration status and notes', async () => {
    // Create user first
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        role: 'student'
      })
      .returning()
      .execute();

    // Create training program
    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test program',
        duration_hours: 40,
        price: '1000.00',
        max_participants: 20,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
      .returning()
      .execute();

    // Create registration
    const registration = await db.insert(registrationsTable)
      .values({
        user_id: user[0].id,
        program_id: program[0].id,
        notes: 'Initial notes'
      })
      .returning()
      .execute();

    const updateInput: UpdateRegistrationStatusInput = {
      id: registration[0].id,
      status: 'verified',
      notes: 'Updated notes'
    };

    const result = await updateRegistrationStatus(updateInput);

    expect(result.id).toEqual(registration[0].id);
    expect(result.status).toEqual('verified');
    expect(result.notes).toEqual('Updated notes');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(registration[0].updated_at.getTime());
  });

  it('should save updated status to database', async () => {
    // Create user first
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        role: 'student'
      })
      .returning()
      .execute();

    // Create training program
    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test program',
        duration_hours: 40,
        price: '1000.00',
        max_participants: 20,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
      .returning()
      .execute();

    // Create registration
    const registration = await db.insert(registrationsTable)
      .values({
        user_id: user[0].id,
        program_id: program[0].id,
        notes: 'Initial notes'
      })
      .returning()
      .execute();

    const updateInput: UpdateRegistrationStatusInput = {
      id: registration[0].id,
      status: 'completed',
      notes: 'Training completed successfully'
    };

    await updateRegistrationStatus(updateInput);

    // Verify in database
    const updatedRegistration = await db.select()
      .from(registrationsTable)
      .where(eq(registrationsTable.id, registration[0].id))
      .execute();

    expect(updatedRegistration).toHaveLength(1);
    expect(updatedRegistration[0].status).toEqual('completed');
    expect(updatedRegistration[0].notes).toEqual('Training completed successfully');
    expect(updatedRegistration[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update status with null notes', async () => {
    // Create user first
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        role: 'student'
      })
      .returning()
      .execute();

    // Create training program
    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test program',
        duration_hours: 40,
        price: '1000.00',
        max_participants: 20,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
      .returning()
      .execute();

    // Create registration
    const registration = await db.insert(registrationsTable)
      .values({
        user_id: user[0].id,
        program_id: program[0].id,
        notes: 'Initial notes'
      })
      .returning()
      .execute();

    const updateInput: UpdateRegistrationStatusInput = {
      id: registration[0].id,
      status: 'rejected',
      notes: null
    };

    const result = await updateRegistrationStatus(updateInput);

    expect(result.status).toEqual('rejected');
    expect(result.notes).toBeNull();
  });

  it('should throw error for non-existent registration', async () => {
    const updateInput: UpdateRegistrationStatusInput = {
      id: 999,
      status: 'verified',
      notes: 'Should not work'
    };

    expect(updateRegistrationStatus(updateInput)).rejects.toThrow(/not found/i);
  });
});
