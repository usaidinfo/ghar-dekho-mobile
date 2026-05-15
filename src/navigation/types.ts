/**
 * Navigation types for GharDekho.
 *
 * AuthStackParamList  — screens shown before login (Login, Signup)
 * MainStackParamList  — screens shown after login (all app screens)
 * BottomTabParamList  — bottom tab screens
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

/** Auth stack — only visible when user is NOT logged in. */
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

/** App stack — only visible when user IS logged in. */
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  /** Full-screen list property flow (no bottom tab bar). */
  PostProperty: undefined;
  PropertyDetail: { propertyId: string };
  MyVisits: undefined;
  VisitScheduled: {
    propertyId: string;
    propertyTitle: string;
    propertyThumb?: string | null;
    isVerified?: boolean;
    dateLabel: string;
    timeLabel: string;
    typeLabel: string;
  };
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
