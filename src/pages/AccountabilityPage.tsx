import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, ShieldCheck, TriangleAlert, ArrowRight, MapPin } from 'lucide-react';
import { useHazardStore } from '../lib/store';
import { hazardCategoryMap } from '../lib/data/hazardCategories';

const DEPT_COLORS: Record<string, string> = {
  BESCOM: '#b8862b',
  'Fire Dept': '#dc2626',
  BBMP: '#1d3557',
};

function Donut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = 58;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg viewBox="0 0 160 160" className="h-44 w-44">
        {segments.map((seg) => {
          const frac = seg.value / total;
          const el = (
            <circle
              key={seg.label}
              cx={80}
              cy={80}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={26}
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-acc * C}
              transform="rotate(-90 80 80)"
            >
              <title>{`${seg.label}: ${seg.value} (${Math.round(frac * 100)}%)`}</title>
            </circle>
          );
          acc += frac;
          return el;
        })}
        <text x={80} y={78} textAnchor="middle" className="fill-ink font-mono" fontSize={26} fontWeight={700}>
          {centerValue}
        </text>
        <text x={80} y={96} textAnchor="middle" className="fill-ink/50 font-mono" fontSize={9} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {centerLabel}
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 font-mono text-[11.5px] text-ink/70">
            <span className="h-2.5 w-2.5" style={{ background: seg.color }} />
            {seg.label}
            <span className="font-semibold text-ink">{seg.value}</span>
            <span className="text-ink/40">({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusStack({
  label,
  segments,
  total,
}: {
  label: string;
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[11.5px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-ink/45">{total} routed</span>
      </div>
      <div className="flex h-5 w-full overflow-hidden bg-ink/8">
        {segments.map((seg) =>
          seg.value > 0 ? (
            <div
              key={seg.label}
              className="h-full transition-all"
              style={{ width: `${(seg.value / Math.max(total, 1)) * 100}%`, background: seg.color }}
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}

const ESCALATION_STEPS = [
  {
    title: 'Resident reports',
    body: 'A hazard is submitted through the Report Hazard flow with photo, location, and description.',
  },
  {
    title: 'Officer reviews',
    body: 'An on-duty officer reviews the report during their shift and assigns, escalates, or begins work.',
  },
  {
    title: 'Ticket sent',
    body: 'Once reviewed, the officer sends an automated ticket email to the routing department (BESCOM, BBMP, or Fire Dept).',
  },
  {
    title: 'Resolution tracked',
    body: 'Every report carries a 48-hour target. Reports still open past that window are marked overdue here, in the open.',
  },
];

export default function AccountabilityPage() {
  const reports = useHazardStore((s) => s.reports);

  const departmentStats = useMemo(() => {
    const depts = Array.from(new Set(Object.values(hazardCategoryMap).map((c) => c.department)));
    const now = Date.now();
    return depts
      .map((dept) => {
        const deptReports = reports.filter((r) => hazardCategoryMap[r.category].department === dept);
        const resolved = deptReports.filter((r) => r.status === 'resolved' && r.resolvedAt);
        const overdue = deptReports.filter((r) => r.status !== 'resolved' && r.dueAt < now);
        const pending = deptReports.filter((r) => r.status === 'pending');
        const ticketed = deptReports.filter((r) => r.ticketSentAt);
        const avgResolutionH = resolved.length
          ? Math.round(resolved.reduce((sum, r) => sum + (r.resolvedAt! - r.createdAt), 0) / resolved.length / 3600000)
          : null;
        return {
          dept,
          routed: deptReports.length,
          resolved: resolved.length,
          overdue: overdue.length,
          pending: pending.length,
          ticketed: ticketed.length,
          avgResolutionH,
        };
      })
      .sort((a, b) => b.overdue - a.overdue);
  }, [reports]);

  const totals = departmentStats.reduce(
    (acc, d) => ({
      routed: acc.routed + d.routed,
      resolved: acc.resolved + d.resolved,
      overdue: acc.overdue + d.overdue,
    }),
    { routed: 0, resolved: 0, overdue: 0 },
  );

  return (
    <div>
      <div className="border-b border-ink bg-paper px-6 py-4">
        <div className="mx-auto max-w-[1500px]">
          <Link to="/heatmap" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/50 hover:text-ember">
            ← Back to Heatmap
          </Link>
          <span className="ml-3 font-mono text-[10.5px] uppercase tracking-wide text-ink/45">Public Record</span>
          <h1 className="mt-1 font-display text-[38px] font-bold uppercase leading-none text-ink sm:text-[42px]">
            Department Transparency
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink/55">
            Every hazard report on FireWatch is routed to a specific authority — BESCOM, BBMP, or the Fire Department
            — with a public 48-hour target. This page tracks reported progress on each one, in the open.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="mb-6 grid grid-cols-2 divide-x divide-y divide-ink border border-ink sm:grid-cols-3 sm:divide-y-0">
          <div className="p-4">
            <Mail size={15} className="text-station" />
            <div className="mt-2 font-mono text-[24px] font-semibold leading-none text-ink">{totals.routed}</div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-ink/50">Total Reports Routed</div>
          </div>
          <div className="p-4">
            <ShieldCheck size={15} className="text-safe" />
            <div className="mt-2 font-mono text-[24px] font-semibold leading-none text-ink">{totals.resolved}</div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-ink/50">Resolved</div>
          </div>
          <div className="p-4">
            <TriangleAlert size={15} className="text-high-risk" />
            <div className="mt-2 font-mono text-[24px] font-semibold leading-none text-ink">{totals.overdue}</div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-ink/50">Currently Overdue (&gt;48h)</div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="border border-ink p-5">
            <h2 className="font-display text-[18px] font-bold uppercase leading-none text-ink">Who gets the reports</h2>
            <p className="mb-5 mt-1 font-mono text-[11px] text-ink/45">All reports routed, by department</p>
            <Donut
              segments={departmentStats.map((d) => ({
                label: d.dept,
                value: d.routed,
                color: DEPT_COLORS[d.dept] ?? '#0f0f0f',
              }))}
              centerValue={String(totals.routed)}
              centerLabel="Reports"
            />
          </div>

          <div className="border border-ink p-5">
            <h2 className="font-display text-[18px] font-bold uppercase leading-none text-ink">Where they stand</h2>
            <p className="mb-5 mt-1 font-mono text-[11px] text-ink/45">Status of every routed report</p>
            <div className="space-y-4">
              {departmentStats.map((d) => (
                <StatusStack
                  key={d.dept}
                  label={d.dept}
                  total={d.routed}
                  segments={[
                    { label: 'Resolved', value: d.resolved, color: 'var(--color-safe)' },
                    { label: 'In progress', value: Math.max(d.routed - d.resolved - d.overdue, 0), color: 'var(--color-moderate)' },
                    { label: 'Overdue', value: d.overdue, color: 'var(--color-high-risk)' },
                  ]}
                />
              ))}
              <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-ink/10 pt-3 font-mono text-[10.5px] text-ink/55">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-safe" /> Resolved</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-moderate" /> In progress</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-high-risk" /> Overdue (&gt;48h)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-bold uppercase leading-none text-ink">By Department</h2>
          <span className="font-mono text-[11px] text-ink/45">sorted by overdue count</span>
        </div>

        <div className="mb-10 overflow-x-auto border border-ink">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink bg-paper-2 font-mono text-[10.5px] uppercase tracking-wide text-ink/55">
                <th className="px-4 py-2.5 font-medium">Department</th>
                <th className="px-4 py-2.5 font-medium">Routed</th>
                <th className="px-4 py-2.5 font-medium">Resolved</th>
                <th className="px-4 py-2.5 font-medium">Pending</th>
                <th className="px-4 py-2.5 font-medium">Overdue</th>
                <th className="px-4 py-2.5 font-medium">Tickets Sent</th>
                <th className="px-4 py-2.5 font-medium">Avg Resolution</th>
                <th className="px-4 py-2.5 font-medium">Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((d) => (
                <tr key={d.dept} className="border-b border-ink/10 text-[13px] transition-colors last:border-b-0 hover:bg-paper-2">
                  <td className="px-4 py-2.5 font-semibold text-ink">{d.dept}</td>
                  <td className="px-4 py-2.5 font-mono text-ink/70">{d.routed}</td>
                  <td className="px-4 py-2.5 font-mono text-safe">{d.resolved}</td>
                  <td className="px-4 py-2.5 font-mono text-moderate">{d.pending}</td>
                  <td className={`px-4 py-2.5 font-mono font-semibold ${d.overdue > 0 ? 'text-high-risk' : 'text-ink/40'}`}>{d.overdue}</td>
                  <td className="px-4 py-2.5 font-mono text-ink/70">{d.ticketed}</td>
                  <td className="px-4 py-2.5 font-mono text-ink/70">{d.avgResolutionH !== null ? `${d.avgResolutionH}h` : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden bg-ink/10">
                        <div
                          className="h-full bg-safe"
                          style={{ width: d.routed > 0 ? `${Math.round((d.resolved / d.routed) * 100)}%` : '0%' }}
                        />
                      </div>
                      <span className="font-mono text-[11.5px] text-ink/60">
                        {d.routed > 0 ? `${Math.round((d.resolved / d.routed) * 100)}%` : '—'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-10">
          <h2 className="mb-3 font-display text-[22px] font-bold uppercase leading-none text-ink">How A Report Becomes A Public Record</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ESCALATION_STEPS.map((step, i) => (
              <div key={step.title} className="border border-ink p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center bg-ink font-mono text-[11px] font-semibold text-paper">
                    {i + 1}
                  </span>
                  {i < ESCALATION_STEPS.length - 1 && <ArrowRight size={13} className="hidden text-ink/25 sm:block" />}
                </div>
                <div className="font-display text-[15px] font-bold uppercase text-ink">{step.title}</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-ink/20 bg-paper-2 p-5">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/50">
            <Clock size={13} /> Methodology &amp; limitations
          </div>
          <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-ink/60">
            <li>· All hazard reports are community-submitted. FireWatch does not independently investigate or confirm a hazard before it appears here.</li>
            <li>· The 48-hour target is a benchmark this project sets for itself, not a legal deadline mandated by any department.</li>
            <li>· Ticket emails currently simulate sending during development — see the Officer Dashboard for status. Department contact addresses are placeholders pending verified official channels.</li>
            <li>· "Resolved" reflects officer-marked status, not independent field verification.</li>
            <li>· All figures update live as reports come in — this is not a static snapshot.</li>
          </ul>
        </div>
      </section>

      <section className="border-t border-ink/15 bg-paper-2">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5">
          <Link to="/heatmap" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            <MapPin size={14} /> View Heatmap
          </Link>
          <Link to="/report" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            Report a Hazard
          </Link>
          <Link to="/gallery" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            Before &amp; After Gallery
          </Link>
        </div>
      </section>
    </div>
  );
}
