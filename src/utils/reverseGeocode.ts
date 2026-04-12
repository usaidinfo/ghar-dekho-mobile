/**
 * Reverse geocode via OpenStreetMap Nominatim (no API key).
 * https://operations.osmfoundation.org/policies/nominatim/ — identify app in User-Agent.
 * `zoom=18` improves building / neighbourhood detail vs default.
 */

export interface ReverseGeocodeAddress {
  locality: string;
  city: string;
  state: string;
  pincode: string;
}

interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

function pickLocality(a: NominatimAddress, city: string): string {
  const fromParts =
    a.neighbourhood ||
    a.suburb ||
    a.quarter ||
    a.city_district ||
    a.village ||
    a.town ||
    a.road ||
    (a.county && a.county !== city ? a.county : undefined);
  if (fromParts) {
    return String(fromParts).trim();
  }
  return city;
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeAddress> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
    String(lat),
  )}&lon=${encodeURIComponent(String(lon))}&addressdetails=1&zoom=18`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'GharDekhoMobile/1.0 (listing; support@ghardekho.com)',
    },
  });

  if (!res.ok) {
    throw new Error(`Address lookup failed (${res.status})`);
  }

  const data = (await res.json()) as NominatimResponse;
  const a = data.address || {};
  const city =
    (a.city || a.town || a.city_district || a.village || a.county || a.state_district || '').trim() ||
    'Unknown area';
  const state = (a.state || '').trim();
  const pincode = (a.postcode || '').trim();
  let locality = pickLocality(a, city);

  if (!locality && typeof data.display_name === 'string') {
    const first = data.display_name.split(',').map(s => s.trim())[0];
    if (first) {
      locality = first;
    }
  }
  if (!locality) {
    locality = city;
  }

  return { locality, city, state, pincode };
}
