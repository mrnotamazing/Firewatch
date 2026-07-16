import type { HazardCategoryMeta } from '../types';

export const hazardCategories: HazardCategoryMeta[] = [
  { id: 'hanging-wires', label: 'Hanging / Exposed Wires', department: 'BESCOM', icon: 'zap' },
  { id: 'flammable-waste', label: 'Flammable Waste / Garbage', department: 'BBMP', icon: 'trash-2' },
  { id: 'gas-leak', label: 'Gas Leak / LPG Hazard', department: 'Fire Dept', icon: 'alert-triangle' },
  { id: 'blocked-exit', label: 'Blocked Fire Exit / Hydrant', department: 'Fire Dept', icon: 'ban' },
  { id: 'chemical-storage', label: 'Unsafe Chemical Storage', department: 'Fire Dept', icon: 'flask-conical' },
  { id: 'electrical-panel', label: 'Overloaded Electrical Panel', department: 'BESCOM', icon: 'cpu' },
  { id: 'open-burning', label: 'Open Burning / Bonfire', department: 'BBMP', icon: 'flame' },
  { id: 'other', label: 'Other Fire Hazard', department: 'Fire Dept', icon: 'flag' },
];

export const hazardCategoryMap = Object.fromEntries(
  hazardCategories.map((c) => [c.id, c]),
) as Record<string, HazardCategoryMeta>;
