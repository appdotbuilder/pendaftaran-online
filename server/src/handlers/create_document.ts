
import { db } from '../db';
import { documentsTable, registrationsTable } from '../db/schema';
import { type CreateDocumentInput, type Document } from '../schema';
import { eq } from 'drizzle-orm';

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  try {
    // Verify registration exists to prevent foreign key constraint violation
    const registration = await db.select()
      .from(registrationsTable)
      .where(eq(registrationsTable.id, input.registration_id))
      .execute();

    if (registration.length === 0) {
      throw new Error(`Registration with ID ${input.registration_id} not found`);
    }

    // Insert document record
    const result = await db.insert(documentsTable)
      .values({
        registration_id: input.registration_id,
        document_type: input.document_type,
        file_path: input.file_path,
        file_name: input.file_name
        // status defaults to 'pending'
        // verified_by defaults to null
        // verified_at defaults to null
        // notes defaults to null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Document creation failed:', error);
    throw error;
  }
}
