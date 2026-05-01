import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TextInput as PaperInput } from 'react-native-paper';
import { Button } from '../../components/ui/Button';
import type { MainStackParamList } from '../../navigation/types';
import { useAuthStore, mapUiProfileType, splitFullName } from '../../stores/auth.store';
import { authService } from '../../services';

type SignupNav = NativeStackNavigationProp<MainStackParamList, 'Signup'>;

function normalizePhoneInput(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (phone.trim().startsWith('+')) return phone.trim();
  if (digits.length >= 10) return `+${digits}`;
  return phone.trim();
}

export default function SignupScreen() {
  const navigation = useNavigation<SignupNav>();
  const register = useAuthStore(s => s.register);
  const [accountType, setAccountType] = useState<'buyer' | 'owner' | 'agent'>('buyer');
  const [sendingOtp, setSendingOtp] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting }, getValues, watch } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: '',
    },
  });
  const password = watch('password');

  const finishAuth = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Tabs');
  };

  const sendVerificationOtp = async () => {
    const email = getValues('email')?.trim().toLowerCase();
    if (!email || !/^\S+@\S+$/i.test(email)) {
      Toast.show({ type: 'error', text1: 'Enter a valid email first' });
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authService.sendOtp({ email, type: 'EMAIL_VERIFICATION' });
      if (__DEV__ && res.otp) {
        Toast.show({ type: 'info', text1: `Dev OTP: ${res.otp}` });
      } else {
        Toast.show({ type: 'success', text1: 'Code sent to your email' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: authService.getApiErrorMessage(e) });
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }) => {
    const email = data.email.trim().toLowerCase();
    const phoneRaw = data.phone.trim();
    const phone = phoneRaw ? normalizePhoneInput(phoneRaw) : '';
    const { firstName, lastName } = splitFullName(data.fullName);
    if (!firstName) {
      Toast.show({ type: 'error', text1: 'Enter your name' });
      return;
    }
    if (!email && !data.phone.trim()) {
      Toast.show({ type: 'error', text1: 'Email or phone required' });
      return;
    }

    try {
      const payload = {
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        password: data.password,
        firstName,
        lastName: lastName || firstName,
        profileType: mapUiProfileType(accountType),
        otp: data.otp.trim(),
      };
      await register(payload);
      Toast.show({ type: 'success', text1: 'Account created' });
      finishAuth();
    } catch (e) {
      Toast.show({ type: 'error', text1: authService.getApiErrorMessage(e) });
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
              Create your Account
            </Text>
            <Text className="text-base font-medium text-neutral">Join the Ghar Dekho community</Text>
          </View>

          <View className="mt-8">
            <View className="mb-6">
              <Text className="text-[11px] font-bold tracking-widest uppercase text-neutral ml-1 mb-2">
                Account Type
              </Text>
              <View className="flex-row p-1.5 bg-surface-input-alt rounded-full w-full">
                <TouchableOpacity
                  onPress={() => setAccountType('buyer')}
                  className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${accountType === 'buyer' ? 'bg-primary shadow-sm' : ''}`}
                >
                  <Text
                    className={`text-xs font-bold text-center ${accountType === 'buyer' ? 'text-white' : 'text-neutral'}`}
                  >
                    Buyer / Renter
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAccountType('owner')}
                  className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${accountType === 'owner' ? 'bg-primary shadow-sm' : ''}`}
                >
                  <Text
                    className={`text-xs font-bold text-center ${accountType === 'owner' ? 'text-white' : 'text-neutral'}`}
                  >
                    Owner
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAccountType('agent')}
                  className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${accountType === 'agent' ? 'bg-primary shadow-sm' : ''}`}
                >
                  <Text
                    className={`text-xs font-bold text-center ${accountType === 'agent' ? 'text-white' : 'text-neutral'}`}
                  >
                    Agent / Broker
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Controller
              control={control}
              rules={{ required: 'Full Name is required' }}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  outlineStyle={{ borderRadius: 999 }}
                  left={<PaperInput.Icon icon="account" />}
                  error={Boolean(errors.fullName?.message)}
                  style={{ backgroundColor: '#EEF0F4' }}
                />
              )}
            />

            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              }}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Email Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  outlineStyle={{ borderRadius: 999 }}
                  left={<PaperInput.Icon icon="email" />}
                  error={Boolean(errors.email?.message)}
                  style={{ backgroundColor: '#EEF0F4', marginTop: 16 }}
                />
              )}
            />

            <Controller
              control={control}
              rules={{ required: 'Phone is required' }}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  outlineStyle={{ borderRadius: 999 }}
                  left={<PaperInput.Icon icon="phone" />}
                  error={Boolean(errors.phone?.message)}
                  style={{ backgroundColor: '#EEF0F4', marginTop: 16 }}
                />
              )}
            />

            <View className="mt-5">
              <Button
                title="Send verification code"
                variant="outline"
                icon="sms"
                loading={sendingOtp}
                onPress={sendVerificationOtp}
              />
              <Text className="text-xs text-neutral mt-2 px-1">
                Sends OTP to your email (matches registration verification when both email and phone are on file).
              </Text>
            </View>

            <Controller
              control={control}
              rules={{ required: 'OTP is required', minLength: { value: 4, message: 'Enter the code' } }}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Verification code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  outlineStyle={{ borderRadius: 999 }}
                  left={<PaperInput.Icon icon="shield-check" />}
                  error={Boolean(errors.otp?.message)}
                  style={{ backgroundColor: '#EEF0F4', marginTop: 16 }}
                />
              )}
            />

            <Controller
              control={control}
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              }}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  outlineStyle={{ borderRadius: 999 }}
                  left={<PaperInput.Icon icon="lock" />}
                  error={Boolean(errors.password?.message)}
                  style={{ backgroundColor: '#EEF0F4', marginTop: 16 }}
                />
              )}
            />

            <Controller
              control={control}
              rules={{
                required: 'Please confirm password',
                validate: v => v === password || 'Passwords do not match',
              }}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  outlineStyle={{ borderRadius: 999 }}
                  left={<PaperInput.Icon icon="lock" />}
                  error={Boolean(errors.confirmPassword?.message)}
                  style={{ backgroundColor: '#EEF0F4', marginTop: 16 }}
                />
              )}
            />
          </View>

          <View className="mt-10">
            <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

            <Text className="text-center text-xs text-neutral mt-5 px-4 leading-relaxed">
              By signing up, you agree to our <Text className="text-primary font-bold">Terms of Service</Text> and{' '}
              <Text className="text-primary font-bold">Privacy Policy</Text>.
            </Text>
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
