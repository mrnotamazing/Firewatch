import { useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Search, LoaderCircle, ShieldCheck, Flame, Printer, Phone,
  DoorOpen, BellRing, Zap, ClipboardList, HeartPulse,
} from 'lucide-react';
import type { LocalityStats } from '../lib/scoring';
import { riskBandMeta } from '../lib/scoring';
import { nearestStation, haversineKm } from '../lib/geo';
import type { FireStation } from '../lib/types';
import { hospitals } from '../lib/data/hospitals';
import { policeStations } from '../lib/data/policeStations';

const BLR_CENTER = { lat: 12.9716, lng: 77.5946 };

const UNIVERSAL_NUMBERS = [
  { label: 'Universal Emergency', number: '112' },
  { label: 'Fire & Rescue', number: '101' },
  { label: 'Police', number: '100' },
  { label: 'Ambulance', number: '108' },
  { label: "Women's Helpline", number: '1091' },
  { label: 'Child Helpline', number: '1098' },
];

const SAFETY_CHECKLIST = [
  { icon: DoorOpen, text: 'Know two exit routes from your home or workplace, and agree on a meeting point outside.' },
  { icon: Flame, text: 'Keep a fire extinguisher or a damp heavy cloth in the kitchen, and know how to use it.' },
  { icon: Zap, text: 'Never leave a gas cylinder near an open flame, and don’t overload electrical sockets.' },
  { icon: BellRing, text: 'Test smoke alarms monthly; replace the battery at least once a year.' },
  { icon: ClipboardList, text: 'Keep this sheet somewhere every member of the household knows to find it.' },
];

/** Turns coordinates into a short, printable street address via reverse geocoding —
 * a live link is useless on paper, but a real address still is. */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    );
    const data = await res.json();
    const a = data?.address ?? {};
    const parts = [a.road, a.suburb || a.neighbourhood, a.city_district || a.city].filter(Boolean);
    return parts.length ? parts.join(', ') : (data?.display_name ?? 'Address unavailable — see map for location');
  } catch {
    return 'Address unavailable — see map for location';
  }
}

interface PrepResult {
  stat: LocalityStats;
  hospital: { station: FireStation; distanceKm: number; address: string };
  police: { station: FireStation; distanceKm: number; address: string };
  fireAddress: string;
  matchedNote: string | null;
}

function FacilityRow({ label, icon, name, distanceKm, address }: { label: string; icon: ReactNode; name: string; distanceKm: number; address: string }) {
  return (
    <div className="flex items-start gap-2.5 border-b border-ink/10 py-3 last:border-b-0">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-ink/15 text-ink/60">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[9.5px] font-semibold uppercase tracking-wide text-ink/45">{label}</div>
        <div className="text-[13px] font-semibold text-ink">{name}</div>
        <div className="mt-0.5 text-[11px] leading-snug text-ink/55">{address}</div>
        <div className="mt-0.5 font-mono text-[10.5px] text-ink/45">{distanceKm.toFixed(1)} km away</div>
      </div>
    </div>
  );
}

