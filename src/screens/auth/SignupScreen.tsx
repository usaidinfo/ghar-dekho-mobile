import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TextInput as PaperInput, useTheme } from 'react-native-paper';
import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import * as authService from '../../services/auth.service';
import * as msg91Otp from '../../services/msg91Otp.service';

type SignupNav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupNav>();
  const loginWithOtp = useAuthStore(s => s.loginWithOtp);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const theme = useTheme();

  const { control, handleSubmit, formState: { errors, isSubmitting }, getValues, watch } = useForm({
    defaultValues: { identifier: '', otp: '' },
  });
  const identifier = watch('identifier');

  const sendLoginOtp = async () => {
    const id = getValues('identifier')?.trim();
    if (!id) {
      Toast.show({ type: 'error', text1: 'Enter email or phone first' });
      return;
    }
    setSendingOtp(true);
    try {
      if (mode === 'email') {
        const email = id.toLowerCase();
        const res = await authService.sendOtp({ email, type: 'LOGIN' });
        setOtpSent(true);
        if (__DEV__ && res.otp) Toast.show({ type: 'info', text1: `Dev OTP: ${res.otp}` });
        else Toast.show({ type: 'success', text1: 'Verification code sent to email' });
        return;
      }

      const { phone } = authService.parseIdentifier(id);
      if (!phone) {
        Toast.show({ type: 'error', text1: 'Enter a valid phone number' });
        return;
      }

      await authService.sendOtp({ phone, type: 'LOGIN' });
      await msg91Otp.sendWhatsAppOtp(phone);
      setOtpSent(true);
      Toast.show({ type: 'success', text1: 'OTP sent on WhatsApp' });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: e instanceof Error ? e.message : authService.getApiErrorMessage(e),
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const onOtpContinue = async (data: { identifier: string; otp: string }) => {
    try {
      const id = data.identifier.trim();
      const code = data.otp.trim();

      if (mode === 'email') {
        await loginWithOtp({ email: id.toLowerCase(), otp: code });
        Toast.show({ type: 'success', text1: 'Welcome to Ghar Dekho!' });
        return;
      }

      const { phone } = authService.parseIdentifier(id);
      if (!phone) {
        Toast.show({ type: 'error', text1: 'Enter a valid phone number' });
        return;
      }

      const { accessToken } = await msg91Otp.verifyWhatsAppOtp(code);
      await loginWithOtp({ phone, accessToken });
      Toast.show({ type: 'success', text1: 'Welcome to Ghar Dekho!' });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: e instanceof Error ? e.message : authService.getApiErrorMessage(e),
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingHorizontal: 32,
          paddingVertical: 40,
          paddingBottom: 100,
        }}
      >
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            className="mb-6 self-start flex-row items-center"
          >
            <View className="w-9 h-9 rounded-full bg-surface-input-alt items-center justify-center mr-2">
              <Icon name="arrow-back" size={20} color="#122A47" />
            </View>
            <Text className="text-primary font-semibold text-sm">Back</Text>
          </TouchableOpacity>
        )}

        <View className="mb-10">
          <Text className="text-[34px] leading-10 font-extrabold text-primary tracking-tight mb-2">
            Continue with OTP
          </Text>
          <Text className="text-base font-medium text-neutral">
            New users are created automatically after verification.
          </Text>
        </View>

        <View className="space-y-5">
          <View className="flex-row p-1.5 bg-surface-input-alt rounded-full w-full">
            <TouchableOpacity
              onPress={() => {
                setMode('email');
                setOtpSent(false);
              }}
              className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${mode === 'email' ? 'bg-primary shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold text-center ${mode === 'email' ? 'text-white' : 'text-neutral'}`}>
                Email OTP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMode('phone');
                setOtpSent(false);
              }}
              className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${mode === 'phone' ? 'bg-primary shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold text-center ${mode === 'phone' ? 'text-white' : 'text-neutral'}`}>
                WhatsApp OTP
              </Text>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            rules={{ required: 'Email or phone is required' }}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <PaperInput
                mode="outlined"
                label={mode === 'email' ? 'Email address' : 'Phone number'}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType={mode === 'email' ? 'email-address' : 'phone-pad'}
                outlineStyle={{ borderRadius: 999 }}
                left={<PaperInput.Icon icon={mode === 'email' ? 'email' : 'phone'} />}
                error={Boolean(errors.identifier?.message)}
                style={{ backgroundColor: theme.colors.elevation.level2 }}
                textColor={theme.colors.onSurface}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
            )}
          />
          {errors.identifier?.message ? (
            <Text style={{ color: '#EF4444', fontSize: 12, marginLeft: 4, marginTop: -6 }}>
              {errors.identifier.message as string}
            </Text>
          ) : null}

          <View className="mt-2 space-y-4">
            <Button
              title={
                otpSent
                  ? 'Resend code'
                  : mode === 'phone'
                    ? 'Send WhatsApp OTP'
                    : 'Send verification code'
              }
              variant="outline"
              icon={mode === 'phone' ? 'chat' : 'sms'}
              loading={sendingOtp}
              onPress={sendLoginOtp}
              disabled={!identifier?.trim()}
            />

            <Controller
              control={control}
              rules={{ required: 'OTP is required', minLength: { value: 4, message: 'Enter the code' } }}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label={mode === 'phone' ? 'WhatsApp OTP' : 'Verification code'}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  outlineStyle={{ borderRadius: 999 }}
                  left={<PaperInput.Icon icon="shield-check" />}
                  error={Boolean(errors.otp?.message)}
                  style={{ backgroundColor: theme.colors.elevation.level2 }}
                  textColor={theme.colors.onSurface}
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
              )}
            />
            {errors.otp?.message ? (
              <Text style={{ color: '#EF4444', fontSize: 12, marginLeft: 4, marginTop: 6 }}>
                {errors.otp.message as string}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="mt-8">
          <Button title="Verify & Continue" onPress={handleSubmit(onOtpContinue)} loading={isSubmitting} />
        </View>

        <View className="flex-row justify-center mt-10 mb-6 pt-6 border-t border-outline/30">
          <Text className="text-neutral font-medium text-base">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-secondary font-bold text-base">Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
