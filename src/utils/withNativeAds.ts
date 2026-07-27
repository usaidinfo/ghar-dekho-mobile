/**
 * @file withNativeAds.ts
 * @description Interleave native-ad placeholder rows into a property list.
 *
 * Every `everyNth` property (default 4) gets a native ad slot after it.
 * FlatList data becomes a union of property rows and ad rows.
 */

export type PropertyListRow<T> =
  | { kind: 'property'; key: string; item: T }
  | { kind: 'ad'; key: string };

export function withNativeAds<T extends { id: string }>(
  items: T[],
  everyNth = 4,
): PropertyListRow<T>[] {
  if (!items.length || everyNth < 1) {
    return items.map(item => ({ kind: 'property' as const, key: item.id, item }));
  }

  const rows: PropertyListRow<T>[] = [];
  let adIndex = 0;

  items.forEach((item, index) => {
    rows.push({ kind: 'property', key: item.id, item });
    if ((index + 1) % everyNth === 0) {
      rows.push({ kind: 'ad', key: `native-ad-${adIndex++}` });
    }
  });

  return rows;
}
