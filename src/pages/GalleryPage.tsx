import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Info, X } from 'lucide-react';

interface CaseStudy {
  id: string;
  category: string;
  department: string;
  locality: string;
  description: string;
  resolutionH: number | null;
  sample: boolean;
  beforeSvg: string;
  afterSvg: string;
}

const CASES: CaseStudy[] = [
  {
    id: 'BLR-10237',
    category: 'Blocked Fire Exit',
    department: 'Fire Dept',
    locality: 'Whitefield',
    description: 'Fire exit at ITPL Main Road, Tech Park B blocked by construction material. Cleared after coordination with building management.',
    resolutionH: 31,
    sample: false,
    beforeSvg: `<rect x="10" y="10" width="80" height="80" fill="#fdeeea"/><rect x="35" y="15" width="30" height="70" fill="#bb5220" opacity="0.25"/><rect x="35" y="15" width="30" height="70" fill="none" stroke="#9a2b20" stroke-width="2"/><rect x="40" y="35" width="20" height="12" fill="#9a2b20"/><rect x="40" y="55" width="20" height="12" fill="#9a2b20"/><line x1="30" y1="10" x2="70" y2="90" stroke="#9a2b20" stroke-width="3"/><line x1="70" y1="10" x2="30" y2="90" stroke="#9a2b20" stroke-width="3"/>`,
    afterSvg: `<rect x="10" y="10" width="80" height="80" fill="#dfeae4"/><rect x="35" y="15" width="30" height="70" fill="#1e6f5c" opacity="0.15"/><rect x="35" y="15" width="30" height="70" fill="none" stroke="#1e6f5c" stroke-width="2"/><path d="M42 50 h16" stroke="#1e6f5c" stroke-width="2"/><path d="M52 42 l8 8 -8 8" fill="none" stroke="#1e6f5c" stroke-width="2"/>`,
  },
  {
    id: 'BLR-10247',
    category: 'Flammable Waste / Garbage',
    department: 'BBMP',
    locality: 'Hebbal',
    description: 'Unsegregated waste with plastics piled near flyover underpass. Cleared and segregated bins installed.',
    resolutionH: 96,
    sample: false,
    beforeSvg: `<rect x="10" y="10" width="80" height="80" fill="#fdeeea"/><ellipse cx="35" cy="65" rx="18" ry="12" fill="#9a2b20" opacity="0.3"/><ellipse cx="55" cy="70" rx="14" ry="10" fill="#bb5220" opacity="0.35"/><ellipse cx="68" cy="60" rx="12" ry="9" fill="#9a2b20" opacity="0.25"/><path d="M30 55 l6 -10 6 10" stroke="#9a2b20" stroke-width="2" fill="none"/>`,
    afterSvg: `<rect x="10" y="10" width="80" height="80" fill="#dfeae4"/><rect x="28" y="45" width="16" height="30" rx="2" fill="none" stroke="#1e6f5c" stroke-width="2"/><rect x="48" y="45" width="16" height="30" rx="2" fill="none" stroke="#1e6f5c" stroke-width="2"/><rect x="68" y="45" width="14" height="30" rx="2" fill="none" stroke="#1e6f5c" stroke-width="2"/>`,
  },
  {
    id: 'SAMPLE-A',
    category: 'Hanging / Exposed Wires',
    department: 'BESCOM',
    locality: 'Indiranagar',
    description: 'Sample case study — illustrates what a resolved hanging-wire report will look like once BESCOM confirms fix.',
    resolutionH: 40,
    sample: true,
    beforeSvg: `<rect x="10" y="10" width="80" height="80" fill="#fdeeea"/><line x1="15" y1="30" x2="45" y2="55" stroke="#9a2b20" stroke-width="2.5"/><line x1="45" y1="55" x2="20" y2="70" stroke="#9a2b20" stroke-width="2.5"/><line x1="20" y1="70" x2="55" y2="80" stroke="#9a2b20" stroke-width="2.5"/><line x1="85" y1="25" x2="55" y2="80" stroke="#bb5220" stroke-width="2.5"/><circle cx="15" cy="30" r="3" fill="#9a2b20"/><circle cx="85" cy="25" r="3" fill="#9a2b20"/>`,
    afterSvg: `<rect x="10" y="10" width="80" height="80" fill="#dfeae4"/><line x1="15" y1="30" x2="85" y2="30" stroke="#1e6f5c" stroke-width="2.5"/><line x1="15" y1="42" x2="85" y2="42" stroke="#1e6f5c" stroke-width="2.5"/><circle cx="15" cy="30" r="3" fill="#1e6f5c"/><circle cx="85" cy="30" r="3" fill="#1e6f5c"/><circle cx="15" cy="42" r="3" fill="#1e6f5c"/><circle cx="85" cy="42" r="3" fill="#1e6f5c"/>`,
  },
  {
    id: 'SAMPLE-B',
    category: 'Open Burning / Bonfire',
    department: 'BBMP',
    locality: 'Marathahalli',
    description: 'Sample case study — illustrates what a resolved open-burning report will look like once BBMP confirms fix.',
    resolutionH: 20,
    sample: true,
    beforeSvg: `<rect x="10" y="10" width="80" height="80" fill="#fdeeea"/><path d="M50 25c5 10-8 12-8 24 0 6 5 10 10 10s9-6 8-13c7 5 11 14 11 22" fill="none" stroke="#9a2b20" stroke-width="2.5"/><path d="M25 20c8 6 4 14 10 18" fill="none" stroke="#bb5220" stroke-width="2" opacity="0.6"/><path d="M75 18c-8 6 -4 14 -10 18" fill="none" stroke="#bb5220" stroke-width="2" opacity="0.6"/>`,
    afterSvg: `<rect x="10" y="10" width="80" height="80" fill="#dfeae4"/><path d="M40 70 q10 -22 20 0" fill="none" stroke="#1e6f5c" stroke-width="2.5"/><line x1="50" y1="70" x2="50" y2="50" stroke="#1e6f5c" stroke-width="2.5"/><circle cx="50" cy="45" r="4" fill="#1e6f5c"/>`,
  },
];

