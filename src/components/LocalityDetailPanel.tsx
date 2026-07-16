import { Building2, ShieldCheck, Camera, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LocalityStats } from '../lib/scoring';
import { riskBandMeta } from '../lib/scoring';
import RiskBadge from './RiskBadge';

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-ink/55">{label}</span>
        <span className="font-mono font-medium text-ink">{value}</span>
      </div>
      <div className="h-1 w-full overflow-hidden bg-paper-3">
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function LocalityDetailPanel({ stat, onClose }: { stat: LocalityStats; onClose: () => void }) {
  const color = riskBandMeta[stat.band].color;
  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex items-start justify-between gap-2 border-b border-ink/15 px-5 py-4">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-mono text-[24px] font-bold"
            style={{ background: `${color}18`, border: `3px solid ${color}`, color }}
          >
            {stat.safetyScore}
          </div>
          <div>
            <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-ink/45">
              Locality Record
            </div>
            <h3 className="mt-0.5 font-display text-[24px] font-bold uppercase leading-none text-ink">
              {stat.locality.name}
            </h3>
            <div className="mt-1.5">
              <RiskBadge band={stat.band} />
            </div>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink/20 text-ink/50 hover:bg-paper-2 hover:text-ink">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-1.5 border-b border-ink/10 pb-2.5 text-[12px] text-ink/65">
          <Building2 size={13} className="text-ink/45" />
          Area type
          <span className="ml-auto font-mono text-[12px] font-semibold uppercase text-ink">{stat.locality.type}</span>
        </div>

        <div className="flex items-center gap-1.5 border-b border-ink/10 pb-2.5 text-[12px] text-ink/65">
          <ShieldCheck size={13} className="text-station" />
          Nearest: <span className="font-medium text-ink">{stat.nearestStation.name}</span>
          <span className="ml-auto font-mono text-[12px] font-semibold text-ink">{stat.distanceKm.toFixed(1)} km</span>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-ink/65">
          <Users size={13} className="text-brass" />
          Population density
          <span className="ml-auto font-mono text-[12px] font-semibold text-ink">
            {stat.locality.populationDensityPerSqKm.toLocaleString('en-IN')}/km²
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-ink/10 border border-ink/10 text-center">
          <div className="py-2.5">
            <div className="font-mono text-[19px] font-semibold text-high-risk">{stat.activeHazards}</div>
            <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink/50">Active</div>
          </div>
          <div className="py-2.5">
            <div className="font-mono text-[19px] font-semibold text-moderate">{stat.pendingHazards}</div>
            <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink/50">Pending</div>
          </div>
          <div className="py-2.5">
            <div className="font-mono text-[19px] font-semibold text-safe">{stat.resolvedHazards}</div>
            <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink/50">Resolved</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Safety score breakdown</div>
          <ScoreBar label="Fire station proximity (20%)" value={stat.proximityScore} color="var(--color-station)" />
          <ScoreBar label="Hazard-free rating (40%)" value={stat.hazardScore} color="var(--color-ember)" />
          <ScoreBar label="Population density factor (20%)" value={stat.densityScore} color="var(--color-brass)" />
          <ScoreBar label="Area type risk (20%)" value={stat.typeScore} color="var(--color-moderate)" />
        </div>
      </div>

      <div className="border-t border-ink/15 px-5 py-4">
        <Link
          to="/report"
          className="flex w-full items-center justify-center gap-1.5 bg-ink py-2.5 font-display text-[14px] font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-ink-2"
        >
          <Camera size={14} />
          Report a hazard here
        </Link>
      </div>
    </div>
  );
}
