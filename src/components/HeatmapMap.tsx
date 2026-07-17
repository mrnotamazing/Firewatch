import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { LocalityStats } from '../lib/scoring';
import { riskBandMeta } from '../lib/scoring';
import { fireStations } from '../lib/data/fireStations';
import { hospitals } from '../lib/data/hospitals';
import { policeStations } from '../lib/data/policeStations';

export type MapMode = 'markers' | 'gradient';

const BLR_CENTER: [number, number] = [12.965, 77.615];

/** Classic teardrop map-pin marker (Google Maps style) with a centered glyph and drop shadow. */
function pinIcon(bg: string, glyphHtml: string, size = 28) {
  const height = Math.round(size * 1.42);
  const html = `
    <div style="position:relative;width:${size}px;height:${height}px;filter:drop-shadow(0 2px 3px rgba(28,26,23,0.5));">
      <svg width="${size}" height="${height}" viewBox="0 0 24 34" style="position:absolute;top:0;left:0;">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0Z" fill="${bg}" stroke="#f3efe4" stroke-width="1"/>
      </svg>
      <div style="position:absolute;top:${Math.round(size * 0.15)}px;left:0;width:${size}px;height:${Math.round(size * 0.6)}px;display:flex;align-items:center;justify-content:center;">
        ${glyphHtml}
      </div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [size, height], iconAnchor: [size / 2, height] });
}

const FLAME_GLYPH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 2c1 3-2.5 4-2.5 8 0 2 1.5 3.5 3.2 3.5 2.2 0 3.8-2 3.5-4.2 2.4 1.8 4 4.7 4 7.7 0 5-4 8.5-9 8.5s-9-3.7-9-8.7c0-6 5.4-8.5 6.9-13.8.6 0 2.1.9 2.9 3Z" fill="#f3efe4"/></svg>`;
const CROSS_GLYPH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2Z" fill="#f3efe4"/></svg>`;
const SHIELD_GLYPH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 20 5.5v6c0 6-3.4 9.8-8 10.5-4.6-.7-8-4.5-8-10.5v-6L12 2Z" fill="#f3efe4"/></svg>`;

/** Opens Google's own listing for a named place — surfaces real phone number, address,
 * and directions without FireWatch needing to maintain that contact data itself. */
function googleMapsUrl(name: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, Bengaluru`)}`;
}

const fireIcon = pinIcon('#c0392b', FLAME_GLYPH);
const hospitalIcon = pinIcon('#2563a8', CROSS_GLYPH);
const policeIcon = pinIcon('#1d3557', SHIELD_GLYPH);

/** Facilities below this zoom stay hidden to keep the city-wide view uncluttered. */
const FACILITY_MIN_ZOOM = 14;

function ZoomVisible({ minZoom, children }: { minZoom: number; children: ReactNode }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handler = () => setZoom(map.getZoom());
    map.on('zoomend', handler);
    return () => {
      map.off('zoomend', handler);
    };
  }, [map]);

  if (zoom < minZoom) return null;
  return <>{children}</>;
}

