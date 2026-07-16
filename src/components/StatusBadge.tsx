import type { ReportStatus } from '../lib/types';

export const statusMeta: Record<ReportStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#9a2b20' },
  assigned: { label: 'Assigned', color: '#b8862b' },
  'in-progress': { label: 'In Progress', color: '#2c3e63' },
  resolved: { label: 'Resolved', color: '#1e6f5c' },
  escalated: { label: 'Escalated', color: '#6b3a8a' },
};

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className="inline-flex items-center border px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide"
      style={{ borderColor: meta.color, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}
