import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, MapPin, ShieldCheck, Images, ArrowRight, Flame,
  Megaphone, ClipboardCheck, Mail, Clock3,
} from 'lucide-react';
import HeatmapMap from '../components/HeatmapMap';
import SkylineWatermark from '../components/SkylineWatermark';
import { useHazardStore } from '../lib/store';
import { localities } from '../lib/data/localities';
import { computeLocalityStats } from '../lib/scoring';

const HOW_IT_WORKS = [
  { icon: Camera, title: 'Spot it', body: 'See a hazard — hanging wires, blocked exit, open burning. Photograph it in under 60 seconds.' },
  { icon: Megaphone, title: 'Report it', body: 'Your report is pinned to the exact locality and routed to the right authority automatically.' },
  { icon: ClipboardCheck, title: 'Officer verifies', body: 'An on-duty officer reviews it and sends a ticket to BESCOM, BBMP, or the Fire Department.' },
  { icon: Clock3, title: 'Tracked publicly', body: 'Every report carries a 48-hour clock. Overdue ones show up on the public Accountability page.' },
];

export default function HomePage() {
  const reports = useHazardStore((s) => s.reports);
  const [previewSelected, setPreviewSelected] = useState<string | null>(null);

  const allStats = useMemo(
    () => localities.map((l) => computeLocalityStats(l, reports)).sort((a, b) => a.safetyScore - b.safetyScore),
    [reports],
  );

  const avgScore = Math.round(allStats.reduce((sum, s) => sum + s.safetyScore, 0) / allStats.length);
  const activeHazards = allStats.reduce((sum, s) => sum + s.activeHazards, 0);
  const highRiskZones = allStats.filter((s) => s.band === 'high-risk').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-ink bg-paper px-6 py-16 sm:py-20">
        <SkylineWatermark className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-ink/[0.05] sm:h-56 md:h-64 lg:h-72 xl:h-80" />
        <div className="relative mx-auto max-w-[1100px] text-center">
          <span className="inline-flex items-center gap-1.5 border border-ember/30 bg-ember-soft px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-ember-2">
            <Flame size={12} /> Bengaluru Fire &amp; Emergency Services
          </span>
          <h1 className="mt-5 font-display text-[42px] font-bold leading-[1.05] text-ink sm:text-[62px]">
            Know how fire-safe your neighborhood really is.
          </h1>
          <p className="mx-auto mt-4 max-w-[640px] text-[16px] leading-relaxed text-ink/60 sm:text-[18px]">
            FireWatch turns resident reports into public pressure — a live risk map of Bengaluru, a 60-second way
            to flag a hazard, and a public record of whether the authorities actually fixed it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/heatmap"
              className="flex items-center gap-2 bg-ember px-6 py-3.5 font-display text-[15px] font-semibold uppercase tracking-wide text-paper shadow-sm transition-colors hover:bg-ember-2"
            >
              <MapPin size={16} /> View Fire Safety Heatmap
            </Link>
            <Link
              to="/report"
              className="flex items-center gap-2 border border-ink px-6 py-3.5 font-display text-[15px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-paper-2"
            >
              <Camera size={16} /> Report a Hazard
            </Link>
          </div>
        </div>
      </div>

      {/* Live stat strip */}
      <div className="border-b border-ink bg-ink">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 divide-x divide-paper/15 sm:grid-cols-4">
          <div className="px-4 py-6 text-center">
            <div className="font-mono text-[28px] font-semibold leading-none text-paper">{avgScore}%</div>
            <div className="mt-2 font-mono text-[10.5px] uppercase tracking-wide text-paper/50">Avg Safety Score</div>
          </div>
          <div className="px-4 py-6 text-center">
            <div className={`font-mono text-[28px] font-semibold leading-none ${activeHazards > 0 ? 'text-ember' : 'text-paper'}`}>{activeHazards}</div>
            <div className="mt-2 font-mono text-[10.5px] uppercase tracking-wide text-paper/50">Active Hazards</div>
          </div>
          <div className="px-4 py-6 text-center">
            <div className={`font-mono text-[28px] font-semibold leading-none ${highRiskZones > 0 ? 'text-ember' : 'text-paper'}`}>{highRiskZones}</div>
            <div className="mt-2 font-mono text-[10.5px] uppercase tracking-wide text-paper/50">High Risk Zones</div>
          </div>
          <div className="px-4 py-6 text-center">
            <div className="font-mono text-[28px] font-semibold leading-none text-paper">{resolvedCount}</div>
            <div className="mt-2 font-mono text-[10.5px] uppercase tracking-wide text-paper/50">Resolved to Date</div>
          </div>
        </div>
      </div>

      {/* Live map preview */}
      <section className="border-b border-ink bg-paper-2 px-6 py-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-wide text-ink/45">Live &amp; interactive</div>
              <h2 className="mt-1 font-display text-[28px] font-bold uppercase leading-none text-ink sm:text-[32px]">
                Every locality, scored right now
              </h2>
            </div>
            <Link to="/heatmap" className="flex shrink-0 items-center gap-1.5 font-mono text-[12.5px] font-semibold uppercase tracking-wide text-ember hover:text-ember-2">
              Open Full Heatmap <ArrowRight size={14} />
            </Link>
          </div>

          <Link to="/heatmap" className="group relative block h-[420px] overflow-hidden border border-ink shadow-sm">
            <div className="pointer-events-none absolute inset-0 z-[25]">
              <HeatmapMap stats={allStats} selectedId={previewSelected} onSelect={setPreviewSelected} mode="markers" />
            </div>
            <div className="absolute inset-0 z-[26] flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/10">
              <span className="translate-y-2 bg-ink px-5 py-2.5 font-display text-[13px] font-semibold uppercase tracking-wide text-paper opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
                Open Full Heatmap →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink bg-paper px-6 py-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 text-center">
            <div className="font-mono text-[10.5px] uppercase tracking-wide text-ink/45">How it works</div>
            <h2 className="mt-1 font-display text-[28px] font-bold uppercase leading-none text-ink sm:text-[32px]">
              From a photo to a fixed problem
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="border border-line p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center border border-ember/30 bg-ember-soft text-ember">
                      <Icon size={18} />
                    </span>
                    <span className="font-mono text-[11px] text-ink/30">0{i + 1}</span>
                  </div>
                  <div className="font-display text-[16px] font-bold uppercase text-ink">{step.title}</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink/60">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-b border-ink bg-paper-2 px-6 py-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 text-center">
            <div className="font-mono text-[10.5px] uppercase tracking-wide text-ink/45">Explore FireWatch</div>
            <h2 className="mt-1 font-display text-[28px] font-bold uppercase leading-none text-ink sm:text-[32px]">
              Four ways to get involved
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/heatmap" className="group flex flex-col justify-between border border-ink bg-paper p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span className="flex h-11 w-11 items-center justify-center border border-ink bg-ink text-paper"><MapPin size={19} /></span>
                <h3 className="mt-4 font-display text-[20px] font-bold uppercase text-ink">Fire Safety Heatmap</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">
                  A live, area-by-area safety score for Bengaluru — driven by fire station proximity, reported
                  hazards, population density, and area type.
                </p>
              </div>
              <span className="mt-5 flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-wide text-ember">
                Explore the map <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link to="/report" className="group flex flex-col justify-between border border-ink bg-paper p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span className="flex h-11 w-11 items-center justify-center border border-ember bg-ember text-paper"><Camera size={19} /></span>
                <h3 className="mt-4 font-display text-[20px] font-bold uppercase text-ink">Report a Hazard</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">
                  Snap a photo, pin the location, and your report routes itself to BESCOM, BBMP, or the Fire
                  Department — done in under a minute.
                </p>
              </div>
              <span className="mt-5 flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-wide text-ember">
                File a report <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link to="/accountability" className="group flex flex-col justify-between border border-ink bg-paper p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span className="flex h-11 w-11 items-center justify-center border border-ink bg-ink text-paper"><ShieldCheck size={19} /></span>
                <h3 className="mt-4 font-display text-[20px] font-bold uppercase text-ink">Department Accountability</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">
                  See exactly how BESCOM, BBMP, and the Fire Department are performing — reports routed, resolved,
                  and overdue, in the open.
                </p>
              </div>
              <span className="mt-5 flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-wide text-ember">
                See the record <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link to="/gallery" className="group flex flex-col justify-between border border-ink bg-paper p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span className="flex h-11 w-11 items-center justify-center border border-ink bg-ink text-paper"><Images size={19} /></span>
                <h3 className="mt-4 font-display text-[20px] font-bold uppercase text-ink">Before &amp; After Gallery</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">
                  Every resolved report is a resident who noticed something and a department that acted. See the
                  wins, credited publicly.
                </p>
              </div>
              <span className="mt-5 flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-wide text-ember">
                See what got fixed <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="relative overflow-hidden bg-ink px-6 py-14">
        <SkylineWatermark className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-paper/[0.06] sm:h-44 md:h-52 lg:h-60 xl:h-64" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col items-center gap-5 text-center">
          <Mail size={26} className="text-ember" />
          <h2 className="font-display text-[26px] font-bold uppercase leading-tight text-paper sm:text-[30px]">
            Seen something dangerous today?
          </h2>
          <p className="max-w-md text-[14px] text-paper/60">
            Don&apos;t wait for someone else to report it. It takes under a minute, and it goes straight to the
            department that can fix it.
          </p>
          <Link
            to="/report"
            className="flex items-center gap-2 bg-ember px-6 py-3.5 font-display text-[15px] font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-ember-2"
          >
            <Camera size={16} /> Report a Hazard Now
          </Link>
        </div>
      </section>
    </div>
  );
}
