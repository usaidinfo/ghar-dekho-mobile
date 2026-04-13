import type { CreatePropertyPayload, CreatePropertyStatus } from '../types/create-property.api.types';
import type { ListPropertyFormValues } from '../types/list-property-form.types';

function parseDigitsNumber(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Maps UI listing intent → Prisma `ListingType` (no COMMERCIAL — use category). */
function listingIntentToApi(listingIntent: ListPropertyFormValues['listingIntent']): string {
  switch (listingIntent) {
    case 'Buy':
      return 'BUY';
    case 'Rent':
      return 'RENT';
    case 'PG':
      return 'PG';
    case 'Comm.':
      return 'BUY';
    default:
      return 'BUY';
  }
}

function propertyKindToApi(kind: ListPropertyFormValues['propertyKind']): string {
  return kind.toUpperCase();
}

function bhkToNumber(bhk: ListPropertyFormValues['bhk']): number | null {
  if (bhk === '5+') return 5;
  const n = Number(bhk);
  return Number.isFinite(n) ? n : null;
}

function propertyAgeToYears(age: ListPropertyFormValues['propertyAge']): number | null {
  switch (age) {
    case 'New Construction':
      return 0;
    case '0-1 Year':
      return 1;
    case '1-5 Years':
      return 3;
    default:
      return null;
  }
}

function buildTitle(values: ListPropertyFormValues): string {
  const bhkLabel = values.bhk === '5+' ? '5+ BHK' : `${values.bhk} BHK`;
  const loc = [values.locality, values.city].filter(Boolean).join(', ');
  return `${bhkLabel} ${values.propertyKind}${loc ? ` in ${loc}` : ''}`.trim();
}

function buildAddress(values: ListPropertyFormValues): string {
  const parts = [values.locality, values.city, values.state, values.pincode].filter(Boolean);
  return parts.join(', ');
}

function buildDescription(values: ListPropertyFormValues): string {
  const loc = [values.locality, values.city].filter(Boolean).join(', ');
  const bits = [
    `${values.propertyKind} for ${values.listingIntent}${loc ? ` in ${loc}` : ''}.`,
    values.builtUpSqFt.trim() ? `Approx. ${values.builtUpSqFt.trim()} sq.ft. built-up.` : null,
    values.carpetSqFt.trim() ? `Carpet area ~${values.carpetSqFt.trim()} sq.ft.` : null,
  ].filter(Boolean);
  const text = bits.join(' ').trim();
  return text || 'Property listing on GharDekho.';
}

function categoryFromForm(values: ListPropertyFormValues): string {
  if (values.listingIntent === 'Comm.') return 'COMMERCIAL';
  if (values.propertyKind === 'Plot') return 'PLOT';
  if (values.listingIntent === 'PG') return 'PG';
  return 'RESIDENTIAL';
}

export function orderImagesByCover(uris: string[], coverIndex: number): string[] {
  if (!uris.length) return [];
  const safe = Math.min(Math.max(coverIndex, 0), uris.length - 1);
  if (safe === 0) return [...uris];
  const copy = [...uris];
  const [cover] = copy.splice(safe, 1);
  if (cover) return [cover, ...copy];
  return copy;
}

/** Local device URIs only, cover first — for multipart upload after create. */
export function orderPhotoUrisForUpload(uris: string[], coverIndex: number): string[] {
  return orderImagesByCover(uris, coverIndex).filter(u => {
    if (typeof u !== 'string' || !u) return false;
    return (
      u.startsWith('file://') ||
      u.startsWith('content://') ||
      u.startsWith('ph://') ||
      u.startsWith('assets-library://')
    );
  });
}

/**
 * Maps mobile list form → POST /api/properties JSON (field names match `property.controller` + route validators).
 */
export function mapListPropertyFormToCreatePayload(
  values: ListPropertyFormValues,
  status: CreatePropertyStatus,
): CreatePropertyPayload {
  const price = parseDigitsNumber(values.totalPrice) ?? 0;
  const builtUp = parseDigitsNumber(values.builtUpSqFt);
  const carpet = parseDigitsNumber(values.carpetSqFt);
  const floor = parseDigitsNumber(values.floor);
  const totalFloors = parseDigitsNumber(values.totalFloors);

  const latStr = values.latitude.trim();
  const lonStr = values.longitude.trim();
  const lat = latStr ? Number(latStr) : NaN;
  const lon = lonStr ? Number(lonStr) : NaN;
  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lon);

  const address = buildAddress(values).trim() || `${values.locality}, ${values.city}`.trim();

  return {
    status,
    listingType: listingIntentToApi(values.listingIntent),
    propertyType: propertyKindToApi(values.propertyKind),
    category: categoryFromForm(values),
    title: buildTitle(values),
    description: buildDescription(values),
    price,
    currency: 'INR',
    city: values.city.trim(),
    locality: values.locality.trim(),
    state: values.state.trim(),
    pincode: values.pincode.trim(),
    address,
    ...(hasValidCoords ? { latitude: lat, longitude: lon } : {}),
    bhk: bhkToNumber(values.bhk),
    builtUpArea: builtUp,
    carpetArea: carpet,
    floorNumber: floor,
    totalFloors,
    ageOfProperty: propertyAgeToYears(values.propertyAge),
    priceNegotiable: values.priceNegotiable,
    isRERAApproved: values.reraApproved,
    reraNumber: values.reraApproved && values.reraRegistrationNumber.trim()
      ? values.reraRegistrationNumber.trim()
      : null,
    hasNOC: values.nocFromSociety,
    hasApprovedMaps: values.approvedMasterPlan,
    isFeatured: values.featureListing,
    amenitySlugs: values.amenities.length ? [...values.amenities] : undefined,
  };
}
