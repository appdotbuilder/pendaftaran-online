
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, trainingProgramsTable, registrationsTable, documentsTable } from '../db/schema';
import { getPendingDocuments } from '../handlers/get_pending_documents';

describe('getPendingDocuments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no pending documents exist', async () => {
    const result = await getPendingDocuments();
    expect(result).toEqual([]);
  });

  it('should return only pending documents', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password',
        full_name: 'Test User',
        phone: '1234567890',
        role: 'student'
      })
      .returning()
      .execute();

    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'Test Description',
        duration_hours: 40,
        price: '1000.00',
        max_participants: 20,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31')
      })
      .returning()
      .execute();

    const registration = await db.insert(registrationsTable)
      .values({
        user_id: user[0].id,
        program_id: program[0].id
      })
      .returning()
      .execute();

    // Create documents with different statuses
    await db.insert(documentsTable)
      .values([
        {
          registration_id: registration[0].id,
          document_type: 'id_card',
          file_path: '/uploads/id1.pdf',
          file_name: 'id1.pdf',
          status: 'pending'
        },
        {
          registration_id: registration[0].id,
          document_type: 'certificate',
          file_path: '/uploads/cert1.pdf',
          file_name: 'cert1.pdf',
          status: 'verified'
        },
        {
          registration_id: registration[0].id,
          document_type: 'transcript',
          file_path: '/uploads/transcript1.pdf',
          file_name: 'transcript1.pdf',
          status: 'pending'
        },
        {
          registration_id: registration[0].id,
          document_type: 'photo',
          file_path: '/uploads/photo1.jpg',
          file_name: 'photo1.jpg',
          status: 'rejected'
        }
      ])
      .execute();

    const result = await getPendingDocuments();

    // Should return only pending documents
    expect(result).toHaveLength(2);
    
    // Check that all returned documents have pending status
    result.forEach(document => {
      expect(document.status).toEqual('pending');
    });

    // Verify specific documents are returned
    const documentTypes = result.map(doc => doc.document_type);
    expect(documentTypes).toContain('id_card');
    expect(documentTypes).toContain('transcript');
    expect(documentTypes).not.toContain('certificate');
    expect(documentTypes).not.toContain('photo');

    // Verify document structure
    const firstDoc = result[0];
    expect(firstDoc.id).toBeDefined();
    expect(firstDoc.registration_id).toEqual(registration[0].id);
    expect(firstDoc.file_path).toBeDefined();
    expect(firstDoc.file_name).toBeDefined();
    expect(firstDoc.created_at).toBeInstanceOf(Date);
    expect(firstDoc.updated_at).toBeInstanceOf(Date);
    expect(firstDoc.verified_at).toBeNull();
    expect(firstDoc.verified_by).toBeNull();
  });

  it('should handle multiple registrations with pending documents', async () => {
    // Create multiple users and registrations
    const users = await db.insert(usersTable)
      .values([
        {
          email: 'user1@example.com',
          password: 'password',
          full_name: 'User One',
          phone: '1234567890',
          role: 'student'
        },
        {
          email: 'user2@example.com',
          password: 'password',
          full_name: 'User Two',
          phone: '0987654321',
          role: 'student'
        }
      ])
      .returning()
      .execute();

    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'Test Description',
        duration_hours: 40,
        price: '1000.00',
        max_participants: 20,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31')
      })
      .returning()
      .execute();

    const registrations = await db.insert(registrationsTable)
      .values([
        {
          user_id: users[0].id,
          program_id: program[0].id
        },
        {
          user_id: users[1].id,
          program_id: program[0].id
        }
      ])
      .returning()
      .execute();

    // Create pending documents for both registrations
    await db.insert(documentsTable)
      .values([
        {
          registration_id: registrations[0].id,
          document_type: 'id_card',
          file_path: '/uploads/id1.pdf',
          file_name: 'id1.pdf',
          status: 'pending'
        },
        {
          registration_id: registrations[1].id,
          document_type: 'certificate',
          file_path: '/uploads/cert2.pdf',
          file_name: 'cert2.pdf',
          status: 'pending'
        }
      ])
      .execute();

    const result = await getPendingDocuments();

    expect(result).toHaveLength(2);
    
    // Verify both registrations are represented
    const registrationIds = result.map(doc => doc.registration_id);
    expect(registrationIds).toContain(registrations[0].id);
    expect(registrationIds).toContain(registrations[1].id);

    // All should be pending
    result.forEach(document => {
      expect(document.status).toEqual('pending');
    });
  });
});
