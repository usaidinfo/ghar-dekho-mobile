import type { NavigationProp, ParamListBase } from '@react-navigation/native';

function routeNamesOf(nav: NavigationProp<ParamListBase>): string[] {
  const state = nav.getState?.() as
    | { routeNames?: string[]; routes?: { name: string }[] }
    | undefined;
  if (!state) return [];
  if (Array.isArray(state.routeNames) && state.routeNames.length) {
    return state.routeNames;
  }
  if (Array.isArray(state.routes)) {
    return state.routes.map(r => r.name);
  }
  return [];
}

/** Walk up the navigator tree and open the Membership tab. */
export function navigateToMembership(navigation: NavigationProp<ParamListBase>) {
  let nav: NavigationProp<ParamListBase> | undefined = navigation;

  while (nav) {
    const names = routeNamesOf(nav);

    if (names.includes('Membership')) {
      nav.navigate('Membership' as never);
      return;
    }

    if (names.includes('Tabs')) {
      nav.navigate('Tabs' as never, { screen: 'Membership' } as never);
      return;
    }

    nav = nav.getParent?.() as NavigationProp<ParamListBase> | undefined;
  }
}

export function getMembershipErrorCode(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null;
  const ax = err as {
    response?: { status?: number; data?: { code?: string; message?: string } };
    code?: string;
  };
  if (ax.response?.data?.code) return String(ax.response.data.code);
  if (ax.code) return String(ax.code);
  if (ax.response?.status === 402) return 'MEMBERSHIP_REQUIRED';
  return null;
}

export function isMembershipGateError(err: unknown): boolean {
  const code = getMembershipErrorCode(err);
  return (
    code === 'MEMBERSHIP_REQUIRED' ||
    code === 'LISTING_LIMIT_REACHED' ||
    code === 'NO_BOOST_CREDITS' ||
    code === 'NO_FEATURED_SLOTS'
  );
}
