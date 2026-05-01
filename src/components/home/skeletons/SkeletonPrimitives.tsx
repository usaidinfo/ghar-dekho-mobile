import React from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

export function useSkeletonPulse(): Animated.Value {
  const pulse = React.useRef(new Animated.Value(0.35)).current;
  React.useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [pulse]);
  return pulse;
}

type SkeletonBlockProps = {
  height: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
  opacity?: Animated.Value;
};

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  height,
  width = '100%',
  radius = 12,
  style,
  opacity,
}) => {
  const fallbackOpacity = useSkeletonPulse();
  const o = opacity ?? fallbackOpacity;
  return (
    <Animated.View
      style={[
        styles.block,
        { height, width, borderRadius: radius, opacity: o },
        style,
      ]}
    />
  );
};

export const SkeletonRow: React.FC<{ gap?: number; children: React.ReactNode; style?: ViewStyle }> = ({
  gap = 12,
  children,
  style,
}) => <View style={[styles.row, { gap }, style]}>{children}</View>;

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#E7EAF0',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

