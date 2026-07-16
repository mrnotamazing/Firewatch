import { useEffect, useState, type ReactNode } from 'react';
import { Lock, ShieldCheck, LoaderCircle } from 'lucide-react';
import { officerCheckSession, officerLogin } from '../lib/api';
import LogoMark from './LogoMark';

export default function OfficerLoginGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'authed' | 'unauthed'>('checking');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    officerCheckSession().then((ok) => setStatus(ok ? 'authed' : 'unauthed'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const ok = await officerLogin(passcode);
    setSubmitting(false);
    if (ok) setStatus('authed');
    else setError('Incorrect passcode. Contact your shift supervisor if you need access.');
  }

  if (status === 'checking') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink/50">
        <LoaderCircle size={22} className="animate-spin" />
        <p className="font-mono text-[12px] uppercase tracking-wide">Verifying officer session…</p>
      </div>
    );
  }

  if (status === 'authed') {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center border-2 border-ink text-ink">
        <Lock size={22} />
      </span>
      <div className="mb-1 flex items-center gap-2">
        <LogoMark size={20} />
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-ink/45">Restricted Access</span>
      </div>
      <h1 className="font-display text-[28px] font-bold uppercase leading-none text-ink">Officer Sign-In</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
        This dashboard is for on-duty Bengaluru Fire &amp; Emergency Services officers only. Residents should use the{' '}
        <a href="/heatmap" className="font-medium text-ember hover:text-ember-2">Heatmap</a> or{' '}
        <a href="/report" className="font-medium text-ember hover:text-ember-2">Report Hazard</a> pages.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Officer passcode"
          autoFocus
          className="w-full border border-ink/25 bg-white px-3.5 py-2.5 text-center text-[13px] tracking-widest text-ink focus:border-ink focus:outline-none"
        />
        {error && <p className="font-mono text-[11px] font-medium text-high-risk">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !passcode}
          className="flex w-full items-center justify-center gap-1.5 bg-ink py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper disabled:opacity-40"
        >
          {submitting ? <LoaderCircle size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          {submitting ? 'Verifying…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
