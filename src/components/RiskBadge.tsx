import type { RiskBand } from '../lib/scoring';
import { riskBandMeta } from '../lib/scoring';

export default function RiskBadge({ band, score }: { band: RiskBand; score?: number }) {
  const meta = riskBandMeta[band];
  return (
    <span
      className="inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide"
      style={{ borderColor: meta.color, color: meta.color }}
    >
      <span className="h-1.5 w-1.5" style={{ background: meta.color }} />
      {meta.label}
      {typeof score === 'number' && <span>· {score}</span>}
    </span>
  );
}
