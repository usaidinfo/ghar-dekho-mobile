import { StyleSheet } from 'react-native';

/** Numeric `letterSpacing` only — Tailwind `tracking-*` / `em` values break Android (String → Double). */
export const signedInTextStyles = StyleSheet.create({
  sectionLabel: { letterSpacing: 2 },
  headerTitle: { letterSpacing: -0.25 },
  agentBadge: { letterSpacing: 1.8 },
  displayName: { letterSpacing: -0.35 },
  chip: { letterSpacing: 0.8 },
  ctaWide: { letterSpacing: 0.6 },
  logoutCaps: { letterSpacing: 0.8 },
  versionCaps: { letterSpacing: 1.6 },
});
