/**
 * CalculatorsScreen — EMI + home affordability tools for buyers.
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NAVY = '#122A47';
const GOLD = '#D1A14E';
const SURFACE = '#faf9fc';
const MUTED = '#777779';

type Tab = 'emi' | 'afford';

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/,/g, '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatInr(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function calcEmi(principal: number, annualRate: number, years: number) {
  if (principal <= 0 || years <= 0) return { emi: 0, total: 0, interest: 0 };
  const n = years * 12;
  const r = annualRate / 12 / 100;
  if (r <= 0) {
    const emi = principal / n;
    return { emi, total: principal, interest: 0 };
  }
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  return { emi, total, interest: total - principal };
}

function calcAffordability(monthlyIncome: number, existingEmi: number, rate: number, years: number) {
  const maxEmi = Math.max(0, monthlyIncome * 0.4 - existingEmi);
  if (maxEmi <= 0 || years <= 0) return { maxEmi: 0, loan: 0 };
  const n = years * 12;
  const r = rate / 12 / 100;
  const loan =
    r <= 0 ? maxEmi * n : maxEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return { maxEmi, loan };
}

const CalculatorsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tab, setTab] = useState<Tab>('emi');

  const [loanAmount, setLoanAmount] = useState('5000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');

  const [income, setIncome] = useState('100000');
  const [existingEmi, setExistingEmi] = useState('0');
  const [affRate, setAffRate] = useState('8.5');
  const [affYears, setAffYears] = useState('20');

  const emiResult = useMemo(
    () => calcEmi(parseNum(loanAmount), parseNum(rate), parseNum(tenure)),
    [loanAmount, rate, tenure],
  );

  const affordResult = useMemo(
    () =>
      calcAffordability(
        parseNum(income),
        parseNum(existingEmi),
        parseNum(affRate),
        parseNum(affYears),
      ),
    [income, existingEmi, affRate, affYears],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Icon name="arrow-left" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.title}>Buyer tools</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'emi' && styles.tabOn]}
          onPress={() => setTab('emi')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, tab === 'emi' && styles.tabTextOn]}>EMI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'afford' && styles.tabOn]}
          onPress={() => setTab('afford')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, tab === 'afford' && styles.tabTextOn]}>Affordability</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'emi' ? (
          <>
            <Field label="Loan amount (₹)" value={loanAmount} onChangeText={setLoanAmount} />
            <Field label="Interest rate (% p.a.)" value={rate} onChangeText={setRate} />
            <Field label="Tenure (years)" value={tenure} onChangeText={setTenure} />
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Monthly EMI</Text>
              <Text style={styles.resultValue}>{formatInr(emiResult.emi)}</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultMeta}>Total payable</Text>
                <Text style={styles.resultMetaVal}>{formatInr(emiResult.total)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultMeta}>Interest</Text>
                <Text style={styles.resultMetaVal}>{formatInr(emiResult.interest)}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Field label="Monthly income (₹)" value={income} onChangeText={setIncome} />
            <Field label="Existing EMIs (₹)" value={existingEmi} onChangeText={setExistingEmi} />
            <Field label="Interest rate (% p.a.)" value={affRate} onChangeText={setAffRate} />
            <Field label="Preferred tenure (years)" value={affYears} onChangeText={setAffYears} />
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Max comfortable EMI</Text>
              <Text style={styles.resultValue}>{formatInr(affordResult.maxEmi)}</Text>
              <Text style={[styles.resultLabel, { marginTop: 14 }]}>Estimated loan capacity</Text>
              <Text style={styles.resultValue}>{formatInr(affordResult.loan)}</Text>
              <Text style={styles.hint}>
                Uses ~40% of income for housing EMI (standard affordability thumb rule).
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
}> = ({ label, value, onChangeText }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType="decimal-pad"
      placeholderTextColor={MUTED}
    />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SURFACE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f3f6',
  },
  title: { fontSize: 18, fontWeight: '800', color: NAVY },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#f5f3f6',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabOn: { backgroundColor: NAVY },
  tabText: { fontSize: 13, fontWeight: '700', color: MUTED },
  tabTextOn: { color: '#fff' },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: MUTED, textTransform: 'uppercase' },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c4c6ce',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: NAVY,
  },
  resultCard: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: NAVY,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },
  resultLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  resultValue: {
    fontSize: 28,
    fontWeight: '800',
    color: GOLD,
    marginTop: 4,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resultMeta: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  resultMetaVal: { fontSize: 13, fontWeight: '700', color: '#fff' },
  hint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default CalculatorsScreen;
