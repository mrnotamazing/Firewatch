import type { Locality } from '../types';

/**
 * Population density figures are approximate estimates (residents + daytime workers per sq km)
 * based on general ward density patterns — not sourced from an official census/BBMP dataset.
 * Swap in real ward-level census data here when available.
 */
export const localities: Locality[] = [
  { id: 'loc-electronic-city', name: 'Electronic City', lat: 12.8452, lng: 77.6602, type: 'commercial', populationDensityPerSqKm: 9800 },
  { id: 'loc-btm-layout', name: 'BTM Layout', lat: 12.9166, lng: 77.6101, type: 'mixed', populationDensityPerSqKm: 22400 },
  { id: 'loc-marathahalli', name: 'Marathahalli', lat: 12.9591, lng: 77.6974, type: 'mixed', populationDensityPerSqKm: 19600 },
  { id: 'loc-hebbal', name: 'Hebbal', lat: 13.0358, lng: 77.5970, type: 'mixed', populationDensityPerSqKm: 14200 },
  { id: 'loc-whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7500, type: 'commercial', populationDensityPerSqKm: 11500 },
  { id: 'loc-koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245, type: 'mixed', populationDensityPerSqKm: 20800 },
  { id: 'loc-indiranagar', name: 'Indiranagar', lat: 12.9716, lng: 77.6412, type: 'mixed', populationDensityPerSqKm: 18900 },
  { id: 'loc-hsr-layout', name: 'HSR Layout', lat: 12.9121, lng: 77.6446, type: 'residential', populationDensityPerSqKm: 16800 },
  { id: 'loc-jayanagar', name: 'Jayanagar', lat: 12.9308, lng: 77.5838, type: 'residential', populationDensityPerSqKm: 17600 },
  { id: 'loc-jp-nagar', name: 'JP Nagar', lat: 12.9082, lng: 77.5855, type: 'residential', populationDensityPerSqKm: 15900 },
  { id: 'loc-malleshwaram', name: 'Malleshwaram', lat: 13.0035, lng: 77.5709, type: 'residential', populationDensityPerSqKm: 14700 },
  { id: 'loc-rajajinagar', name: 'Rajajinagar', lat: 12.9910, lng: 77.5550, type: 'residential', populationDensityPerSqKm: 15300 },
  { id: 'loc-yelahanka', name: 'Yelahanka', lat: 13.1005, lng: 77.5963, type: 'residential', populationDensityPerSqKm: 8900 },
  { id: 'loc-banashankari', name: 'Banashankari', lat: 12.9250, lng: 77.5540, type: 'residential', populationDensityPerSqKm: 13400 },
  { id: 'loc-yeshwanthpur', name: 'Yeshwanthpur', lat: 13.0284, lng: 77.5540, type: 'industrial', populationDensityPerSqKm: 7600 },
  { id: 'loc-rt-nagar', name: 'RT Nagar', lat: 13.0198, lng: 77.5946, type: 'residential', populationDensityPerSqKm: 14100 },
  { id: 'loc-peenya', name: 'Peenya Industrial Area', lat: 13.0280, lng: 77.5200, type: 'industrial', populationDensityPerSqKm: 5400 },

  { id: 'loc-sahakar-nagar', name: 'Sahakar Nagar', lat: 13.0637, lng: 77.5807, type: 'mixed', populationDensityPerSqKm: 19200 },
  { id: 'loc-basavanagudi', name: 'Basavanagudi', lat: 12.9422, lng: 77.5760, type: 'residential', populationDensityPerSqKm: 18500 },
  { id: 'loc-vijayanagar', name: 'Vijayanagar', lat: 12.9719, lng: 77.5296, type: 'mixed', populationDensityPerSqKm: 17500 },
  { id: 'loc-domlur', name: 'Domlur', lat: 12.9611, lng: 77.6387, type: 'mixed', populationDensityPerSqKm: 16000 },
  { id: 'loc-bellandur', name: 'Bellandur', lat: 12.9257, lng: 77.6767, type: 'mixed', populationDensityPerSqKm: 15000 },
  { id: 'loc-sarjapur-road', name: 'Sarjapur Road', lat: 12.9089, lng: 77.6871, type: 'mixed', populationDensityPerSqKm: 14000 },
  { id: 'loc-kammanahalli', name: 'Kammanahalli', lat: 13.0186, lng: 77.6367, type: 'commercial', populationDensityPerSqKm: 21000 },
  { id: 'loc-hbr-layout', name: 'HBR Layout', lat: 13.0193, lng: 77.6438, type: 'residential', populationDensityPerSqKm: 17000 },
  { id: 'loc-vidyaranyapura', name: 'Vidyaranyapura', lat: 13.0736, lng: 77.5566, type: 'residential', populationDensityPerSqKm: 11000 },
  { id: 'loc-nagarbhavi', name: 'Nagarbhavi', lat: 12.9634, lng: 77.5030, type: 'residential', populationDensityPerSqKm: 13000 },
  { id: 'loc-shivajinagar', name: 'Shivajinagar', lat: 12.9857, lng: 77.6057, type: 'commercial', populationDensityPerSqKm: 24000 },
  { id: 'loc-kengeri', name: 'Kengeri', lat: 12.9081, lng: 77.4830, type: 'residential', populationDensityPerSqKm: 8000 },
  { id: 'loc-cv-raman-nagar', name: 'CV Raman Nagar', lat: 12.9836, lng: 77.6648, type: 'mixed', populationDensityPerSqKm: 15500 },
  { id: 'loc-bommanahalli', name: 'Bommanahalli', lat: 12.9086, lng: 77.6156, type: 'mixed', populationDensityPerSqKm: 19000 },
];
