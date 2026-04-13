/**
 * Navigation types for GharDekho.
 * Main stack: tabs first (guest-friendly); auth and detail screens are pushed on demand.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Membership: undefined;
  History: undefined;
  Profile: undefined;
};

/** Prefetch from inbox / property detail so the thread can render before refetch. */
export type ChatThreadParams = {
  sessionId: string;
  peerName?: string;
  peerImage?: string | null;
  propertyId?: string | null;
  propertyTitle?: string | null;
  propertyThumb?: string | null;
  propertyPrice?: number | null;
  listingType?: string | null;
};

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  /** Full-screen list property flow (no bottom tab bar). */
  PostProperty: undefined;
  Login: undefined;
  Signup: undefined;
  PropertyDetail: { propertyId: string };
  ProjectDetail: { projectId: string };
  SearchResults: { query?: string; category?: string };
  MyListings: undefined;
  Wishlist: undefined;
  ChatInbox: undefined;
  ChatThread: ChatThreadParams;
  Notifications: undefined;
  EditProfile: undefined;
  AdvisorAI: undefined;
  NeighborhoodDetail: { neighborhoodId: string };
};
