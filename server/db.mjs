import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'firewatch.db');
export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    localityId TEXT NOT NULL,
    description TEXT NOT NULL,
    photoDataUrl TEXT,
    reporterName TEXT NOT NULL,
    reporterContact TEXT,
    status TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    dueAt INTEGER NOT NULL,
    resolvedAt INTEGER,
    ticketSentAt INTEGER,
    ticketRecipient TEXT
  )
`);

const existingColumns = new Set(db.prepare('PRAGMA table_info(reports)').all().map((c) => c.name));
if (!existingColumns.has('ticketSentAt')) {
  db.exec('ALTER TABLE reports ADD COLUMN ticketSentAt INTEGER');
}
if (!existingColumns.has('ticketRecipient')) {
  db.exec('ALTER TABLE reports ADD COLUMN ticketRecipient TEXT');
}

export function rowToReport(row) {
  return {
    id: row.id,
    category: row.category,
    localityId: row.localityId,
    description: row.description,
    photoDataUrl: row.photoDataUrl ?? undefined,
    reporterName: row.reporterName,
    reporterContact: row.reporterContact ?? undefined,
    status: row.status,
    createdAt: row.createdAt,
    dueAt: row.dueAt,
    resolvedAt: row.resolvedAt ?? undefined,
    ticketSentAt: row.ticketSentAt ?? undefined,
    ticketRecipient: row.ticketRecipient ?? undefined,
  };
}
