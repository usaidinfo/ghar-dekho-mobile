import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputBg?: 'surface-input' | 'surface-input-alt';
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, onRightIconPress, secureTextEntry, containerStyle, className, inputBg = 'surface-input', ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
      <View style={containerStyle} className="w-full">
        {label && (
          <Text className="text-[14px] font-semibold text-neutral ml-1 mb-2">
            {label}
          </Text>
        )}
        <View className="relative justify-center">
          {leftIcon && (
            <View className="absolute left-4 z-10 w-6 items-center">
              <Icon name={leftIcon} size={22} color="#777779" />
            </View>
          )}

          <TextInput
            ref={ref}
            className={`w-full h-14 rounded-full text-dark font-medium
              ${inputBg === 'surface-input' ? 'bg-surface-input' : 'bg-surface-input-alt'}
              ${leftIcon ? 'pl-12' : 'pl-4'}
              ${rightIcon || secureTextEntry ? 'pr-12' : 'pr-4'}
              ${error ? 'border border-red-500 bg-red-50' : 'border border-transparent'}
              ${className || ''}`}
            placeholderTextColor="#777779"
            secureTextEntry={isSecure}
            {...props}
          />

          {(rightIcon || secureTextEntry) && (
            <TouchableOpacity
              onPress={secureTextEntry ? () => setIsPasswordVisible(!isPasswordVisible) : onRightIconPress}
              className="absolute right-4 z-10 w-8 items-center justify-center p-1"
              activeOpacity={0.7}
            >
              <Icon
                name={secureTextEntry ? (isPasswordVisible ? 'visibility-off' : 'visibility') : rightIcon!}
                size={22}
                color="#777779"
              />
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium tracking-wide">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
