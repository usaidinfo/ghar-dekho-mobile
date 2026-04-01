import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    console.log("Login Data:", data);
    // Simulate API Call
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>

          {/* Header */}
          <View className="mb-10">
            <Text className="text-[34px] leading-10 font-extrabold text-dark tracking-tight mb-2">
              Welcome to Ghar Dekho India
            </Text>
            <Text className="text-base font-medium text-neutral">
              Your dream home awaits
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            <Controller
              control={control}
              rules={{ required: 'ID is required' }}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email User ID or Phone Number"
                  placeholder="Enter your ID"
                  leftIcon="person"
                  inputBg="surface-input-alt"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  error={errors.identifier?.message as string}
                />
              )}
            />

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
          </View>

          {/* Action Buttons */}
          <View className="mt-8 space-y-4">
            <Button
              title="Login"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            />

            <View className="flex-row items-center my-4 opacity-50">
              <View className="flex-1 h-[1px] bg-neutral" />
              <Text className="mx-4 text-neutral text-xs font-bold uppercase tracking-widest">OR</Text>
              <View className="flex-1 h-[1px] bg-neutral" />
            </View>

            <Button
              title="Login with OTP instead"
              variant="outline"
              icon="sms"
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-12 mb-8">
            <Text className="text-neutral font-medium text-base">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
              <Text className="text-secondary font-bold text-base">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Card for Mobile */}
          <View className="w-full h-[140px] rounded-3xl overflow-hidden mt-auto relative">
            <View className="absolute inset-0 bg-primary/40 z-10" />
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
              className="w-full h-full object-cover"
            />
            <View className="absolute inset-0 z-20 justify-center px-6">
              <Text className="text-white font-bold text-lg leading-tight">
                Explore curated properties {"\n"}
                <Text className="text-secondary">across India.</Text>
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
