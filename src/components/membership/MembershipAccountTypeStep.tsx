/**
 * @file MembershipAccountTypeStep.tsx
 * @description Step 1 — choose Owner, Broker, or Builder account type.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { MEMBERSHIP_ACCOUNT_TYPES } from '../../constants/membershipPlans';
import type { MembershipAccountType } from '../../types/membership.types';

const PRIMARY = '#00152e';
const SURFACE = '#faf9fc';
const SURFACE_LOW = '#f5f3f6';
const VARIANT_FG = '#44474d';
const WHITE = '#ffffff';

interface Props {
  onSelect: (type: MembershipAccountType) => void;
}

const MembershipAccountTypeStep: React.FC<Props> = ({ onSelect }) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Text style={styles.title}>Choose Your Account Type</Text>
      <Text style={styles.subtitle}>
        Select the option that best describes you. You can change it anytime.
      </Text>
    </View>

    <View style={styles.cards}>
      {MEMBERSHIP_ACCOUNT_TYPES.map(account => (
        <TouchableOpacity
          key={account.type}
          style={[styles.card, { borderColor: `${account.accent}33` }]}
          activeOpacity={0.92}
          onPress={() => onSelect(account.type)}
        >
          <View style={styles.cardBody}>
            <Text style={[styles.cardSubtitle, { color: account.accentDark }]}>{account.subtitle}</Text>
            <Text style={styles.cardDescription}>{account.description}</Text>
          </View>

          <View style={styles.cardRight}>
            <View style={[styles.iconOrb, { backgroundColor: account.accentLight }]}>
              <Icon name={account.icon} size={42} color={account.accent} />
            </View>
            <View style={[styles.arrowBtn, { backgroundColor: account.accent }]}>
              <Icon name="arrow-right" size={20} color={WHITE} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>

    <View style={styles.secureFooter}>
      <Icon name="shield-check-outline" size={16} color={VARIANT_FG} />
      <Text style={styles.secureText}>Your information is safe and secure with us.</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: VARIANT_FG,
    opacity: 0.85,
  },
  cards: {
    gap: 16,
    marginBottom: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_LOW,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    minHeight: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#00152e',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  cardBody: {
    flex: 1,
    paddingRight: 12,
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: VARIANT_FG,
  },
  cardRight: {
    alignItems: 'center',
    gap: 10,
  },
  iconOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  secureText: {
    fontSize: 13,
    color: VARIANT_FG,
    opacity: 0.8,
  },
});

export default MembershipAccountTypeStep;
