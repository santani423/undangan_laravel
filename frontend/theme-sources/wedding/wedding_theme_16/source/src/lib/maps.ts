import type { Coordinates } from '../types/invitation';

interface Place {
  venueName: string;
  address: string;
  coordinates?: Coordinates;
  mapsUrl?: string;
  embedUrl?: string;
}

function query(place: Place): string {
  return place.coordinates ? `${place.coordinates.lat},${place.coordinates.lng}` : `${place.venueName}, ${place.address}`;
}

/** Link that opens the venue in Google Maps (app on mobile, web on desktop). */
export function getMapsUrl(place: Place): string {
  if (place.mapsUrl) return place.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(place))}`;
}

/** Turn-by-turn directions to the venue from the guest's current location. */
export function getDirectionsUrl(place: Place): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query(place))}`;
}

/** Key-less Google Maps embed URL for an iframe preview. */
export function getEmbedUrl(place: Place): string {
  if (place.embedUrl) return place.embedUrl;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query(place))}&z=16&output=embed`;
}

export function fullAddress(place: Place): string {
  return `${place.venueName}, ${place.address}`;
}
