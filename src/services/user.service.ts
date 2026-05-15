import type { Asset } from 'react-native-image-picker';
import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import type {
  CurrentUser,
  CurrentUserProfile,
  UpdateProfilePayload,
} from '../types/user.types';
import type { ProfileType } from '../types/auth.types';

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await httpClient.get<ApiSuccess<CurrentUser>>('/api/users/me');
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to load profile');
  }
  return data.data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<CurrentUserProfile> {
  const { data } = await httpClient.put<ApiSuccess<CurrentUserProfile>>(
    '/api/users/me',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return data.data;
}

export async function updateMyProfileType(
  profileType: ProfileType,
): Promise<{ id: string; role: string; profileType: ProfileType }> {
  const { data } = await httpClient.put<
    ApiSuccess<{ id: string; role: string; profileType: ProfileType }>
  >('/api/users/me/profile-type', { profileType });
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to update role');
  }
  return data.data;
}

/** Normalize a picked image asset for multipart upload. */
function buildImagePart(asset: Asset): { uri: string; type: string; name: string } {
  const uri = asset.uri ?? '';
  let type = (asset.type || 'image/jpeg').toLowerCase();
  if (type === 'image/jpg') type = 'image/jpeg';
  if (!type.startsWith('image/')) type = 'image/jpeg';

  const rawName = asset.fileName?.trim().replace(/\s+/g, '_');
  const name =
    rawName && /\.(jpe?g|png|webp|heic|heif)$/i.test(rawName)
      ? rawName
      : type.includes('png')
        ? 'avatar.png'
        : type.includes('webp')
          ? 'avatar.webp'
          : type.includes('heic') || type.includes('heif')
            ? 'avatar.heic'
            : 'avatar.jpg';
  return { uri, type, name };
}

export interface AddMyContactResponse {
  id: string;
  email: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

/**
 * Attach a missing email OR phone to the current account using an
 * EMAIL_VERIFICATION / PHONE_VERIFICATION OTP. The OTP must have been
 * requested via /api/auth/send-otp.
 *
 * Exactly one of `email` or `phone` must be passed.
 */
export async function addMyContact(payload: {
  email?: string;
  phone?: string;
  otp: string;
}): Promise<AddMyContactResponse> {
  const { data } = await httpClient.post<ApiSuccess<AddMyContactResponse>>(
    '/api/users/me/contact',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to add contact');
  }
  return data.data;
}

export async function uploadMyProfileImage(
  asset: Asset,
): Promise<{ profileImage: string }> {
  const form = new FormData();
  form.append('image', buildImagePart(asset) as unknown as Blob);

  const { data } = await httpClient.post<ApiSuccess<{ profileImage: string }>>(
    '/api/users/me/profile-image',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (d, _headers) => d,
    },
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to upload image');
  }
  return data.data;
}
