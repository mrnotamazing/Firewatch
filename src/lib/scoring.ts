import type { HazardReport, Locality, FireStation, LocalityType } from './types';
import { fireStations } from './data/fireStations';
import { nearestStation } from './geo';

export type RiskBand = 'safe' | 'moderate' | 'at-risk' | 'high-risk';

export function riskBand(score: number): RiskBand {
  if (score >= 80) return 'safe';
  if (score >= 65) return 'moderate';
  if (score >= 50) return 'at-risk';
  return 'high-risk';
}

export const riskBandMeta: Record<RiskBand, { label: string; color: string }> = {
  safe: { label: 'Safe', color: '#1e6f5c' },
  moderate: { label: 'Moderate', color: '#b8862b' },
  'at-risk': { label: 'At Risk', color: '#bb5220' },
  'high-risk': { label: 'High Risk', color: '#9a2b20' },
};

/**
 * Baseline fire-load risk by area classification — industrial/commercial areas carry higher
 * inherent risk (machinery, chemical storage, occupancy load) than residential streets.
 */
const TYPE_RISK_SCORE: Record<LocalityType, number> = {
  residential: 90,
  mixed: 70,
  commercial: 55,
  industrial: 40,
};

const ACTIVE_STATUSES = new Set(['pending', 'assigned', 'in-progress', 'escalated']);

export interface LocalityStats {
  locality: Locality;
  nearestStation: FireStation;
  distanceKm: number;
  activeHazards: number;
  pendingHazards: number;
  resolvedHazards: number;
  proximityScore: number;
  hazardScore: number;
  densityScore: number;
  typeScore: number;
  safetyScore: number;
  band: RiskBand;
}

export function computeLocalityStats(locality: Locality, reports: HazardReport[]): LocalityStats {
  const { station, distanceKm } = nearestStation(locality, fireStations);

  const localityReports = reports.filter((r) => r.localityId === locality.id);
  const activeHazards = localityReports.filter((r) => ACTIVE_STATUSES.has(r.status)).length;
  const pendingHazards = localityReports.filter((r) => r.status === 'pending').length;
  const resolvedHazards = localityReports.filter((r) => r.status === 'resolved').length;

  // Closer station = higher proximity score. Beyond ~8km coverage is considered thin.
  const proximityScore = clamp(100 - distanceKm * 12, 0, 100);

  // Unresolved reports weigh more than merely-active ones since they represent unaddressed risk.
  const hazardPenalty = activeHazards * 7 + pendingHazards * 4;
  const hazardScore = clamp(100 - hazardPenalty, 0, 100);

  // Denser areas mean harder evacuation and more people exposed per incident.
  const densityScore = clamp(100 - locality.populationDensityPerSqKm / 250, 0, 100);

  const typeScore = TYPE_RISK_SCORE[locality.type];

  // Community-reported hazard evidence is the single biggest driver of the score — this is what
  // makes the app's reporting loop actually move the needle, rather than area demographics alone.
  const weighted = 0.2 * proximityScore + 0.4 * hazardScore + 0.2 * densityScore + 0.2 * typeScore;
  const safetyScore = Math.round(clamp(weighted, 0, 100));

  return {
    locality,
    nearestStation: station,
    distanceKm,
    activeHazards,
    pendingHazards,
    resolvedHazards,
    proximityScore: Math.round(proximityScore),
    hazardScore: Math.round(hazardScore),
    densityScore: Math.round(densityScore),
    typeScore,
    safetyScore,
    band: riskBand(safetyScore),
  };
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
