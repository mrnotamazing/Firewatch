import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, get, all, initSchema, rowToReport } from './db.mjs';
import { checkPasscode, createSession, isValidSession, destroySession, requireOfficer } from './auth.mjs';
import { sendTicketEmail } from './mailer.mjs';
import { hazardCategoryMap } from './hazardCategories.mjs';
import { localityNames } from './localityNames.mjs';
import { contactFor } from './departmentContacts.mjs';

await initSchema();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const HOUR = 60 * 60 * 1000;

app.post('/api/officer/login', (req, res) => {
  const { passcode } = req.body;
  if (!checkPasscode(passcode)) {
    res.status(401).json({ error: 'Incorrect passcode' });
    return;
  }
  res.json({ token: createSession() });
});

app.get('/api/officer/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  res.json({ authenticated: isValidSession(token) });
});

app.post('/api/officer/logout', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) destroySession(token);
  res.json({ ok: true });
});

async function nextReportId() {
  const rows = await all('SELECT id FROM reports');
  const nums = rows.map((r) => Number(r.id.replace('BLR-', ''))).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 10233;
  return `BLR-${max + 1}`;
}

app.get('/api/reports', async (_req, res) => {
  const rows = await all('SELECT * FROM reports ORDER BY createdAt DESC');
  res.json(rows.map(rowToReport));
});

