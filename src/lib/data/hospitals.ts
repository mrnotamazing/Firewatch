import type { FireStation } from '../types';

/**
 * Source: OpenStreetMap (via Overpass API), amenity=hospital nodes within Bengaluru,
 * filtered to named, recognizable hospitals and deduplicated by proximity.
 */
export const hospitals: FireStation[] = [
  { id: 'hosp-apollo', name: 'Apollo Hospital', lat: 12.9264, lng: 77.6765 },
  { id: 'hosp-manipal-northside', name: 'Manipal Northside Hospital', lat: 13.0011, lng: 77.5639 },
  { id: 'hosp-phc-1', name: 'Government Primary Health Centre', lat: 12.9503, lng: 77.6163 },
  { id: 'hosp-govt-maternity', name: 'Government Maternity Hospital', lat: 12.9989, lng: 77.5817 },
  { id: 'hosp-bgs-gleneagles', name: 'BGS Gleneagles Hospitals', lat: 12.9031, lng: 77.4975 },
  { id: 'hosp-fortis-1', name: 'Fortis Hospital (Bannerghatta Rd)', lat: 13.0022, lng: 77.5491 },
  { id: 'hosp-ambedkar-medical', name: 'Dr. Ambedkar Medical College Hospital', lat: 13.0249, lng: 77.6140 },
  { id: 'hosp-phc-2', name: 'Government Primary Health Centre', lat: 13.0034, lng: 77.5043 },
  { id: 'hosp-phc-begur', name: 'Government Primary Healthcare Center, Begur', lat: 12.8779, lng: 77.6247 },
  { id: 'hosp-konanakunte', name: 'Konanakunte Government Hospital', lat: 12.8841, lng: 77.5664 },
  { id: 'hosp-govt-1', name: 'Government Hospital', lat: 12.8047, lng: 77.5109 },
  { id: 'hosp-rajarajeshwari', name: 'Rajarajeshwari Hospital and Medical College', lat: 12.8961, lng: 77.4619 },
  { id: 'hosp-govt-2', name: 'Government Hospital', lat: 12.8871, lng: 77.6034 },
  { id: 'hosp-sagar-chandramma', name: 'Sagar Chandramma Hospitals', lat: 12.9486, lng: 77.5748 },
  { id: 'hosp-fortis-2', name: 'Fortis Hospital (Rajajinagar)', lat: 12.9882, lng: 77.5548 },
  { id: 'hosp-rr-trauma', name: 'R R Hospital & Trauma Centre', lat: 12.9059, lng: 77.5904 },
  { id: 'hosp-agarahara', name: 'Agarahara Government Hospital', lat: 13.0957, lng: 77.6273 },
  { id: 'hosp-govt-maternity-home', name: 'Government Maternity Home', lat: 12.9983, lng: 77.6201 },
  { id: 'hosp-hosmat', name: 'Hosmat Hospital', lat: 13.0080, lng: 77.5837 },
  { id: 'hosp-govt-3', name: 'Government Hospital', lat: 12.9661, lng: 77.5550 },
];
