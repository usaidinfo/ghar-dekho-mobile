import { reverseGeocode } from './reverseGeocode';

/**
 * Network-based approximate location (no native GPS module), then Nominatim
 * reverse geocode for locality & PIN. User should verify fields on the form.
 */

export interface DetectedListingLocation {
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

interface IpApiCo {
  city?: string;
  region?: string;
  postal?: string;
  latitude?: number | string;
  longitude?: number | string;
  error?: boolean;
  reason?: string;
}

interface GeoJs {
  city?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
}

interface IpWhoPayload {
  success?: boolean;
  message?: string;
  city?: string;
  region?: string;
  postal?: string;
  latitude?: number | string;
  longitude?: number | string;
}

interface BigDataCloud {
  latitude?: number | string;
  longitude?: number | string;
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  postcode?: string;
}

function readLatLon(lat: unknown, lon: unknown): { lat: number; lon: number } | null {
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) {
    return null;
  }
  return { lat: la, lon: lo };
}

async function tryBigDataCloud(): Promise<DetectedListingLocation | null> {
  try {
    const res = await fetch(
      'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en',
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) {
      return null;
    }
    const j = (await res.json()) as BigDataCloud;
    const ll = readLatLon(j.latitude, j.longitude);
    if (!ll) {
      return null;
    }
    const city = (j.city || '').trim();
    const locality = (j.locality || j.city || '').trim() || city;
    const state = (j.principalSubdivision || '').trim();
    const pincode = (j.postcode || '').trim();
    if (!city && !locality) {
      return null;
    }
    return {
      locality: locality || city,
      city: city || locality,
      state,
      pincode,
      latitude: ll.lat,
      longitude: ll.lon,
    };
  } catch {
    return null;
  }
}

async function tryIpApiCo(): Promise<DetectedListingLocation | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      return null;
    }
    const j = (await res.json()) as IpApiCo;
    if (j.error) {
      return null;
    }
    const ll = readLatLon(j.latitude, j.longitude);
    if (!ll) {
      return null;
    }
    const city = (j.city || '').trim();
    const state = (j.region || '').trim();
    const pincode = (j.postal || '').trim();
    if (!city) {
      return null;
    }
    return {
      locality: city,
      city,
      state,
      pincode,
      latitude: ll.lat,
      longitude: ll.lon,
    };
  } catch {
    return null;
  }
}

async function tryGeoJs(): Promise<DetectedListingLocation | null> {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      return null;
    }
    const j = (await res.json()) as GeoJs;
    const ll = readLatLon(j.latitude, j.longitude);
    if (!ll) {
      return null;
    }
    const city = (j.city || '').trim();
    const state = (j.region || '').trim();
    if (!city) {
      return null;
    }
    return {
      locality: city,
      city,
      state,
      pincode: '',
      latitude: ll.lat,
      longitude: ll.lon,
    };
  } catch {
    return null;
  }
}

async function tryIpWho(): Promise<DetectedListingLocation | null> {
  try {
    const res = await fetch('https://ipwho.is/', { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      return null;
    }
    const j = (await res.json()) as IpWhoPayload;
    if (j.success === false) {
      return null;
    }
    const ll = readLatLon(j.latitude, j.longitude);
    if (!ll) {
      return null;
    }
    const city = (j.city || '').trim();
    const state = (j.region || '').trim();
    const pincode = (j.postal || '').trim();
    if (!city) {
      return null;
    }
    return {
      locality: city,
      city,
      state,
      pincode,
      latitude: ll.lat,
      longitude: ll.lon,
    };
  } catch {
    return null;
  }
}

async function refineWithOsm(base: DetectedListingLocation): Promise<DetectedListingLocation> {
  try {
    const osm = await reverseGeocode(base.latitude, base.longitude);
    return {
      latitude: base.latitude,
      longitude: base.longitude,
      locality: osm.locality || base.locality,
      city: osm.city || base.city,
      state: osm.state || base.state,
      pincode: osm.pincode || base.pincode,
    };
  } catch {
    return base;
  }
}

export async function detectLocationForListing(): Promise<DetectedListingLocation> {
  const seed =
    (await tryBigDataCloud()) ||
    (await tryIpApiCo()) ||
    (await tryGeoJs()) ||
    (await tryIpWho());

  if (!seed) {
    throw new Error('Could not detect location. Check your internet connection and try again.');
  }

  const merged = await refineWithOsm(seed);

  if (!merged.locality && merged.city) {
    merged.locality = merged.city;
  }
  if (!merged.city && merged.locality) {
    merged.city = merged.locality;
  }

  return merged;
}
