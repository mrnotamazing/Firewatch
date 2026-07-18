import crypto from 'node:crypto';

// Shared officer passcode for this pilot deployment. Override with a real value via env var
// before deploying anywhere beyond localhost — this default is only here so the demo works out
// of the box.
const OFFICER_PASSCODE = process.env.OFFICER_PASSCODE || 'firefirefire';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h shift-length session
const sessions = new Map(); // token -> expiresAt

export function checkPasscode(passcode) {
  return typeof passcode === 'string' && passcode === OFFICER_PASSCODE;
}

export function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function isValidSession(token) {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function requireOfficer(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!isValidSession(token)) {
    res.status(401).json({ error: 'Officer session required' });
    return;
  }
  next();
}