export default function GalleryPage() {
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div>
      {!bannerDismissed && (
        <div className="relative border-b border-ember/25 bg-ember/10 px-6 py-2.5">
          <div className="mx-auto flex max-w-[1100px] items-center justify-center gap-2 pr-8 text-center">
            <Info size={14} className="shrink-0 text-ember-2" />
            <p className="font-mono text-[11.5px] font-medium leading-relaxed text-ember-2">
              Real photo testimonials of a fire-safer Bengaluru will be added here once the community and local
              authorities take visible action on reported hazards — until then, illustrations below stand in for
              what that record will look like.
            </p>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            title="Dismiss"
            aria-label="Dismiss notice"
            className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-ember/60 hover:text-ember-2"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="border-b border-ink bg-paper px-6 py-4">
        <div className="mx-auto max-w-[1500px]">
          <Link to="/heatmap" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/50 hover:text-ember">
            ← Back to Heatmap
          </Link>
          <span className="ml-3 font-mono text-[10.5px] uppercase tracking-wide text-ink/45">Community Wins</span>
          <h1 className="mt-1 font-display text-[38px] font-bold uppercase leading-none text-ink sm:text-[42px]">
            Before &amp; After Gallery
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink/55">
            Every resolved report represents a resident who noticed something, and a department that acted. This
            gallery is where that work gets credited publicly.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="mb-6 border border-moderate/40 bg-moderate-soft px-4 py-3 font-mono text-[11.5px] leading-relaxed text-ink/70">
          Illustrations below are stylized diagrams, not photographs. Cards marked <span className="font-semibold text-moderate">SAMPLE</span> are
          placeholders showing the intended format — replace with real before/after photos as officers document resolved hazards.
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {CASES.map((c) => (
            <div key={c.id} className="border border-ink">
              <div className="flex items-center justify-between border-b border-ink bg-paper-2 px-4 py-2.5">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink/60">{c.category}</span>
                {c.sample ? (
                  <span className="border border-moderate px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-moderate">Sample</span>
                ) : (
                  <span className="font-mono text-[10.5px] text-ink/40">{c.id}</span>
                )}
              </div>

              <div className="grid grid-cols-2 divide-x divide-ink">
                <div>
                  <svg viewBox="0 0 100 100" className="w-full border-b border-ink" dangerouslySetInnerHTML={{ __html: c.beforeSvg }} />
                  <div className="bg-high-risk-soft py-1.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wide text-high-risk">Before</div>
                </div>
                <div>
                  <svg viewBox="0 0 100 100" className="w-full border-b border-ink" dangerouslySetInnerHTML={{ __html: c.afterSvg }} />
                  <div className="bg-safe-soft py-1.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wide text-safe">After</div>
                </div>
              </div>

              <div className="space-y-2 p-4">
                <p className="text-[12.5px] leading-relaxed text-ink/70">{c.description}</p>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[10.5px] uppercase tracking-wide text-ink/45">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {c.locality}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {c.resolutionH !== null ? `Resolved in ${c.resolutionH}h` : 'In progress'}</span>
                  <span>→ {c.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/15 bg-paper-2">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5">
          <Link to="/heatmap" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            View Heatmap
          </Link>
          <Link to="/report" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            Report a Hazard
          </Link>
          <Link to="/accountability" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            Department Accountability
          </Link>
        </div>
      </section>
    </div>
  );
}
