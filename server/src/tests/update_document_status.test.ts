
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, trainingProgramsTable, registrationsTable, documentsTable } from '../db/schema';
import { type UpdateDocumentStatusInput } from '../schema';
import { updateDocumentStatus } from '../handlers/update_document_status';
import { eq } from 'drizzle-orm';

describe('updateDocumentStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update document status to verified with verified_by and verified_at', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable).values({
      email: 'student@test.com',
      password: 'password123',
      full_name: 'Test Student',
      phone: '1234567890',
      role: 'student'
    }).returning().execute();

    const admin = await db.insert(usersTable).values({
      email: 'admin@test.com',
      password: 'password123',
      full_name: 'Test Admin',
      phone: '0987654321',
      role: 'admin'
    }).returning().execute();

    const program = await db.insert(trainingProgramsTable).values({
      name: 'Test Program',
      description: 'A test training program',
      duration_hours: 40,
      price: '1000.00',
      max_participants: 20,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31')
    }).returning().execute();

    const registration = await db.insert(registrationsTable).values({
      user_id: user[0].id,
      program_id: program[0].id
    }).returning().execute();

    const document = await db.insert(documentsTable).values({
      registration_id: registration[0].id,
      document_type: 'certificate',
      file_path: '/uploads/test.pdf',
      file_name: 'test.pdf'
    }).returning().execute();

    const input: UpdateDocumentStatusInput = {
      id: document[0].id,
      status: 'verified',
      verified_by: admin[0].id,
      notes: 'Document verified successfully'
    };

    const result = await updateDocumentStatus(input);

    expect(result.id).toEqual(document[0].id);
    expect(result.status).toEqual('verified');
    expect(result.verified_by).toEqual(admin[0].id);
    expect(result.verified_at).toBeInstanceOf(Date);
    expect(result.notes).toEqual('Document verified successfully');
  });

  it('should update document status to rejected and clear verification fields', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable).values({
      email: 'student@test.com',
      password: 'password123',
      full_name: 'Test Student',
      phone: '1234567890',
      role: 'student'
    }).returning().execute();

    const admin = await db.insert(usersTable).values({
      email: 'admin@test.com',
      password: 'password123',
      full_name: 'Test Admin',
      phone: '0987654321',
      role: 'admin'
    }).returning().execute();

    const program = await db.insert(trainingProgramsTable).values({
      name: 'Test Program',
      description: 'A test training program',
      duration_hours: 40,
      price: '1000.00',
      max_participants: 20,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31')
    }).returning().execute();

    const registration = await db.insert(registrationsTable).values({
      user_id: user[0].id,
      program_id: program[0].id
    }).returning().execute();

    // Create document with initial verification
    const document = await db.insert(documentsTable).values({
      registration_id: registration[0].id,
      document_type: 'certificate',
      file_path: '/uploads/test.pdf',
      file_name: 'test.pdf',
      status: 'verified',
      verified_by: admin[0].id,
      verified_at: new Date()
    }).returning().execute();

    const input: UpdateDocumentStatusInput = {
      id: document[0].id,
      status: 'rejected',
      verified_by: null,
      notes: 'Document does not meet requirements'
    };

    const result = await updateDocumentStatus(input);

    expect(result.id).toEqual(document[0].id);
    expect(result.status).toEqual('rejected');
    expect(result.verified_by).toBeNull();
    expect(result.verified_at).toBeNull();
    expect(result.notes).toEqual('Document does not meet requirements');
  });

  it('should save document status update to database', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable).values({
      email: 'student@test.com',
      password: 'password123',
      full_name: 'Test Student',
      phone: '1234567890',
      role: 'student'
    }).returning().execute();

    const program = await db.insert(trainingProgramsTable).values({
      name: 'Test Program',
      description: 'A test training program',
      duration_hours: 40,
      price: '1000.00',
      max_participants: 20,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31')
    }).returning().execute();

    const registration = await db.insert(registrationsTable).values({
      user_id: user[0].id,
      program_id: program[0].id
    }).returning().execute();

    const document = await db.insert(documentsTable).values({
      registration_id: registration[0].id,
      document_type: 'certificate',
      file_path: '/uploads/test.pdf',
      file_name: 'test.pdf'
    }).returning().execute();

    const input: UpdateDocumentStatusInput = {
      id: document[0].id,
      status: 'pending',
      verified_by: null,
      notes: 'Under review'
    };

    const result = await updateDocumentStatus(input);

    // Query database to verify update
    const updatedDocument = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, result.id))
      .execute();

    expect(updatedDocument).toHaveLength(1);
    expect(updatedDocument[0].status).toEqual('pending');
    expect(updatedDocument[0].verified_by).toBeNull();
    expect(updatedDocument[0].verified_at).toBeNull();
    expect(updatedDocument[0].notes).toEqual('Under review');
    expect(updatedDocument[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when document does not exist', async () => {
    const input: UpdateDocumentStatusInput = {
      id: 999,
      status: 'verified',
      verified_by: 1,
      notes: 'Test note'
    };

    await expect(updateDocumentStatus(input)).rejects.toThrow(/Document with id 999 not found/);
  });

  it('should update document status to pending and clear verification fields', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable).values({
      email: 'student@test.com',
      password: 'password123',
      full_name: 'Test Student',
      phone: '1234567890',
      role: 'student'
    }).returning().execute();

    const admin = await db.insert(usersTable).values({
      email: 'admin@test.com',
      password: 'password123',
      full_name: 'Test Admin',
      phone: '0987654321',
      role: 'admin'
    }).returning().execute();

    const program = await db.insert(trainingProgramsTable).values({
      name: 'Test Program',
      description: 'A test training program',
      duration_hours: 40,
      price: '1000.00',
      max_participants: 20,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31')
    }).returning().execute();

    const registration = await db.insert(registrationsTable).values({
      user_id: user[0].id,
      program_id: program[0].id
    }).returning().execute();

    // Create document with initial verification
    const document = await db.insert(documentsTable).values({
      registration_id: registration[0].id,
      document_type: 'certificate',
      file_path: '/uploads/test.pdf',
      file_name: 'test.pdf',
      status: 'verified',
      verified_by: admin[0].id,
      verified_at: new Date()
    }).returning().execute();

    const input: UpdateDocumentStatusInput = {
      id: document[0].id,
      status: 'pending',
      verified_by: null,
      notes: 'Reset for re-review'
    };

    const result = await updateDocumentStatus(input);

    expect(result.status).toEqual('pending');
    expect(result.verified_by).toBeNull();
    expect(result.verified_at).toBeNull();
    expect(result.notes).toEqual('Reset for re-review');
  });
});
