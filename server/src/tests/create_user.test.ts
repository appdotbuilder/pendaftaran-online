
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateUserInput = {
  email: 'test@example.com',
  password: 'password123',
  full_name: 'John Doe',
  phone: '+1234567890',
  address: '123 Test Street',
  role: 'student'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.password).toEqual('password123');
    expect(result.full_name).toEqual('John Doe');
    expect(result.phone).toEqual('+1234567890');
    expect(result.address).toEqual('123 Test Street');
    expect(result.role).toEqual('student');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].full_name).toEqual('John Doe');
    expect(users[0].phone).toEqual('+1234567890');
    expect(users[0].address).toEqual('123 Test Street');
    expect(users[0].role).toEqual('student');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should apply default role when not specified', async () => {
    const inputWithoutRole = {
      email: 'student@example.com',
      password: 'password123',
      full_name: 'Jane Smith',
      phone: '+9876543210',
      address: null,
      role: 'student' as const // Default from Zod schema
    };

    const result = await createUser(inputWithoutRole);

    expect(result.role).toEqual('student');
    expect(result.address).toBeNull();
  });

  it('should create admin user', async () => {
    const adminInput: CreateUserInput = {
      ...testInput,
      email: 'admin@example.com',
      role: 'admin'
    };

    const result = await createUser(adminInput);

    expect(result.role).toEqual('admin');
    expect(result.email).toEqual('admin@example.com');
  });

  it('should handle null address', async () => {
    const inputWithNullAddress: CreateUserInput = {
      ...testInput,
      address: null
    };

    const result = await createUser(inputWithNullAddress);

    expect(result.address).toBeNull();

    // Verify in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users[0].address).toBeNull();
  });
});
