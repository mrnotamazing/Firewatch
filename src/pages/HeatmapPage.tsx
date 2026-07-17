import { useMemo, useState } from 'react';
import { Search, Camera, Database, MapPin, LayoutGrid, Waves, ShieldCheck, Images, PanelRightClose, PanelRightOpen, SlidersHorizontal, X, FileHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeatmapMap, { type MapMode } from '../components/HeatmapMap';
import LocalityDetailPanel from '../components/LocalityDetailPanel';
import PrepareLocalityModal from '../components/PrepareLocalityModal';
import RiskBadge from '../components/RiskBadge';
import StatCard from '../components/StatCard';
import { useHazardStore } from '../lib/store';
import { localities } from '../lib/data/localities';
import { computeLocalityStats, riskBandMeta, type RiskBand } from '../lib/scoring';
import { haversineKm } from '../lib/geo';

const BLR_CENTER = { lat: 12.9716, lng: 77.5946 };

const RISK_FILTERS: { id: RiskBand | 'all'; label: string }[] = [
  { id: 'all', label: 'All Risk Levels' },
  { id: 'safe', label: 'Safe (80+)' },
  { id: 'moderate', label: 'Moderate (65–79)' },
  { id: 'at-risk', label: 'At Risk (50–64)' },
  { id: 'high-risk', label: 'High Risk (<50)' },
];

const TYPE_FILTERS = ['All Types', 'residential', 'commercial', 'industrial', 'mixed'] as const;

const DENSITY_FILTERS: { id: 'all' | 'low' | 'medium' | 'high'; label: string }[] = [
  { id: 'all', label: 'All Densities' },
  { id: 'low', label: 'Low (<12k/km²)' },
  { id: 'medium', label: 'Medium (12k–18k/km²)' },
  { id: 'high', label: 'High (18k+/km²)' },
];

function densityBand(perSqKm: number): 'low' | 'medium' | 'high' {
  if (perSqKm < 12000) return 'low';
  if (perSqKm <= 18000) return 'medium';
  return 'high';
}

export default function HeatmapPage() {
  const reports = useHazardStore((s) => s.reports);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>('All Types');
  const [riskFilter, setRiskFilter] = useState<RiskBand | 'all'>('all');
  const [densityFilter, setDensityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('markers');
  // Both side panels default open on tablet/desktop, but start closed on phones so the map itself
  // — the main feature — is immediately visible instead of being squeezed into a sliver.
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
  const [panelOpen, setPanelOpen] = useState(isDesktop);
  const [controlsOpen, setControlsOpen] = useState(isDesktop);
  const [searchNote, setSearchNote] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [prepareOpen, setPrepareOpen] = useState(false);
  const [sortKey, setSortKey] = useState<'score' | 'name' | 'density'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // Selecting a locality always reveals the detail panel, even if the user had collapsed it.
  function handleSelect(id: string | null) {
    setSelectedId(id);
    if (id) setPanelOpen(true);
  }

  const allStats = useMemo(
    () => localities.map((l) => computeLocalityStats(l, reports)).sort((a, b) => a.safetyScore - b.safetyScore),
    [reports],
  );

  const filteredStats = useMemo(
    () =>
      allStats.filter((s) => {
        if (search && !s.locality.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter !== 'All Types' && s.locality.type !== typeFilter) return false;
        if (riskFilter !== 'all' && s.band !== riskFilter) return false;
        if (densityFilter !== 'all' && densityBand(s.locality.populationDensityPerSqKm) !== densityFilter) return false;
        return true;
      }),
    [allStats, search, typeFilter, riskFilter, densityFilter],
  );

  const selected = allStats.find((s) => s.locality.id === selectedId) ?? null;

  const tableStats = useMemo(() => {
    const arr = [...filteredStats];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'score') cmp = a.safetyScore - b.safetyScore;
      else if (sortKey === 'name') cmp = a.locality.name.localeCompare(b.locality.name);
      else cmp = a.locality.populationDensityPerSqKm - b.locality.populationDensityPerSqKm;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredStats, sortKey, sortDir]);

  /** Enter in the search box: if the text matches no scored locality, geocode it and snap to the nearest one. */
  async function handleSearchSubmit() {
    const q = search.trim();
    if (!q) return;
    const hasDirectMatch = allStats.some((s) => s.locality.name.toLowerCase().includes(q.toLowerCase()));
    if (hasDirectMatch) {
      setSearchNote(null);
      return;
    }
    setSearching(true);
    setSearchNote(null);
    try {
      const query = /bengaluru|bangalore/i.test(q) ? q : `${q}, Bengaluru`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      );
      const results: { lat: string; lon: string }[] = await res.json();
      if (!results.length) {
        setSearchNote(`No place found for "${q}". Try a locality, road, or landmark name.`);
        return;
      }
      const point = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      if (haversineKm(point, BLR_CENTER) > 45) {
        setSearchNote(`"${q}" is outside Bengaluru — FireWatch only scores Bengaluru localities right now.`);
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
      setSearch('');
      handleSelect(best.locality.id);
      setSearchNote(
        `"${q}" isn't a scored area yet — showing the closest scored locality: ${best.locality.name} (${bestKm.toFixed(1)} km away).`,
      );
    } catch {
      setSearchNote('Could not look up that address right now. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  }

  const avgScore = Math.round(allStats.reduce((sum, s) => sum + s.safetyScore, 0) / allStats.length);
  const activeHazards = allStats.reduce((sum, s) => sum + s.activeHazards, 0);
  const pendingHazards = allStats.reduce((sum, s) => sum + s.pendingHazards, 0);
  const highRiskZones = allStats.filter((s) => s.band === 'high-risk').length;

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-2 border-b border-ink bg-paper px-6 py-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink/45">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
            Live Safety Intelligence · Bengaluru · Updated every 6 hours
          </div>
          <h1 className="mt-1 font-display text-[42px] font-bold uppercase leading-none text-ink sm:text-[48px]">
            Fire Safety Heatmap
          </h1>
        </div>
        <div className="flex max-w-sm flex-col items-start gap-2.5 sm:items-end">
          <p className="text-[13px] leading-relaxed text-ink/55">
            Real-time fire risk for every Bengaluru locality — powered by fire station proximity, reported hazards,
            population density, and area type.
          </p>
          <button
            onClick={() => setPrepareOpen(true)}
            className="flex items-center gap-1.5 bg-ink px-4 py-2 font-display text-[12.5px] font-semibold uppercase tracking-wide text-paper hover:bg-ink-2"
          >
            <FileHeart size={14} /> Prepare Your Locality
          </button>
        </div>
      </div>

      {prepareOpen && <PrepareLocalityModal allStats={allStats} onClose={() => setPrepareOpen(false)} />}

      <div className="border-b border-ink bg-paper-2 px-4 py-6 sm:px-10 sm:py-10 lg:px-16">
      <div className="relative mx-auto h-[70vh] min-h-[480px] w-full max-w-[1400px] border border-ink shadow-md">
        <HeatmapMap stats={filteredStats} selectedId={selectedId} onSelect={handleSelect} mode={mapMode} />

        {controlsOpen ? (
          <div className="absolute left-14 top-3 z-[20] w-[260px] space-y-1.5 sm:w-[300px]" style={{ transform: 'translateZ(0)' }}>
            <div className="flex items-center justify-between border border-line bg-paper/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink/45">Map Controls</span>
              <button onClick={() => setControlsOpen(false)} title="Hide controls" className="text-ink/40 hover:text-ember">
                <X size={14} />
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchNote(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                placeholder="Search locality or address… (Enter)"
                className="w-full border border-line bg-paper py-2 pl-9 pr-3 text-[13px] text-ink shadow-md placeholder:text-ink/35 focus:border-ink focus:outline-none"
              />
            </div>
            {searching && (
              <div className="border border-line bg-paper/95 px-3 py-2 font-mono text-[11px] text-ink/55 shadow-md">
                Looking up that address…
              </div>
            )}
            {searchNote && (
              <div className="flex items-start gap-2 border border-ember/30 bg-ember-soft px-3 py-2 shadow-md">
                <p className="flex-1 text-[11.5px] leading-snug text-ember-2">{searchNote}</p>
                <button onClick={() => setSearchNote(null)} aria-label="Dismiss search note" className="mt-0.5 text-ember/60 hover:text-ember-2">
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex gap-1.5">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="w-1/2 border border-line bg-paper px-2.5 py-1.5 text-[12px] capitalize text-ink shadow-md focus:border-ink focus:outline-none"
              >
                {TYPE_FILTERS.map((t) => (
                  <option key={t} value={t}>{t === 'All Types' ? t : `${t[0].toUpperCase()}${t.slice(1)}`}</option>
                ))}
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as RiskBand | 'all')}
                className="w-1/2 border border-line bg-paper px-2.5 py-1.5 text-[12px] text-ink shadow-md focus:border-ink focus:outline-none"
              >
                {RISK_FILTERS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <select
              value={densityFilter}
              onChange={(e) => setDensityFilter(e.target.value as typeof densityFilter)}
              className="w-full border border-line bg-paper px-2.5 py-1.5 text-[12px] text-ink shadow-md focus:border-ink focus:outline-none"
            >
              {DENSITY_FILTERS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <div className="flex border border-line bg-paper shadow-md">
              <button
                onClick={() => setMapMode('markers')}
                className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 font-mono text-[11px] uppercase tracking-wide ${
                  mapMode === 'markers' ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
                }`}
              >
                <LayoutGrid size={12} /> Markers
              </button>
              <button
                onClick={() => setMapMode('gradient')}
                className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 font-mono text-[11px] uppercase tracking-wide ${
                  mapMode === 'gradient' ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
                }`}
              >
                <Waves size={12} /> Gradient
              </button>
            </div>

            <div className="grid grid-cols-2 gap-px border border-line bg-line shadow-md">
              <StatCard value={`${avgScore}%`} label="Avg Score" />
              <StatCard value={String(activeHazards)} label="Active" tone="ember" />
              <StatCard value={String(pendingHazards)} label="Pending" />
              <StatCard value={String(highRiskZones)} label="High Risk" tone="ember" />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setControlsOpen(true)}
            title="Show map controls"
            className="absolute left-14 top-3 z-[20] flex items-center gap-1.5 border border-line bg-paper/95 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink shadow-md backdrop-blur-sm hover:border-ink"
            style={{ transform: 'translateZ(0)' }}
          >
            <SlidersHorizontal size={13} /> Controls
          </button>
        )}

        <div className="absolute bottom-3 left-3 z-[20] border border-line bg-paper/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm" style={{ transform: 'translateZ(0)' }}>
          <div className="mb-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-wide text-ink/45">Safety Score</div>
          <div className="space-y-1 font-mono text-[10.5px] text-ink/70">
            {(['safe', 'moderate', 'at-risk', 'high-risk'] as RiskBand[]).map((b) => (
              <div key={b} className="flex items-center gap-2">
                <span className="h-2 w-2" style={{ background: riskBandMeta[b].color }} />
                {riskBandMeta[b].label}
              </div>
            ))}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: '#c0392b' }} />
              Fire Station
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: '#2563a8' }} />
              Hospital <span className="text-ink/40">(zoom in)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: '#1d3557' }} />
              Police Station <span className="text-ink/40">(zoom in)</span>
            </div>
          </div>
        </div>

        {panelOpen ? (
          <div
            className="absolute right-0 top-0 z-[30] h-full w-full border-l border-ink bg-paper shadow-2xl sm:max-w-[340px]"
            style={{ transform: 'translateZ(0)' }}
          >
            {!selected && (
              <button
                onClick={() => setPanelOpen(false)}
                title="Close panel"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-ink bg-ink text-paper hover:bg-ink-2 sm:left-0 sm:right-auto sm:top-4 sm:-translate-x-full sm:border-r-0"
              >
                <PanelRightClose size={15} />
              </button>
            )}
            {selected ? (
              <LocalityDetailPanel stat={selected} onClose={() => { setSelectedId(null); setPanelOpen(isDesktop); }} />
            ) : (
              <div className="flex h-full flex-col">
                <div className="border-b border-ink/15 px-5 py-4">
                  <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-ink/45">Watchlist</div>
                  <h3 className="mt-0.5 font-display text-[22px] font-bold uppercase leading-none text-ink">Highest Risk Now</h3>
                </div>
                <div className="flex-1 divide-y divide-ink/10 overflow-y-auto">
                  {allStats.slice(0, 8).map((s) => (
                    <button
                      key={s.locality.id}
                      onClick={() => handleSelect(s.locality.id)}
                      className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left hover:bg-paper-2"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="font-mono text-[20px] font-bold" style={{ color: riskBandMeta[s.band].color }}>
                          {s.safetyScore}
                        </span>
                        <span className="text-[13px] font-medium text-ink">{s.locality.name}</span>
                      </span>
                      <RiskBadge band={s.band} />
                    </button>
                  ))}
                </div>
                <div className="border-t border-ink/15 px-5 py-3 text-center font-mono text-[11px] text-ink/45">
                  <MapPin size={12} className="mr-1 inline -mt-0.5" />
                  Click any marker or row for full detail
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setPanelOpen(true)}
            title="Open panel"
            className="absolute right-3 top-1/2 z-[30] flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-ink bg-ink text-paper shadow-lg hover:bg-ink-2"
            style={{ transform: 'translateY(-50%) translateZ(0)' }}
          >
            <PanelRightOpen size={16} />
          </button>
        )}
      </div>
      </div>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-bold uppercase leading-none text-ink">All Localities</h2>
          <span className="font-mono text-[11px] text-ink/45">{filteredStats.length} records</span>
        </div>

        <div className="overflow-x-auto border border-ink">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink bg-paper-2 font-mono text-[10.5px] uppercase tracking-wide text-ink/55">
                <th className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-ink" onClick={() => toggleSort('score')}>
                  Score {sortKey === 'score' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-ink" onClick={() => toggleSort('name')}>
                  Locality {sortKey === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-ink" onClick={() => toggleSort('density')}>
                  Density {sortKey === 'density' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2.5 font-medium">Active</th>
                <th className="px-4 py-2.5 font-medium">Pending</th>
                <th className="px-4 py-2.5 font-medium">Risk Band</th>
              </tr>
            </thead>
            <tbody>
              {tableStats.map((s) => (
                <tr
                  key={s.locality.id}
                  onClick={() => handleSelect(s.locality.id)}
                  className={`cursor-pointer border-b border-ink/10 text-[13px] transition-colors last:border-b-0 hover:bg-paper-2 ${
                    s.locality.id === selectedId ? 'bg-paper-2' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono text-[19px] font-bold" style={{ color: riskBandMeta[s.band].color }}>
                    {s.safetyScore}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-ink">{s.locality.name}</td>
                  <td className="px-4 py-2.5 capitalize text-ink/60">{s.locality.type}</td>
                  <td className="px-4 py-2.5 font-mono text-ink/70">{s.locality.populationDensityPerSqKm.toLocaleString('en-IN')}/km²</td>
                  <td className="px-4 py-2.5 font-mono text-ink/70">{s.activeHazards}</td>
                  <td className="px-4 py-2.5 font-mono text-ink/70">{s.pendingHazards}</td>
                  <td className="px-4 py-2.5"><RiskBadge band={s.band} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-ink/15 bg-paper-2">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5">
          <Link to="/report" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            <Camera size={14} /> Report a Hazard
          </Link>
          <Link to="/accountability" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            <ShieldCheck size={14} /> Department Accountability
          </Link>
          <Link to="/gallery" className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember">
            <Images size={14} /> Before &amp; After Gallery
          </Link>
          <a
            href="https://data.opencity.in/dataset/bengaluru-and-karnataka-fire-stations"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-mono text-[12.5px] font-medium uppercase tracking-wide text-ink hover:text-ember"
          >
            <Database size={14} /> Open Data Source
          </a>
        </div>
      </section>
    </div>
  );
}
