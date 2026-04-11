/**
 * Navigation types for GharDekho.
 * Main stack: tabs first (guest-friendly); auth and detail screens are pushed on demand.
 */

export type BottomTabParamList = {
  Home: undefined;
  Membership: undefined;
  Post: undefined;
  History: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: undefined;
  PropertyDetail: { propertyId: string };
  ProjectDetail: { projectId: string };
  SearchResults: { query?: string; category?: string };
  Chat: { userId: string; propertyId?: string };
  Notifications: undefined;
  EditProfile: undefined;
  AdvisorAI: undefined;
  NeighborhoodDetail: { neighborhoodId: string };
};
