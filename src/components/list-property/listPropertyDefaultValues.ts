import type { ListPropertyFormValues } from '../../types/list-property-form.types';

/** Fresh form state — use for Post; merge with API data for Edit. */
export function getListPropertyDefaultValues(): ListPropertyFormValues {
  return {
    listingIntent: 'Buy',
    propertyKind: 'Flat',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    bhk: '2',
    builtUpSqFt: '',
    carpetSqFt: '',
    propertyAge: 'New Construction',
    floor: '',
    totalFloors: '',
    totalPrice: '',
    priceNegotiable: true,
    amenities: ['parking', 'lift'],
    photoUris: [],
    coverIndex: 0,
    videoTourUri: '',
    reraApproved: true,
    reraRegistrationNumber: '',
    nocFromSociety: true,
    approvedMasterPlan: true,
    featureListing: false,
  };
}

export function mergeListPropertyDefaults(partial: Partial<ListPropertyFormValues>): ListPropertyFormValues {
  return { ...getListPropertyDefaultValues(), ...partial };
}