app.post('/api/reports', async (req, res) => {
  const { category, localityId, description, photoDataUrl, reporterName, reporterContact } = req.body;
  if (!category || !localityId || !description || !reporterName) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const id = await nextReportId();
  const createdAt = Date.now();
  const dueAt = createdAt + 48 * HOUR;
  const status = 'pending';

  await run(
    `INSERT INTO reports (id, category, localityId, description, photoDataUrl, reporterName, reporterContact, status, createdAt, dueAt, resolvedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [id, category, localityId, description, photoDataUrl ?? null, reporterName, reporterContact ?? null, status, createdAt, dueAt],
  );

  const row = await get('SELECT * FROM reports WHERE id = ?', [id]);
  res.status(201).json(rowToReport(row));
});

app.patch('/api/reports/:id', requireOfficer, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['pending', 'assigned', 'in-progress', 'resolved', 'escalated'];
  if (!valid.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  const existing = await get('SELECT * FROM reports WHERE id = ?', [id]);
  if (!existing) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  const resolvedAt = status === 'resolved' ? Date.now() : null;
  await run('UPDATE reports SET status = ?, resolvedAt = ? WHERE id = ?', [status, resolvedAt, id]);
  const row = await get('SELECT * FROM reports WHERE id = ?', [id]);
  res.json(rowToReport(row));
});

app.post('/api/reports/:id/send-ticket', requireOfficer, async (req, res) => {
  const { id } = req.params;
  const report = await get('SELECT * FROM reports WHERE id = ?', [id]);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  if (report.status === 'pending') {
    res.status(400).json({ error: 'Verify the report (assign, start progress, or escalate) before sending a ticket' });
    return;
  }
  if (report.status === 'resolved') {
    res.status(400).json({ error: 'Report is already resolved — no ticket needed' });
    return;
  }

  const category = hazardCategoryMap[report.category] ?? { label: report.category, department: 'Fire Dept' };
  const localityName = localityNames[report.localityId] ?? report.localityId;
  const recipient = contactFor(category.department);

  const subject = `[FireWatch ${id}] ${category.label} — ${localityName} — action required`;
  const text = [
    `A fire safety hazard has been reported and verified by an on-duty officer via FireWatch Bengaluru.`,
    ``,
    `Report ID: ${id}`,
    `Category: ${category.label}`,
    `Locality: ${localityName}`,
    `Description: ${report.description}`,
    `Reported by: ${report.reporterName}`,
    `Status: ${report.status}`,
    `Resolution due: ${new Date(report.dueAt).toISOString()}`,
    ``,
    `Please coordinate resolution and update FireWatch once addressed.`,
    `— Bengaluru Fire & Emergency Services / FireWatch`,
  ].join('\n');

  const result = await sendTicketEmail({ to: recipient, subject, text });

  const ticketSentAt = Date.now();
  await run('UPDATE reports SET ticketSentAt = ?, ticketRecipient = ? WHERE id = ?', [ticketSentAt, recipient, id]);

  res.json({ sentAt: ticketSentAt, recipient, simulated: result.simulated });
});

app.post('/api/suggestions', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }
  const id = `SUG-${Date.now()}`;
  const createdAt = Date.now();
  const trimmed = message.trim().slice(0, 2000);
  await run('INSERT INTO suggestions (id, message, createdAt) VALUES (?, ?, ?)', [id, trimmed, createdAt]);
  res.status(201).json({ id, message: trimmed, createdAt });
});

app.get('/api/suggestions', requireOfficer, async (_req, res) => {
  const rows = await all('SELECT * FROM suggestions ORDER BY createdAt DESC');
  res.json(rows);
});

app.post('/api/poll', async (req, res) => {
  const { questionId, answer } = req.body;
  if (!questionId || (answer !== 'yes' && answer !== 'no')) {
    res.status(400).json({ error: 'questionId and answer ("yes" or "no") are required' });
    return;
  }
  const id = `POLL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await run('INSERT INTO poll_responses (id, questionId, answer, createdAt) VALUES (?, ?, ?, ?)', [
    id,
    questionId,
    answer,
    Date.now(),
  ]);
  res.status(201).json({ ok: true });
});

app.get('/api/poll', async (_req, res) => {
  const rows = await all('SELECT questionId, answer, COUNT(*) as count FROM poll_responses GROUP BY questionId, answer');
  const result = {};
  for (const r of rows) {
    if (!result[r.questionId]) result[r.questionId] = { yes: 0, no: 0 };
    result[r.questionId][r.answer] = Number(r.count);
  }
  res.json(result);
});

app.post('/api/search-log', async (req, res) => {
  const { query, matchedLocality, fallbackLocality, fallbackKm, outsideBengaluru, notFound } = req.body;
  if (!query || !query.trim()) {
    res.status(400).json({ error: 'query is required' });
    return;
  }
  const id = `SEARCH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await run(
    'INSERT INTO search_logs (id, query, matchedLocality, fallbackLocality, fallbackKm, outsideBengaluru, notFound, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      query.trim().slice(0, 200),
      matchedLocality ?? null,
      fallbackLocality ?? null,
      fallbackKm ?? null,
      outsideBengaluru ? 1 : 0,
      notFound ? 1 : 0,
      Date.now(),
    ],
  );
  res.status(201).json({ ok: true });
});

// Officer-only: surfaces which searched areas aren't covered yet (grouped, most-searched
// first) so we know what localities to prioritize adding in future patches.
app.get('/api/search-log', requireOfficer, async (_req, res) => {
  const unmatched = await all(
    `SELECT LOWER(TRIM(query)) as query, COUNT(*) as count, MAX(createdAt) as lastSearchedAt,
       GROUP_CONCAT(DISTINCT fallbackLocality) as fallbackLocalities
     FROM search_logs
     WHERE matchedLocality IS NULL
     GROUP BY LOWER(TRIM(query))
     ORDER BY count DESC, lastSearchedAt DESC
     LIMIT 100`,
  );
  const recent = await all('SELECT * FROM search_logs ORDER BY createdAt DESC LIMIT 50');
  res.json({ unmatched, recent });
});

// Serve the built frontend (dist/) when it exists, so one always-on process hosts the whole app.
const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA fallback: any non-API GET that wasn't a real file gets index.html (client-side routing).
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.sendFile(join(distDir, 'index.html'));
    } else {
      next();
    }
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FireWatch API listening on http://localhost:${PORT}`);
});
