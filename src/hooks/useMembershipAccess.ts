import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { useAuthStore } from '../stores/auth.store';
import { isMembershipActiveFromApi } from '../utils/membership';
import {
  getMembershipErrorCode,
  isMembershipGateError,
  navigateToMembership,
} from '../utils/navigateToMembership';
import type { MembershipGateReason } from '../components/membership/MembershipRequiredModal';

export function useMembershipAccess() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const user = useAuthStore(s => s.user);
  const refreshCurrentUser = useAuthStore(s => s.refreshCurrentUser);

  const [gateVisible, setGateVisible] = useState(false);
  const [gateReason, setGateReason] = useState<MembershipGateReason>('generic');
  const [gateMessage, setGateMessage] = useState<string | null>(null);

  const hasActiveMembership = useMemo(
    () => isMembershipActiveFromApi(user),
    [user],
  );

  const openGate = useCallback((reason: MembershipGateReason = 'generic', message?: string | null) => {
    setGateReason(reason);
    setGateMessage(message ?? null);
    setGateVisible(true);
  }, []);

  const closeGate = useCallback(() => {
    setGateVisible(false);
    setGateMessage(null);
  }, []);

  const goUpgrade = useCallback(() => {
    setGateVisible(false);
    navigateToMembership(navigation);
  }, [navigation]);

  const requireMembership = useCallback(
    (reason: MembershipGateReason = 'generic'): boolean => {
      if (hasActiveMembership) return true;
      openGate(reason);
      return false;
    },
    [hasActiveMembership, openGate],
  );

  const handleApiError = useCallback(
    (err: unknown): boolean => {
      if (!isMembershipGateError(err)) return false;
      const code = getMembershipErrorCode(err);
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : null;
      openGate(
        code === 'LISTING_LIMIT_REACHED'
          ? 'limit'
          : code === 'NO_BOOST_CREDITS' || code === 'NO_FEATURED_SLOTS' || code === 'MEMBERSHIP_REQUIRED'
            ? 'boost'
            : 'generic',
        msg,
      );
      return true;
    },
    [openGate],
  );

  const refreshMembership = useCallback(async () => {
    await refreshCurrentUser().catch(() => undefined);
  }, [refreshCurrentUser]);

  return {
    hasActiveMembership,
    gateVisible,
    gateReason,
    gateMessage,
    openGate,
    closeGate,
    goUpgrade,
    requireMembership,
    handleApiError,
    refreshMembership,
  };
}
