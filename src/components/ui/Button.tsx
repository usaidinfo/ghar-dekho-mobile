import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return 'bg-transparent border border-outline';
      case 'ghost':
        return 'bg-transparent';
      case 'primary':
      default:
        return 'bg-primary shadow-lg shadow-black/20';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return 'text-primary';
      case 'primary':
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-10 px-4';
      case 'md':
        return 'h-12 px-6';
      case 'lg':
      default:
        return 'h-14 px-8';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`w-full flex-row justify-center items-center rounded-full transition-opacity 
        ${getVariantStyles()} 
        ${getSizeStyles()} 
        ${isDisabled ? 'opacity-50' : 'opacity-100'} 
        ${className || ''}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#122A47'} />
      ) : (
        <>
          {icon ? (
            <Icon
              name={icon}
              size={20}
              color={variant === 'primary' ? '#fff' : '#122A47'}
              style={styles.iconSpacer}
            />
          ) : null}
          <Text className={`${getTextColor()} text-lg font-bold ${icon ? 'ml-2' : ''}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconSpacer: { marginRight: 8 },
});
