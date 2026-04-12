import { Platform, StyleSheet } from 'react-native';

/**
 * Layout + solid colors for list-property UI.
 * NativeWind v2 + RN are flaky with `gap-*` on some views and with slash opacity (`bg-black/35`);
 * prefer these StyleSheets / constants for stable rendering.
 */
export const LP_COLOR = {
  aiInsightBg: '#E8F4F3',
  aiInsightBorder: '#B8D9D6',
  tealIconBg: '#E0F2F1',
  outlineBorderMuted: '#E4E8EC',
  divider: '#E9EDF2',
  goldBorder: 'rgba(197, 160, 89, 0.4)',
  videoAttachedBg: 'rgba(224, 242, 241, 0.65)',
};

export const LP_STACK = StyleSheet.create({
  form: { gap: 40 },
  section: { gap: 24 },
  sectionTight: { gap: 16 },
  sectionDense: { gap: 12 },
  section8: { gap: 8 },
  section6: { gap: 6 },
  /** Label stacked above field */
  fieldCol: { flex: 1, minWidth: 0, gap: 4 },
  row16: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  row12: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  row8: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  row16Between: { flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'space-between' },
  rowWrap8: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowWrap8Pad: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 },
  tourBtn: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  amenityChip: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  categoryChip: { flex: 1, minWidth: 0, alignItems: 'center', gap: 8 },
  checklistBlock: { gap: 16, paddingTop: 8 },
  legalSectionPad: { gap: 24, paddingHorizontal: 8 },
  negotiateRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
});

export const LP_MISC = StyleSheet.create({
  amenityUnselectedBorder: { borderWidth: 1, borderColor: LP_COLOR.outlineBorderMuted },
});

export const LP_CARD = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
