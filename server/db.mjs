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

db.exec(`
  CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    message TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS poll_responses (
    id TEXT PRIMARY KEY,
    questionId TEXT NOT NULL,
    answer TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  )
`);

// Logs every locality/address search on the heatmap so we can see what areas people
// look for that FireWatch doesn't cover yet (e.g. "Cox Town" falling back to the
// nearest scored locality, "Frazer Town") and prioritize adding them in future patches.
db.exec(`
  CREATE TABLE IF NOT EXISTS search_logs (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    matchedLocality TEXT,
    fallbackLocality TEXT,
    fallbackKm REAL,
    outsideBengaluru INTEGER NOT NULL DEFAULT 0,
    notFound INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL
  )
`);

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
