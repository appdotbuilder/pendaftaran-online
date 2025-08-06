
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable, usersTable, trainingProgramsTable, registrationsTable } from '../db/schema';
import { type CreateDocumentInput } from '../schema';
import { createDocument } from '../handlers/create_document';
import { eq } from 'drizzle-orm';

describe('createDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a document', async () => {
    // Create prerequisite data
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

    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program',
        description: 'A test training program',
        duration_hours: 40,
        price: '1500.00',
        max_participants: 20,
        start_date: new Date('2024-06-01'),
        end_date: new Date('2024-06-30')
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

    const testInput: CreateDocumentInput = {
      registration_id: registration[0].id,
      document_type: 'ID Card',
      file_path: '/uploads/documents/id-card.pdf',
      file_name: 'id-card.pdf'
    };

    const result = await createDocument(testInput);

    // Basic field validation
    expect(result.registration_id).toEqual(registration[0].id);
    expect(result.document_type).toEqual('ID Card');
    expect(result.file_path).toEqual('/uploads/documents/id-card.pdf');
    expect(result.file_name).toEqual('id-card.pdf');
    expect(result.status).toEqual('pending');
    expect(result.verified_by).toBeNull();
    expect(result.verified_at).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save document to database', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable)
      .values({
        email: 'test2@example.com',
        password: 'password123',
        full_name: 'Test User 2',
        phone: '1234567891',
        role: 'student'
      })
      .returning()
      .execute();

    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program 2',
        description: 'Another test training program',
        duration_hours: 30,
        price: '1200.00',
        max_participants: 15,
        start_date: new Date('2024-07-01'),
        end_date: new Date('2024-07-31')
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

    const testInput: CreateDocumentInput = {
      registration_id: registration[0].id,
      document_type: 'Certificate',
      file_path: '/uploads/documents/certificate.jpg',
      file_name: 'certificate.jpg'
    };

    const result = await createDocument(testInput);

    // Query database to verify document was saved
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, result.id))
      .execute();

    expect(documents).toHaveLength(1);
    expect(documents[0].registration_id).toEqual(registration[0].id);
    expect(documents[0].document_type).toEqual('Certificate');
    expect(documents[0].file_path).toEqual('/uploads/documents/certificate.jpg');
    expect(documents[0].file_name).toEqual('certificate.jpg');
    expect(documents[0].status).toEqual('pending');
    expect(documents[0].created_at).toBeInstanceOf(Date);
    expect(documents[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent registration', async () => {
    const testInput: CreateDocumentInput = {
      registration_id: 99999, // Non-existent registration ID
      document_type: 'ID Card',
      file_path: '/uploads/documents/id-card.pdf',
      file_name: 'id-card.pdf'
    };

    expect(createDocument(testInput)).rejects.toThrow(/registration.*not found/i);
  });

  it('should create multiple documents for same registration', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable)
      .values({
        email: 'test3@example.com',
        password: 'password123',
        full_name: 'Test User 3',
        phone: '1234567892',
        role: 'student'
      })
      .returning()
      .execute();

    const program = await db.insert(trainingProgramsTable)
      .values({
        name: 'Test Program 3',
        description: 'Third test training program',
        duration_hours: 25,
        price: '1000.00',
        max_participants: 10,
        start_date: new Date('2024-08-01'),
        end_date: new Date('2024-08-31')
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

    // Create first document
    const firstInput: CreateDocumentInput = {
      registration_id: registration[0].id,
      document_type: 'ID Card',
      file_path: '/uploads/documents/id-card.pdf',
      file_name: 'id-card.pdf'
    };

    // Create second document
    const secondInput: CreateDocumentInput = {
      registration_id: registration[0].id,
      document_type: 'Diploma',
      file_path: '/uploads/documents/diploma.jpg',
      file_name: 'diploma.jpg'
    };

    const firstResult = await createDocument(firstInput);
    const secondResult = await createDocument(secondInput);

    // Both should be created successfully
    expect(firstResult.id).toBeDefined();
    expect(secondResult.id).toBeDefined();
    expect(firstResult.id).not.toEqual(secondResult.id);

    // Verify both documents exist in database
    const allDocuments = await db.select()
      .from(documentsTable)
      .execute();

    const registrationDocuments = allDocuments.filter(doc => 
      doc.registration_id === registration[0].id
    );

    expect(registrationDocuments).toHaveLength(2);
    expect(registrationDocuments.map(d => d.document_type)).toContain('ID Card');
    expect(registrationDocuments.map(d => d.document_type)).toContain('Diploma');
  });
});
