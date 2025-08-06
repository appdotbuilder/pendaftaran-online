
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type UpdateDocumentStatusInput, type Document } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDocumentStatus = async (input: UpdateDocumentStatusInput): Promise<Document> => {
  try {
    // Prepare update values
    const updateValues: any = {
      status: input.status,
      notes: input.notes,
      updated_at: new Date()
    };

    // Set verification fields based on status
    if (input.status === 'verified') {
      updateValues.verified_by = input.verified_by;
      updateValues.verified_at = new Date();
    } else if (input.status === 'pending' || input.status === 'rejected') {
      updateValues.verified_by = null;
      updateValues.verified_at = null;
    }

    // Update document record
    const result = await db.update(documentsTable)
      .set(updateValues)
      .where(eq(documentsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Document with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Document status update failed:', error);
    throw error;
  }
};
