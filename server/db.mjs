import { createClient } from '@libsql/client';

// Turso (hosted libSQL) connection. These MUST be set as environment variables
// on Render (and in a local .env for dev) — never hardcode the URL/token here.
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    'Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables. ' +
      'Set both before starting the server.',
  );
}

const client = createClient({ url, authToken });

// Small helpers so the rest of the server can stay close to the old
// db.prepare(sql).run/get/all(...) shape, just async now.
export async function run(sql, args = []) {
  return client.execute({ sql, args });
}

export async function get(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows[0];
}

export async function all(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows;
}

async function exec(sql) {
  await client.executeMultiple(sql);
}

export async function initSchema() {
  await exec(`
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

  const existingColumns = new Set((await all('PRAGMA table_info(reports)')).map((c) => c.name));
  if (!existingColumns.has('ticketSentAt')) {
    await exec('ALTER TABLE reports ADD COLUMN ticketSentAt INTEGER');
  }
  if (!existingColumns.has('ticketRecipient')) {
    await exec('ALTER TABLE reports ADD COLUMN ticketRecipient TEXT');
  }

  await exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `);

  await exec(`
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
  await exec(`
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
