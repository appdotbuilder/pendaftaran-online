
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, trainingProgramsTable, registrationsTable } from '../db/schema';
import { getAllRegistrations } from '../handlers/get_all_registrations';

describe('getAllRegistrations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no registrations exist', async () => {
    const result = await getAllRegistrations();
    expect(result).toEqual([]);
  });

  it('should return all registrations', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890',
        address: 'Test Address',
        role: 'student'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test training program
    const programResult = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test training program',
        duration_hours: 40,
        price: '999.99',
        max_participants: 20,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
        is_active: true
      })
      .returning()
      .execute();

    const programId = programResult[0].id;

    // Create test registration
    const registrationResult = await db.insert(registrationsTable)
      .values({
        user_id: userId,
        program_id: programId,
        status: 'pending',
        notes: 'Test registration'
      })
      .returning()
      .execute();

    const result = await getAllRegistrations();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(registrationResult[0].id);
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].program_id).toEqual(programId);
    expect(result[0].status).toEqual('pending');
    expect(result[0].notes).toEqual('Test registration');
    expect(result[0].registration_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple registrations', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        password: 'password123',
        full_name: 'User One',
        phone: '1234567890',
        role: 'student'
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        password: 'password123',
        full_name: 'User Two',
        phone: '0987654321',
        role: 'student'
      })
      .returning()
      .execute();

    // Create test training program
    const programResult = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test training program',
        duration_hours: 40,
        price: '999.99',
        max_participants: 20,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
        is_active: true
      })
      .returning()
      .execute();

    const programId = programResult[0].id;

    // Create multiple registrations
    await db.insert(registrationsTable)
      .values([
        {
          user_id: user1Result[0].id,
          program_id: programId,
          status: 'pending',
          notes: 'First registration'
        },
        {
          user_id: user2Result[0].id,
          program_id: programId,
          status: 'verified',
          notes: 'Second registration'
        }
      ])
      .execute();

    const result = await getAllRegistrations();

    expect(result).toHaveLength(2);
    
    // Verify both registrations are returned
    const statuses = result.map(r => r.status);
    expect(statuses).toContain('pending');
    expect(statuses).toContain('verified');
    
    const userIds = result.map(r => r.user_id);
    expect(userIds).toContain(user1Result[0].id);
    expect(userIds).toContain(user2Result[0].id);

    // Verify all registrations have required fields
    result.forEach(registration => {
      expect(registration.id).toBeDefined();
      expect(registration.user_id).toBeDefined();
      expect(registration.program_id).toEqual(programId);
      expect(registration.registration_date).toBeInstanceOf(Date);
      expect(registration.created_at).toBeInstanceOf(Date);
      expect(registration.updated_at).toBeInstanceOf(Date);
    });
  });
});
