import React, { forwardRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputBg?: 'surface-input' | 'surface-input-alt';
  inputStyle?: StyleProp<TextStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      secureTextEntry,
      containerStyle,
      inputStyle,
      inputBg = 'surface-input',
      ...props
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isSecure = secureTextEntry && !isPasswordVisible;

    const bg = inputBg === 'surface-input' ? '#F3F4F6' : '#EEF0F4';
    const borderColor = error ? '#EF4444' : 'transparent';
    const padLeft = leftIcon ? 48 : 16;
    const padRight = rightIcon || secureTextEntry ? 48 : 16;

    const rightIconName = useMemo(() => {
      if (secureTextEntry) return isPasswordVisible ? 'visibility-off' : 'visibility';
      return rightIcon;
    }, [secureTextEntry, isPasswordVisible, rightIcon]);

    return (
      <View style={[styles.wrap, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View style={styles.fieldWrap}>
          {leftIcon ? (
            <View style={styles.leftIcon}>
              <Icon name={leftIcon} size={22} color="#777779" />
            </View>
          ) : null}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              { backgroundColor: bg, borderColor, paddingLeft: padLeft, paddingRight: padRight },
              inputStyle,
            ]}
            placeholderTextColor="#777779"
            secureTextEntry={isSecure}
            autoCorrect={false}
            {...props}
          />

          {rightIconName ? (
            <TouchableOpacity
              onPress={secureTextEntry ? () => setIsPasswordVisible(v => !v) : onRightIconPress}
              style={styles.rightIcon}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Icon name={rightIconName} size={22} color="#777779" />
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777779',
    marginLeft: 4,
    marginBottom: 8,
  },
  fieldWrap: { justifyContent: 'center' },
  leftIcon: {
    position: 'absolute',
    left: 16,
    width: 24,
    alignItems: 'center',
    zIndex: 2,
  },
  rightIcon: {
    position: 'absolute',
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    marginTop: 6,
    marginLeft: 4,
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
});
