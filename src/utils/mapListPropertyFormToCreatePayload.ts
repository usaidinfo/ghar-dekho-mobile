import type { CreatePropertyPayload, CreatePropertyStatus } from '../types/create-property.api.types';
import type { ListPropertyFormValues } from '../types/list-property-form.types';

function parseDigitsNumber(raw: string): number | null {
  const t = raw.trim();
  if (!t) {
    return null;
  }
  const n = Number(t.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function listingIntentToApi(listingIntent: ListPropertyFormValues['listingIntent']): string {
  switch (listingIntent) {
    case 'Buy':
      return 'BUY';
    case 'Rent':
      return 'RENT';
    case 'PG':
      return 'PG';
    case 'Comm.':
      return 'COMMERCIAL';
    default:
      return 'BUY';
  }
}

function propertyKindToApi(kind: ListPropertyFormValues['propertyKind']): string {
  return kind.toUpperCase();
}

function bhkToNumber(bhk: ListPropertyFormValues['bhk']): number | null {
  if (bhk === '5+') {
    return 5;
  }
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

function orderImagesByCover(uris: string[], coverIndex: number): string[] {
  if (!uris.length) {
    return [];
  }
  const safe = Math.min(Math.max(coverIndex, 0), uris.length - 1);
  if (safe === 0) {
    return [...uris];
  }
  const copy = [...uris];
  const [cover] = copy.splice(safe, 1);
  if (cover) {
    return [cover, ...copy];
  }
  return copy;
}

/**
 * Maps mobile list form → POST /api/properties JSON.
 * Omits invalid price (0) when draft if you want — caller passes status.
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

  const imageUrls = orderImagesByCover(values.photoUris, values.coverIndex).filter(
    u => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://')),
  );

  const latStr = values.latitude.trim();
  const lonStr = values.longitude.trim();
  const lat = latStr ? Number(latStr) : NaN;
  const lon = lonStr ? Number(lonStr) : NaN;
  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lon);

  const videoFile = values.videoTourUri.trim();

  return {
    status,
    listingType: listingIntentToApi(values.listingIntent),
    propertyType: propertyKindToApi(values.propertyKind),
    title: buildTitle(values),
    description: undefined,
    price,
    currency: 'INR',
    city: values.city.trim(),
    locality: values.locality.trim(),
    state: values.state.trim() || undefined,
    pincode: values.pincode.trim() || undefined,
    address: buildAddress(values) || undefined,
    ...(hasValidCoords ? { latitude: lat, longitude: lon } : {}),
    bhk: bhkToNumber(values.bhk),
    builtUpArea: builtUp,
    carpetArea: carpet,
    floor,
    totalFloors,
    ageOfProperty: propertyAgeToYears(values.propertyAge),
    isPriceNegotiable: values.priceNegotiable,
    isRERAApproved: values.reraApproved,
    reraNumber: values.reraApproved && values.reraRegistrationNumber.trim()
      ? values.reraRegistrationNumber.trim()
      : null,
    imageUrls: imageUrls.length ? imageUrls : undefined,
    primaryImageIndex: imageUrls.length ? 0 : undefined,
    amenitySlugs: values.amenities.length ? [...values.amenities] : undefined,
    requestFeatured: values.featureListing,
    nocFromSociety: values.nocFromSociety,
    approvedMasterPlan: values.approvedMasterPlan,
    ...(videoFile ? { videoTourFileUri: videoFile } : {}),
  };
}
