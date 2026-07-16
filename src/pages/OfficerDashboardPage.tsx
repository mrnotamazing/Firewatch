import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, TriangleAlert, CheckCircle2, BarChart3, ClipboardList, Map as MapIcon,
  Plus, User, MapPin, Zap, Trash2, Ban, FlaskConical, Cpu, Flame, Flag, ArrowRight, LogOut,
  Mail, LoaderCircle,
} from 'lucide-react';
import { useHazardStore } from '../lib/store';
import { localities } from '../lib/data/localities';
import { hazardCategories, hazardCategoryMap } from '../lib/data/hazardCategories';
import type { HazardCategory, HazardReport, ReportStatus } from '../lib/types';
import StatusBadge, { statusMeta } from '../components/StatusBadge';
import { timeAgo, hoursUntil } from '../lib/format';
import OfficerLoginGate from '../components/OfficerLoginGate';
import { officerLogout } from '../lib/api';

const CATEGORY_ICONS: Record<HazardCategory, typeof Zap> = {
  'hanging-wires': Zap,
  'flammable-waste': Trash2,
  'gas-leak': TriangleAlert,
  'blocked-exit': Ban,
  'chemical-storage': FlaskConical,
  'electrical-panel': Cpu,
  'open-burning': Flame,
  other: Flag,
};

const CRITICAL_CATEGORIES: HazardCategory[] = ['gas-leak', 'chemical-storage', 'blocked-exit'];

function isCritical(r: HazardReport): boolean {
  return r.status === 'escalated' || (CRITICAL_CATEGORIES.includes(r.category) && r.status !== 'resolved');
}

function currentShift(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return 'Morning (06:00–14:00)';
  if (h >= 14 && h < 22) return 'Evening (14:00–22:00)';
  return 'Night (22:00–06:00)';
}

const NEXT_ACTIONS: Partial<Record<ReportStatus, { label: string; to: ReportStatus }[]>> = {
  pending: [{ label: 'Assign', to: 'assigned' }, { label: 'Escalate', to: 'escalated' }],
  assigned: [{ label: 'Start Progress', to: 'in-progress' }, { label: 'Escalate', to: 'escalated' }],
  'in-progress': [{ label: 'Mark Resolved', to: 'resolved' }, { label: 'Escalate', to: 'escalated' }],
  escalated: [{ label: 'Assign', to: 'assigned' }, { label: 'Mark Resolved', to: 'resolved' }],
};

export default function OfficerDashboardPage() {
  return (
    <OfficerLoginGate>
      <OfficerDashboardContent />
    </OfficerLoginGate>
  );
}

