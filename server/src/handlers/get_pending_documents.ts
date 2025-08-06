
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type Document } from '../schema';
import { eq } from 'drizzle-orm';

export async function getPendingDocuments(): Promise<Document[]> {
  try {
    const results = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.status, 'pending'))
      .execute();

    // Convert the results to match the Document schema
    return results.map(document => ({
      ...document,
      // Ensure dates are properly handled
      created_at: document.created_at,
      updated_at: document.updated_at,
      verified_at: document.verified_at
    }));
  } catch (error) {
    console.error('Failed to fetch pending documents:', error);
    throw error;
  }
}
