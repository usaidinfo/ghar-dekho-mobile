import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SignupScreen() {
  const navigation = useNavigation();
  const [accountType, setAccountType] = useState('buyer');
  const { control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const password = watch("password");

  const onSubmit = async (data: any) => {
    console.log("Signup Data:", { ...data, accountType });
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View className="mb-10">
            <Text className="text-[34px] leading-10 font-extrabold text-primary tracking-tight mb-2">
              Create your Account
            </Text>
            <Text className="text-base font-medium text-neutral">
              Join the Ghar Dekho community
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mt-8">
            {/* Account Type Selector */}
            <View className="mb-6">
              <Text className="text-[11px] font-bold tracking-widest uppercase text-neutral ml-1 mb-2">Account Type</Text>
              <View className="flex-row p-1.5 bg-surface-input-alt rounded-full w-full">
                <TouchableOpacity
                  onPress={() => setAccountType('buyer')}
                  className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${accountType === 'buyer' ? 'bg-primary shadow-sm' : ''}`}
                >
                  <Text className={`text-xs font-bold text-center ${accountType === 'buyer' ? 'text-white' : 'text-neutral'}`}>
                    Buyer / Renter
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAccountType('owner')}
                  className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${accountType === 'owner' ? 'bg-primary shadow-sm' : ''}`}
                >
                  <Text className={`text-xs font-bold text-center ${accountType === 'owner' ? 'text-white' : 'text-neutral'}`}>
                    Owner
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAccountType('agent')}
                  className={`flex-1 py-3 px-2 rounded-full items-center justify-center ${accountType === 'agent' ? 'bg-primary shadow-sm' : ''}`}
                >
                  <Text className={`text-xs font-bold text-center ${accountType === 'agent' ? 'text-white' : 'text-neutral'}`}>
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
                <Input
                  className="mt-0"
                  inputBg="surface-input-alt"
                  placeholder="Full Name"
                  leftIcon="person"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.fullName?.message as string}
                />
              )}
            />

            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
              }}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  containerStyle={{ marginTop: 20 }}
                  inputBg="surface-input-alt"
                  placeholder="Email Address"
                  leftIcon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message as string}
                />
              )}
            />

            <Controller
              control={control}
              rules={{ required: 'Phone is required' }}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mt-5">
                  <View className={`w-full h-14 bg-surface-input-alt rounded-full flex-row items-center relative ${errors.phone ? 'border border-red-500 bg-red-50' : ''}`}>
                    <View className="absolute left-4 z-10 w-6 items-center">
                      <Icon name="phone-iphone" size={22} color="#777779" />
                    </View>
                    <Text className="pl-12 pr-3 font-bold text-dark border-r border-outline">+91</Text>
                    <TextInput
                      className="flex-1 h-14 px-3 text-dark font-medium placeholder:text-neutral"
                      placeholder="Phone Number"
                      placeholderTextColor="#777779"
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                  {errors.phone && <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium tracking-wide">{errors.phone.message as string}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }
              }}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  containerStyle={{ marginTop: 20 }}
                  inputBg="surface-input-alt"
                  placeholder="Password"
                  leftIcon="lock"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message as string}
                />
              )}
            />

            <Controller
              control={control}
              rules={{
                required: 'Please confirm password',
                validate: value => value === password || "Passwords do not match"
              }}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  containerStyle={{ marginTop: 20 }}
                  inputBg="surface-input-alt"
                  placeholder="Confirm Password"
                  leftIcon="verified-user"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message as string}
                />
              )}
            />
          </View>

          {/* Action Button */}
          <View className="mt-10">
            <Button
               title="Create Account"
               onPress={handleSubmit(onSubmit)}
               loading={isSubmitting}
            />

            <Text className="text-center text-xs text-neutral mt-5 px-4 leading-relaxed">
              By signing up, you agree to our <Text className="text-primary font-bold">Terms of Service</Text> and <Text className="text-primary font-bold">Privacy Policy</Text>.
            </Text>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-10 mb-6 pt-6 border-t border-outline/30">
            <Text className="text-neutral font-medium text-base">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text className="text-secondary font-bold text-base">Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
