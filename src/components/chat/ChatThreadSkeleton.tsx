import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

/** Alternating left/right stubs to mimic a message thread while loading */
const ChatThreadSkeleton: React.FC = () => {
  const pulse = React.useRef(new Animated.Value(0.35)).current;
  React.useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.9, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [pulse]);

  const rows = [0.75, 0.45, 0.68, 0.52, 0.8, 0.4, 0.62];

  return (
    <View style={styles.wrap}>
      {rows.map((w, i) => {
        const alignRight = i % 2 === 1;
        return (
          <View key={i} style={[styles.row, alignRight && styles.rowEnd]}>
            <Animated.View
              style={[
                styles.bubble,
                alignRight ? styles.bubbleMine : styles.bubbleOther,
                { width: `${Math.round(w * 100)}%`, opacity: pulse },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, paddingTop: 16, gap: 14 },
  row: { width: '100%', alignItems: 'flex-start' },
  rowEnd: { alignItems: 'flex-end' },
  bubble: { height: 44, borderRadius: 18, maxWidth: '88%' },
  bubbleOther: { backgroundColor: '#e3e2e5', borderTopLeftRadius: 4 },
  bubbleMine: { backgroundColor: '#d4dbe8', borderTopRightRadius: 4 },
});

export default ChatThreadSkeleton;
