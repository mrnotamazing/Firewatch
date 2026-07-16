export type LocalityType = 'residential' | 'commercial' | 'industrial' | 'mixed';

export interface FireStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Locality {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: LocalityType;
  /** Approximate residents+workers per sq km. Estimated from general ward density patterns, not an official dataset. */
  populationDensityPerSqKm: number;
}

export type HazardCategory =
  | 'hanging-wires'
  | 'flammable-waste'
  | 'gas-leak'
  | 'blocked-exit'
  | 'chemical-storage'
  | 'electrical-panel'
  | 'open-burning'
  | 'other';

export type ReportStatus = 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'escalated';

export interface HazardCategoryMeta {
  id: HazardCategory;
  label: string;
  department: string;
  icon: string;
}

export interface HazardReport {
  id: string;
  category: HazardCategory;
  localityId: string;
  description: string;
  photoDataUrl?: string;
  reporterName: string;
  reporterContact?: string;
  status: ReportStatus;
  createdAt: number;
  dueAt: number;
  resolvedAt?: number;
  ticketSentAt?: number;
  ticketRecipient?: string;
}
