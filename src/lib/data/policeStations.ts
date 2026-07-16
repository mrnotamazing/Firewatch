import type { FireStation } from '../types';

/**
 * Source: OpenStreetMap (via Overpass API), amenity=police nodes within Bengaluru,
 * filtered to named police stations (traffic outposts/chowkies excluded for map clarity).
 */
export const policeStations: FireStation[] = [
  { id: 'ps-hebbagodi', name: 'Hebbagodi Police Station', lat: 12.8264, lng: 77.6821 },
  { id: 'ps-jayanagar-4', name: 'Jayanagar 4th Block Police Station', lat: 12.9286, lng: 77.5814 },
  { id: 'ps-cubbon-park', name: 'Cubbon Park Police Station', lat: 12.9762, lng: 77.5983 },
  { id: 'ps-malleshwaram', name: 'Malleshwaram Police Station', lat: 12.9967, lng: 77.5697 },
  { id: 'ps-electronics-city', name: 'Electronics City Police Station', lat: 12.8400, lng: 77.6631 },
  { id: 'ps-jalahalli', name: 'Jalahalli Police Station', lat: 13.0486, lng: 77.5496 },
  { id: 'ps-tilaknagar', name: 'Tilaknagar Police Station', lat: 12.9284, lng: 77.5906 },
  { id: 'ps-indiranagar', name: 'Indira Nagar Police Station', lat: 12.9830, lng: 77.6384 },
  { id: 'ps-jeevan-bhima-nagar', name: 'Jeevan Bhima Nagar Police Station', lat: 12.9678, lng: 77.6557 },
  { id: 'ps-mico-layout', name: 'Mico Layout Police Station', lat: 12.9086, lng: 77.6106 },
  { id: 'ps-girinagar', name: 'Girinagar Police Station', lat: 12.9359, lng: 77.5440 },
  { id: 'ps-sanjayanagar', name: 'Sanjayanagar Police Station', lat: 13.0336, lng: 77.5759 },
  { id: 'ps-rajajinagar', name: 'Rajaji Nagar Police Station', lat: 12.9945, lng: 77.5543 },
  { id: 'ps-hebbal', name: 'Hebbal Police Station', lat: 13.0386, lng: 77.5896 },
  { id: 'ps-commercial-street', name: 'Commercial Street Police Station', lat: 12.9826, lng: 77.6071 },
  { id: 'ps-vijayanagar', name: 'Vijayanagar Police Station', lat: 12.9707, lng: 77.5377 },
  { id: 'ps-chamarajapet', name: 'Chamarajapet Police Station', lat: 12.9605, lng: 77.5643 },
  { id: 'ps-peenya', name: 'Peenya Police Station', lat: 13.0360, lng: 77.5212 },
  { id: 'ps-banashankari', name: 'Banashankari Police Station', lat: 12.9229, lng: 77.5650 },
  { id: 'ps-kodigehalli', name: 'Kodigehalli Police Station', lat: 13.0622, lng: 77.5741 },
  { id: 'ps-hennur', name: 'Hennur Police Station', lat: 13.0238, lng: 77.6458 },
  { id: 'ps-nandini-layout', name: 'Nandini Layout Police Station', lat: 13.0125, lng: 77.5368 },
  { id: 'ps-hulimavu', name: 'Hulimavu Police Station', lat: 12.8767, lng: 77.6000 },
  { id: 'ps-thalaghattapura', name: 'Thalaghattapura Police Station', lat: 12.8689, lng: 77.5363 },
];
