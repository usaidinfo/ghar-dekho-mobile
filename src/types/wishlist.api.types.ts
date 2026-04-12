

export interface WishlistPropertyImage {
  imageUrl: string;
  thumbnailUrl?: string | null;
}

export interface WishlistPropertySnippet {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  propertyType: string;
  listingType: string;
  bhk: number | null;
  carpetArea: number | null;
  city: string;
  locality: string;
  isVerified: boolean;
  isFeatured: boolean;
  status: string;
  furnishing: string;
  images: WishlistPropertyImage[];
}

export interface WishlistRow {
  id: string;
  userId: string;
  propertyId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  property: WishlistPropertySnippet;
}