function localityIcon(stat: LocalityStats, isSelected: boolean) {
  const color = riskBandMeta[stat.band].color;
  const size = 42 + Math.min(stat.activeHazards, 8) * 3;
  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        width:100%;height:100%;border-radius:9999px;
        background:${color}${isSelected ? '' : '30'};
        border:${isSelected ? 4 : 2.5}px solid ${color};
        display:flex;align-items:center;justify-content:center;
        box-shadow:${isSelected ? `0 0 0 7px ${color}22` : '0 1px 4px rgba(28,26,23,0.25)'};
        transition:box-shadow .15s ease;
      ">
        <span style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:${size > 50 ? 18 : 16}px;color:${isSelected ? '#fff' : color};">
          ${stat.safetyScore}
        </span>
      </div>
      ${
        stat.activeHazards > 0
          ? `<span style="
              position:absolute;top:-5px;right:-5px;min-width:19px;height:19px;padding:0 3px;
              border-radius:9999px;background:#14171c;color:#fff;font-size:10.5px;font-weight:700;
              display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;
              border:2px solid #faf8f4;
            ">${stat.activeHazards}</span>`
          : ''
      }
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function localityDotIcon(stat: LocalityStats, isSelected: boolean) {
  const color = riskBandMeta[stat.band].color;
  const size = isSelected ? 16 : 10;
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:9999px;background:${color};
      border:2px solid #f3efe4;box-shadow:0 1px 4px rgba(28,26,23,0.35);
      cursor:pointer;
    "></div>`;
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function FlyToLocality({ target }: { target: LocalityStats | null }) {
  const map = useMap();
  const last = useRef<string | null>(null);
  if (target && target.locality.id !== last.current) {
    last.current = target.locality.id;
    map.flyTo([target.locality.lat, target.locality.lng], 15, { duration: 0.6 });
  }
  return null;
}

function HeatGradientLayer({ stats }: { stats: LocalityStats[] }) {
  const map = useMap();

  useEffect(() => {
    // Weight is real unresolved risk, (100 - score)/100 — no artificial floor, so genuinely
    // safe localities barely register instead of getting inflated into the gradient.
    const points: [number, number, number][] = stats.map((s) => [
      s.locality.lat,
      s.locality.lng,
      (100 - s.safetyScore) / 100,
    ]);

    // Smaller radius/blur keeps each locality's heat localized to its actual area of Bengaluru
    // instead of bleeding into one indistinct citywide blob.
    const layer = L.heatLayer(points, {
      radius: 48,
      blur: 32,
      maxZoom: 14,
      max: 0.5,
      minOpacity: 0.3,
      gradient: {
        0.0: '#22884f',
        0.4: '#22884f',
        0.45: '#b8862b',
        0.7: '#b8862b',
        0.75: '#bb5220',
        0.9: '#9a2b20',
        1.0: '#7a1f16',
      },
    }).addTo(map);

    return () => {
      layer.remove();
    };
  }, [stats, map]);

  return null;
}

export default function HeatmapMap({
  stats,
  selectedId,
  onSelect,
  mode = 'markers',
}: {
  stats: LocalityStats[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mode?: MapMode;
}) {
  const selected = useMemo(() => stats.find((s) => s.locality.id === selectedId) ?? null, [stats, selectedId]);

  return (
    <MapContainer
      center={BLR_CENTER}
      zoom={11}
      scrollWheelZoom
      className="isolate h-full w-full"
      style={{ background: 'var(--color-paper-2)', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToLocality target={selected} />

      {fireStations.map((fs) => (
        <Marker key={fs.id} position={[fs.lat, fs.lng]} icon={fireIcon}>
          <Popup>
            <div className="px-3 py-2 font-sans">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wide text-station">Fire Station</div>
              <div className="mt-0.5 text-[13px] font-semibold text-ink">{fs.name}</div>
              <a
                href={googleMapsUrl(fs.name)}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ember hover:text-ember-2"
              >
                Get Directions →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      <ZoomVisible minZoom={FACILITY_MIN_ZOOM}>
        {hospitals.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="px-3 py-2 font-sans">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wide text-high-risk">Hospital</div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink">{h.name}</div>
                <a
                  href={googleMapsUrl(h.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ember hover:text-ember-2"
                >
                  Get Directions →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {policeStations.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={policeIcon}>
            <Popup>
              <div className="px-3 py-2 font-sans">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink/70">Police Station</div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink">{p.name}</div>
                <a
                  href={googleMapsUrl(p.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block font-mono text-[10.5px] font-semibold uppercase tracking-wide text-ember hover:text-ember-2"
                >
                  Get Directions →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </ZoomVisible>

      {mode === 'gradient' ? (
        <HeatGradientLayer stats={stats} />
      ) : (
        stats.map((stat) => (
          <Marker
            key={stat.locality.id}
            position={[stat.locality.lat, stat.locality.lng]}
            icon={localityIcon(stat, stat.locality.id === selectedId)}
            eventHandlers={{ click: () => onSelect(stat.locality.id) }}
          />
        ))
      )}

      {mode === 'gradient' &&
        stats.map((stat) => (
          <Marker
            key={`dot-${stat.locality.id}`}
            position={[stat.locality.lat, stat.locality.lng]}
            icon={localityDotIcon(stat, stat.locality.id === selectedId)}
            eventHandlers={{ click: () => onSelect(stat.locality.id) }}
          />
        ))}
    </MapContainer>
  );
}
