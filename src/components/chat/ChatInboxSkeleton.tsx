import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const ROWS = 6;

const ChatInboxSkeleton: React.FC = () => {
  const pulse = React.useRef(new Animated.Value(0.35)).current;
  React.useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [pulse]);

  return (
    <View style={styles.wrap}>
      {Array.from({ length: ROWS }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Animated.View style={[styles.avatar, { opacity: pulse }]} />
          <View style={styles.mid}>
            <Animated.View style={[styles.lineLg, { opacity: pulse }]} />
            <Animated.View style={[styles.lineSm, { opacity: pulse }]} />
            <Animated.View style={[styles.lineMd, { opacity: pulse }]} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196,198,206,0.15)',
    gap: 12,
  },
  avatar: { width: 64, height: 64, borderRadius: 999, backgroundColor: '#efedf0' },
  mid: { flex: 1, gap: 8 },
  lineLg: { height: 16, width: '55%', borderRadius: 6, backgroundColor: '#efedf0' },
  lineSm: { height: 12, width: '40%', borderRadius: 6, backgroundColor: '#efedf0' },
  lineMd: { height: 14, width: '88%', borderRadius: 6, backgroundColor: '#efedf0' },
});

/** Compact pulse rows for FlatList footer while paginating */
export const ChatInboxListFooterSkeleton: React.FC = () => {
  const pulse = React.useRef(new Animated.Value(0.35)).current;
  React.useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [pulse]);
  return (
    <View style={{ paddingVertical: 12, paddingHorizontal: 16, gap: 10 }}>
      <Animated.View style={{ height: 14, width: '70%', borderRadius: 6, backgroundColor: '#efedf0', opacity: pulse }} />
      <Animated.View style={{ height: 14, width: '55%', borderRadius: 6, backgroundColor: '#efedf0', opacity: pulse }} />
    </View>
  );
};

export default ChatInboxSkeleton;
