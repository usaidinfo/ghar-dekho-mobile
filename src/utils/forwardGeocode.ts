/**
 * Forward geocode (address -> coordinates) via OpenStreetMap Nominatim (no API key).
 * https://operations.osmfoundation.org/policies/nominatim/ — identify app in User-Agent.
 */
export async function forwardGeocode(query: string): Promise<{ latitude: number; longitude: number } | null> {
  const q = query.trim();
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q,
  )}&addressdetails=0&limit=1`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'GharDekhoMobile/1.0 (listing; support@ghardekho.com)',
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as Array<{ lat?: string; lon?: string }> | unknown;
  if (!Array.isArray(data) || !data.length) return null;

  const lat = Number((data[0] as { lat?: string }).lat);
  const lon = Number((data[0] as { lon?: string }).lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { latitude: lat, longitude: lon };
}

