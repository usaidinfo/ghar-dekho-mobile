import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { MainStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import * as authService from '../../services/auth.service';

type LoginNav = NativeStackNavigationProp<MainStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const loginWithPassword = useAuthStore(s => s.loginWithPassword);
  const loginWithOtp = useAuthStore(s => s.loginWithOtp);

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting }, getValues, watch } = useForm({
    defaultValues: { identifier: '', password: '', otp: '' },
  });
  const identifier = watch('identifier');

  const finishAuth = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Tabs');
  };

  const onPasswordLogin = async (data: { identifier: string; password: string }) => {
    try {
      await loginWithPassword(data.identifier.trim(), data.password);
      Toast.show({ type: 'success', text1: 'Welcome back' });
      finishAuth();
    } catch (e) {
      Toast.show({ type: 'error', text1: authService.getApiErrorMessage(e) });
    }
  };

  const sendLoginOtp = async () => {
    const id = getValues('identifier')?.trim();
    if (!id) {
      Toast.show({ type: 'error', text1: 'Enter email or phone first' });
      return;
    }
    setSendingOtp(true);
    try {
      const { email, phone } = authService.parseIdentifier(id);
      if (!email && !phone) {
        Toast.show({ type: 'error', text1: 'Enter a valid email or phone' });
        return;
      }
      const res = await authService.sendOtp({
        ...(email ? { email } : { phone }),
        type: 'LOGIN',
      });
      setOtpSent(true);
      if (__DEV__ && res.otp) {
        Toast.show({ type: 'info', text1: `Dev OTP: ${res.otp}` });
      } else {
        Toast.show({ type: 'success', text1: 'Verification code sent' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: authService.getApiErrorMessage(e) });
    } finally {
      setSendingOtp(false);
    }
  };

  const onOtpLogin = async (data: { identifier: string; otp: string }) => {
    try {
      const { email, phone } = authService.parseIdentifier(data.identifier.trim());
      if (!email && !phone) {
        Toast.show({ type: 'error', text1: 'Enter a valid email or phone' });
        return;
      }
      await loginWithOtp({
        ...(email ? { email } : { phone }),
        otp: data.otp.trim(),
      });
      Toast.show({ type: 'success', text1: 'Welcome back' });
      finishAuth();
    } catch (e) {
      Toast.show({ type: 'error', text1: authService.getApiErrorMessage(e) });
    }
  };

  const toggleOtpMode = () => {
    setIsOtpMode(v => !v);
    setOtpSent(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 32,
            paddingVertical: 40,
          }}
        >
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 self-start">
              <Text className="text-primary font-bold text-base">← Back</Text>
            </TouchableOpacity>
          )}

          <View className="mb-10">
            <Text className="text-[34px] leading-10 font-extrabold text-dark tracking-tight mb-2">
              Welcome to Ghar Dekho India
            </Text>
            <Text className="text-base font-medium text-neutral">Your dream home awaits</Text>
          </View>

          <View className="space-y-5">
            <Controller
              control={control}
              rules={{ required: 'Email or phone is required' }}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email or phone number"
                  placeholder="Enter your email or phone"
                  leftIcon="person"
                  inputBg="surface-input-alt"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="default"
                  error={errors.identifier?.message as string}
                />
              )}
            />

            {!isOtpMode ? (
              <View className="mt-5">
                <View className="flex-row justify-end px-1 -mb-6 z-10 relative">
                  <TouchableOpacity>
                    <Text className="text-secondary text-sm font-bold">Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <Controller
                  control={control}
                  rules={{ required: 'Password is required' }}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Password"
                      inputBg="surface-input-alt"
                      placeholder="••••••••"
                      leftIcon="lock"
                      secureTextEntry
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.password?.message as string}
                      className="tracking-widest"
                    />
                  )}
                />
              </View>
            ) : (
              <View className="mt-2 space-y-4">
                <Button
                  title={otpSent ? 'Resend code' : 'Send verification code'}
                  variant="outline"
                  icon="sms"
                  loading={sendingOtp}
                  onPress={sendLoginOtp}
                  disabled={!identifier?.trim()}
                />
                <Controller
                  control={control}
                  rules={{
                    required: isOtpMode ? 'OTP is required' : false,
                    minLength: isOtpMode ? { value: 4, message: 'Enter the code' } : undefined,
                  }}
                  name="otp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Verification code"
                      inputBg="surface-input-alt"
                      placeholder="6-digit OTP"
                      leftIcon="verified-user"
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.otp?.message as string}
                    />
                  )}
                />
              </View>
            )}
          </View>

          <View className="mt-8 space-y-4">
            {!isOtpMode ? (
              <Button
                title="Login"
                onPress={handleSubmit(onPasswordLogin)}
                loading={isSubmitting}
              />
            ) : (
              <Button
                title="Verify & Login"
                onPress={handleSubmit(onOtpLogin)}
                loading={isSubmitting}
              />
            )}

            <View className="flex-row items-center my-4 opacity-50">
              <View className="flex-1 h-[1px] bg-neutral" />
              <Text className="mx-4 text-neutral text-xs font-bold uppercase tracking-widest">OR</Text>
              <View className="flex-1 h-[1px] bg-neutral" />
            </View>

            <Button
              title={isOtpMode ? 'Use password instead' : 'Login with OTP instead'}
              variant="outline"
              icon="sms"
              onPress={toggleOtpMode}
            />
          </View>

          <View className="flex-row justify-center mt-12 mb-8">
            <Text className="text-neutral font-medium text-base">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className="text-secondary font-bold text-base">Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View className="w-full h-[140px] rounded-3xl overflow-hidden mt-auto relative">
            <View className="absolute inset-0 bg-primary/40 z-10" />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              }}
              className="w-full h-full object-cover"
            />
            <View className="absolute inset-0 z-20 justify-center px-6">
              <Text className="text-white font-bold text-lg leading-tight">
                Explore curated properties {'\n'}
                <Text className="text-secondary">across India.</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
