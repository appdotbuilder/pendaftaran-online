
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, trainingProgramsTable, registrationsTable } from '../db/schema';
import { type GetUserRegistrationsInput } from '../schema';
import { getUserRegistrations } from '../handlers/get_user_registrations';

// Test input
const testInput: GetUserRegistrationsInput = {
  user_id: 1
};

describe('getUserRegistrations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when user has no registrations', async () => {
    // Create user but no registrations
    await db.insert(usersTable).values({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '1234567890',
      role: 'student'
    }).execute();

    const result = await getUserRegistrations(testInput);

    expect(result).toEqual([]);
  });

  it('should return user registrations', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '1234567890',
      role: 'student'
    }).execute();

    await db.insert(trainingProgramsTable).values({
      name: 'Test Program',
      description: 'A test training program',
      duration_hours: 40,
      price: '500.00',
      max_participants: 20,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      is_active: true
    }).execute();

    // Create registrations
    await db.insert(registrationsTable).values([
      {
        user_id: 1,
        program_id: 1,
        status: 'pending',
        notes: 'First registration'
      },
      {
        user_id: 1,
        program_id: 1,
        status: 'verified',
        notes: 'Second registration'
      }
    ]).execute();

    const result = await getUserRegistrations(testInput);

    expect(result).toHaveLength(2);
    expect(result[0].user_id).toEqual(1);
    expect(result[0].program_id).toEqual(1);
    expect(result[0].status).toEqual('pending');
    expect(result[0].notes).toEqual('First registration');
    expect(result[0].id).toBeDefined();
    expect(result[0].registration_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    
    expect(result[1].status).toEqual('verified');
    expect(result[1].notes).toEqual('Second registration');
  });

  it('should only return registrations for specified user', async () => {
    // Create two users
    await db.insert(usersTable).values([
      {
        email: 'user1@example.com',
        password: 'password123',
        full_name: 'User One',
        phone: '1234567890',
        role: 'student'
      },
      {
        email: 'user2@example.com',
        password: 'password123',
        full_name: 'User Two',
        phone: '0987654321',
        role: 'student'
      }
    ]).execute();

    await db.insert(trainingProgramsTable).values({
      name: 'Test Program',
      description: 'A test training program',
      duration_hours: 40,
      price: '500.00',
      max_participants: 20,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      is_active: true
    }).execute();

    // Create registrations for both users
    await db.insert(registrationsTable).values([
      {
        user_id: 1,
        program_id: 1,
        status: 'pending',
        notes: 'User 1 registration'
      },
      {
        user_id: 2,
        program_id: 1,
        status: 'verified',
        notes: 'User 2 registration'
      }
    ]).execute();

    const result = await getUserRegistrations({ user_id: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(1);
    expect(result[0].notes).toEqual('User 1 registration');
  });

  it('should return registrations with all required fields', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '1234567890',
      role: 'student'
    }).execute();

    await db.insert(trainingProgramsTable).values({
      name: 'Test Program',
      description: 'A test training program',
      duration_hours: 40,
      price: '500.00',
      max_participants: 20,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
      is_active: true
    }).execute();

    await db.insert(registrationsTable).values({
      user_id: 1,
      program_id: 1,
      status: 'completed',
      notes: null
    }).execute();

    const result = await getUserRegistrations(testInput);

    expect(result).toHaveLength(1);
    const registration = result[0];
    
    // Verify all required fields are present
    expect(typeof registration.id).toBe('number');
    expect(typeof registration.user_id).toBe('number');
    expect(typeof registration.program_id).toBe('number');
    expect(registration.status).toBe('completed');
    expect(registration.registration_date).toBeInstanceOf(Date);
    expect(registration.notes).toBeNull();
    expect(registration.created_at).toBeInstanceOf(Date);
    expect(registration.updated_at).toBeInstanceOf(Date);
  });
});