function PrepSheet({ result }: { result: PrepResult }) {
  const { stat, hospital, police } = result;
  const color = riskBandMeta[stat.band].color;
  return (
    <div>
      <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
        <ShieldCheck size={30} className="shrink-0 text-ember" />
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-mono text-[20px] font-bold"
          style={{ background: `${color}18`, border: `3px solid ${color}`, color }}
        >
          {stat.safetyScore}
        </div>
        <div>
          <div className="font-mono text-[10px] font-medium uppercase tracking-wide text-ink/45">Emergency Prep Sheet</div>
          <h3 className="font-display text-[22px] font-bold uppercase leading-none text-ink">{stat.locality.name}</h3>
        </div>
      </div>

      {result.matchedNote && (
        <p className="mt-3 border border-ember/30 bg-ember-soft px-3 py-2 text-[11.5px] leading-snug text-ember-2 print:hidden">
          {result.matchedNote}
        </p>
      )}

      <div className="mt-4">
        <div className="mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Nearest Help</div>
        <FacilityRow label="Fire Station" icon={<Flame size={15} />} name={stat.nearestStation.name} distanceKm={stat.distanceKm} address={result.fireAddress} />
        <FacilityRow label="Hospital" icon={<HeartPulse size={15} />} name={hospital.station.name} distanceKm={hospital.distanceKm} address={hospital.address} />
        <FacilityRow label="Police Station" icon={<ShieldCheck size={15} />} name={police.station.name} distanceKm={police.distanceKm} address={police.address} />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Universal Numbers</div>
        <div className="grid grid-cols-2 gap-1.5">
          {UNIVERSAL_NUMBERS.map((n) => (
            <div key={n.number} className="flex items-center justify-between border border-ink/15 px-2.5 py-1.5">
              <span className="text-[11.5px] text-ink/70">{n.label}</span>
              <span className="flex items-center gap-1 font-mono text-[13px] font-bold text-ember-2">
                <Phone size={10} /> {n.number}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ink/45">Fire Safety Checklist</div>
        <ul className="space-y-2">
          {SAFETY_CHECKLIST.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink/70">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-ink/15 text-ember-2">
                <Icon size={13} />
              </span>
              <span className="pt-0.5">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 border-t border-ink/15 pt-3 font-mono text-[9.5px] leading-relaxed text-ink/40">
        Generated by FireWatch Bengaluru — a community awareness tool, not an official emergency service. In a real
        emergency, call 112 or 101 immediately.
      </p>
    </div>
  );
}

export default function PrepareLocalityModal({ allStats, onClose }: { allStats: LocalityStats[]; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrepResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError(null);
    setSearching(true);
    try {
      const direct = allStats.find((s) => s.locality.name.toLowerCase().includes(q.toLowerCase()));
      let matched: LocalityStats;
      let matchedNote: string | null = null;

      if (direct) {
        matched = direct;
      } else {
        const bQuery = /bengaluru|bangalore/i.test(q) ? q : `${q}, Bengaluru`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(bQuery)}`);
        const results: { lat: string; lon: string }[] = await res.json();
        if (!results.length) {
          setError(`Couldn't find "${q}". Try a locality, road, or landmark name.`);
          return;
        }
        const point = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
        if (haversineKm(point, BLR_CENTER) > 45) {
          setError(`"${q}" looks like it's outside Bengaluru — this tool only covers Bengaluru localities right now.`);
          return;
        }
        let best = allStats[0];
        let bestKm = Infinity;
        for (const s of allStats) {
          const d = haversineKm(point, s.locality);
          if (d < bestKm) {
            bestKm = d;
            best = s;
          }
        }
        matched = best;
        matchedNote = `"${q}" isn't directly covered — showing the closest scored locality: ${best.locality.name} (${bestKm.toFixed(1)} km away).`;
      }

      const hospitalNearest = nearestStation(matched.locality, hospitals);
      const policeNearest = nearestStation(matched.locality, policeStations);

      const [fireAddress, hospitalAddress, policeAddress] = await Promise.all([
        reverseGeocode(matched.nearestStation.lat, matched.nearestStation.lng),
        reverseGeocode(hospitalNearest.station.lat, hospitalNearest.station.lng),
        reverseGeocode(policeNearest.station.lat, policeNearest.station.lng),
      ]);

      setResult({
        stat: matched,
        hospital: { ...hospitalNearest, address: hospitalAddress },
        police: { ...policeNearest, address: policeAddress },
        fireAddress,
        matchedNote,
      });
    } catch {
      setError('Could not look up that area right now. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  }

  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/60 p-4 py-10 print:relative print:inset-auto print:block print:bg-paper print:p-0" onClick={onClose}>
      <div
        className="animate-modal-in w-full max-w-lg border border-ink bg-paper shadow-2xl print:w-full print:max-w-none print:border-0 print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-4 print:hidden">
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-wide text-ink/45">Be Ready</div>
            <h2 className="font-display text-[19px] font-bold uppercase leading-none text-ink">Prepare Your Locality</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center border border-ink/20 text-ink/50 hover:bg-paper-2 hover:text-ink">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {!result ? (
            <>
              <p className="mb-4 text-[13px] leading-relaxed text-ink/60 print:hidden">
                Type your locality and we'll build a one-page sheet with your nearest fire station, hospital, and
                police station — plus universal emergency numbers — ready to save or print before you need it.
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2 print:hidden">
                <div className="relative flex-1">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Jakkur, Whitefield, HSR Layout…"
                    autoFocus
                    className="w-full border border-line bg-paper py-2.5 pl-9 pr-3 text-[13px] text-ink focus:border-ink focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !query.trim()}
                  className="flex items-center gap-1.5 bg-ember px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-wide text-paper hover:bg-ember-2 disabled:opacity-40"
                >
                  {searching ? <LoaderCircle size={14} className="animate-spin" /> : 'Generate'}
                </button>
              </form>
              {searching && (
                <p className="mt-3 font-mono text-[11px] text-ink/45 print:hidden">Looking up nearest help and addresses…</p>
              )}
              {error && <p className="mt-3 border border-high-risk/30 bg-high-risk-soft px-3 py-2 text-[12px] text-high-risk print:hidden">{error}</p>}
            </>
          ) : (
            <>
              <PrepSheet result={result} />
              <div className="mt-5 flex gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex flex-1 items-center justify-center gap-1.5 bg-ink py-2.5 font-display text-[13px] font-semibold uppercase tracking-wide text-paper hover:bg-ink-2"
                >
                  <Printer size={14} /> Print / Save as PDF
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="border border-ink px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-wide text-ink hover:bg-paper-2"
                >
                  Try Another
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