function OfficerDashboardContent() {
  const reports = useHazardStore((s) => s.reports);
  const setStatus = useHazardStore((s) => s.setStatus);
  const sendTicket = useHazardStore((s) => s.sendTicket);

  const [tab, setTab] = useState<'reports' | 'analytics'>('reports');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(reports[0]?.id ?? null);

  const sorted = useMemo(() => [...reports].sort((a, b) => b.createdAt - a.createdAt), [reports]);

  const filtered = sorted.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (priorityFilter === 'critical' && !isCritical(r)) return false;
    return true;
  });

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  const pendingAction = reports.filter((r) => r.status === 'pending').length;
  const criticalPriority = reports.filter(isCritical).length;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const resolvedThisWeek = reports.filter((r) => r.status === 'resolved' && r.resolvedAt && Date.now() - r.resolvedAt < weekMs).length;
  const resolved = reports.filter((r) => r.status === 'resolved' && r.resolvedAt);
  const avgResolutionH = resolved.length
    ? Math.round(resolved.reduce((sum, r) => sum + (r.resolvedAt! - r.createdAt), 0) / resolved.length / 3600000)
    : null;

  const byCategory = hazardCategories.map((c) => ({
    ...c,
    count: reports.filter((r) => r.category === c.id).length,
  })).sort((a, b) => b.count - a.count);

  const byDept = Array.from(new Set(hazardCategories.map((c) => c.department))).map((dept) => ({
    dept,
    count: reports.filter((r) => hazardCategoryMap[r.category].department === dept).length,
  })).sort((a, b) => b.count - a.count);

  const maxCategoryCount = Math.max(1, ...byCategory.map((c) => c.count));
  const maxDeptCount = Math.max(1, ...byDept.map((d) => d.count));

  return (
    <div>
      <div className="border-b border-ink bg-paper px-6 py-4">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-ink/45">
              Fire Officer Dashboard
            </span>
            <h1 className="mt-1 font-display text-[38px] font-bold uppercase leading-none text-ink sm:text-[42px]">
              Hazard Command Centre
            </h1>
            <p className="mt-1.5 font-mono text-[12px] text-ink/55">
              Bengaluru Fire &amp; Emergency Services · Shift: {currentShift()}
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link to="/heatmap" className="flex items-center gap-1.5 border border-ink px-4 py-2.5 font-display text-[13.5px] font-semibold uppercase tracking-wide text-ink hover:bg-paper-2">
              <MapIcon size={14} /> View Heatmap
            </Link>
            <Link to="/report" className="flex items-center gap-1.5 bg-ink px-4 py-2.5 font-display text-[13.5px] font-semibold uppercase tracking-wide text-paper hover:bg-ink-2">
              <Plus size={14} /> Log Report
            </Link>
            <button
              onClick={() => officerLogout().then(() => window.location.reload())}
              className="flex items-center gap-1.5 border border-ink/20 px-4 py-2.5 font-display text-[13.5px] font-semibold uppercase tracking-wide text-ink/50 hover:bg-paper-2 hover:text-ink"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="mb-6 grid grid-cols-2 divide-x divide-y divide-ink border border-ink sm:grid-cols-4 sm:divide-y-0">
          <div className="p-4">
            <Clock size={15} className="text-high-risk" />
            <div className="mt-2 font-mono text-[24px] font-semibold leading-none text-ink">{pendingAction}</div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-ink/50">Pending · Needs Attention</div>
          </div>
          <div className="p-4">
            <TriangleAlert size={15} className="text-moderate" />
            <div className="mt-2 font-mono text-[24px] font-semibold leading-none text-ink">{criticalPriority}</div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-ink/50">Critical · Escalate &gt;24h</div>
          </div>
          <div className="p-4">
            <CheckCircle2 size={15} className="text-safe" />
            <div className="mt-2 font-mono text-[24px] font-semibold leading-none text-ink">{resolvedThisWeek}</div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-ink/50">Resolved This Week</div>
          </div>
          <div className="p-4">
            <BarChart3 size={15} className="text-station" />
            <div className="mt-2 font-mono text-[24px] font-semibold leading-none text-ink">{avgResolutionH !== null ? `${avgResolutionH}h` : '—'}</div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-ink/50">Avg Resolution · Target 48h</div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-6 border-b border-ink/15">
          <button
            onClick={() => setTab('reports')}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide ${tab === 'reports' ? 'border-ember text-ink' : 'border-transparent text-ink/40 hover:text-ink'}`}
          >
            <ClipboardList size={14} /> Reports
          </button>
          <button
            onClick={() => setTab('analytics')}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide ${tab === 'analytics' ? 'border-ember text-ink' : 'border-transparent text-ink/40 hover:text-ink'}`}
          >
            <BarChart3 size={14} /> Analytics
          </button>
        </div>

        {tab === 'reports' ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
            <div className="border border-ink">
              <div className="flex flex-wrap items-center gap-2.5 border-b border-ink bg-paper-2 px-4 py-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
                  className="border border-ink/25 bg-white px-3 py-1.5 text-[12px] text-ink focus:outline-none"
                >
                  <option value="all">All Status</option>
                  {Object.entries(statusMeta).map(([key, m]) => (
                    <option key={key} value={key}>{m.label}</option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'critical')}
                  className="border border-ink/25 bg-white px-3 py-1.5 text-[12px] text-ink focus:outline-none"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical Only</option>
                </select>
                <span className="ml-auto font-mono text-[11.5px] text-ink/45">{filtered.length} reports</span>
              </div>

              <div className="max-h-[640px] divide-y divide-ink/10 overflow-y-auto">
                {filtered.map((r) => {
                  const locality = localities.find((l) => l.id === r.localityId);
                  const Icon = CATEGORY_ICONS[r.category];
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper-2 ${
                        selectedId === r.id ? 'bg-paper-2' : ''
                      }`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-ember/30 bg-ember-soft text-ember">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-ink">{hazardCategoryMap[r.category].label}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] text-ink/50">{locality?.name} · {r.description}</div>
                        <div className="mt-1 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wide text-ink/40">
                          <span>{r.reporterName}</span>
                          <span>· {timeAgo(r.createdAt)}</span>
                          {r.status !== 'resolved' && (
                            <span className={hoursUntil(r.dueAt) < 0 ? 'font-semibold text-high-risk' : ''}>
                              · {hoursUntil(r.dueAt) < 0 ? 'Overdue' : `Due ${hoursUntil(r.dueAt)}h`}
                            </span>
                          )}
                          <span>→ {hazardCategoryMap[r.category].department}</span>
                        </div>
                      </div>
                      <span className="mt-1 shrink-0 font-mono text-[11px] text-ink/30">{r.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-ink">
              {selected ? (
                <ReportDetail
                  report={selected}
                  onStatusChange={(s) => setStatus(selected.id, s)}
                  onSendTicket={() => sendTicket(selected.id)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                  <span className="flex h-10 w-10 items-center justify-center border border-ink/20 text-ink/40">
                    <ClipboardList size={18} />
                  </span>
                  <p className="text-[13px] font-medium text-ink">Select a report</p>
                  <p className="text-[12px] leading-relaxed text-ink/50">
                    Click any report to view details, assign officers, and update status.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="border border-ink p-5">
              <div className="mb-4 font-mono text-[12.5px] font-semibold uppercase tracking-wide text-ink/60">Hazards by Category</div>
              <div className="space-y-3">
                {byCategory.map((c) => (
                  <div key={c.id}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-ink/65">{c.label}</span>
                      <span className="font-mono font-medium text-ink">{c.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden bg-paper-2">
                      <div className="h-full bg-ember" style={{ width: `${(c.count / maxCategoryCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-ink p-5">
              <div className="mb-4 font-mono text-[12.5px] font-semibold uppercase tracking-wide text-ink/60">Reports Routed by Department</div>
              <div className="space-y-3">
                {byDept.map((d) => (
                  <div key={d.dept}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-ink/65">{d.dept}</span>
                      <span className="font-mono font-medium text-ink">{d.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden bg-paper-2">
                      <div className="h-full bg-station" style={{ width: `${(d.count / maxDeptCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ReportDetail({
  report,
  onStatusChange,
  onSendTicket,
}: {
  report: HazardReport;
  onStatusChange: (s: ReportStatus) => void;
  onSendTicket: () => Promise<void>;
}) {
  const locality = localities.find((l) => l.id === report.localityId);
  const Icon = CATEGORY_ICONS[report.category];
  const actions = NEXT_ACTIONS[report.status] ?? [];
  const [sendingTicket, setSendingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  async function handleSendTicket() {
    setSendingTicket(true);
    setTicketError(null);
    try {
      await onSendTicket();
    } catch {
      setTicketError('Could not send ticket — try again.');
    } finally {
      setSendingTicket(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-2 border-b border-ink bg-paper-2 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center border border-ember/30 bg-ember-soft text-ember">
            <Icon size={18} />
          </span>
          <div>
            <div className="text-[14px] font-semibold text-ink">{hazardCategoryMap[report.category].label}</div>
            <div className="font-mono text-[11px] text-ink/40">{report.id}</div>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="space-y-4 px-5 py-4">
        {report.photoDataUrl && (
          <img src={report.photoDataUrl} alt="Hazard" className="h-40 w-full border border-ink/15 object-cover" />
        )}
        <p className="text-[13px] leading-relaxed text-ink/70">{report.description}</p>

        <div className="space-y-2 font-mono text-[11.5px] text-ink/60">
          <div className="flex items-center gap-2"><MapPin size={13} /> {locality?.name}</div>
          <div className="flex items-center gap-2"><User size={13} /> {report.reporterName}{report.reporterContact ? ` · ${report.reporterContact}` : ''}</div>
          <div className="flex items-center gap-2"><Clock size={13} /> Reported {timeAgo(report.createdAt)}</div>
          <div className="flex items-center gap-2">
            <ArrowRight size={13} /> Routed to <span className="font-semibold text-ink">{hazardCategoryMap[report.category].department}</span>
          </div>
        </div>

        {report.status !== 'resolved' && (
          <div className={`border px-3 py-2 font-mono text-[11.5px] font-medium uppercase tracking-wide ${hoursUntil(report.dueAt) < 0 ? 'border-high-risk/30 bg-high-risk-soft text-high-risk' : 'border-ink/15 bg-paper-2 text-ink/60'}`}>
            {hoursUntil(report.dueAt) < 0 ? `Overdue by ${Math.abs(hoursUntil(report.dueAt))}h` : `Due in ${hoursUntil(report.dueAt)}h (48h SLA)`}
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((a) => (
              <button
                key={a.to}
                onClick={() => onStatusChange(a.to)}
                className={`px-4 py-2 font-display text-[13px] font-semibold uppercase tracking-wide ${
                  a.to === 'resolved' ? 'bg-safe text-paper' : a.to === 'escalated' ? 'border border-ink text-ink hover:bg-paper-2' : 'bg-ink text-paper'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-ink/10 pt-4">
          {report.ticketSentAt ? (
            <div className="flex items-start gap-2 border border-safe/30 bg-safe-soft px-3 py-2.5 font-mono text-[11.5px] text-safe">
              <Mail size={14} className="mt-0.5 shrink-0" />
              <span>
                Ticket sent to <span className="font-semibold">{report.ticketRecipient}</span> · {timeAgo(report.ticketSentAt)}
              </span>
            </div>
          ) : report.status === 'resolved' ? (
            <p className="font-mono text-[11px] text-ink/40">Resolved without a ticket — no departmental action was needed.</p>
          ) : report.status === 'pending' ? (
            <p className="font-mono text-[11px] text-ink/40">Verify this report (assign, start progress, or escalate) to send a ticket to {hazardCategoryMap[report.category].department}.</p>
          ) : (
            <div>
              <button
                onClick={handleSendTicket}
                disabled={sendingTicket}
                className="flex w-full items-center justify-center gap-1.5 border border-ink bg-paper-2 py-2.5 font-display text-[13px] font-semibold uppercase tracking-wide text-ink hover:bg-paper disabled:opacity-50"
              >
                {sendingTicket ? <LoaderCircle size={14} className="animate-spin" /> : <Mail size={14} />}
                {sendingTicket ? 'Sending…' : `Send Ticket to ${hazardCategoryMap[report.category].department}`}
              </button>
              {ticketError && <p className="mt-1.5 font-mono text-[11px] text-high-risk">{ticketError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
