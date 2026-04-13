import type { Asset } from 'react-native-image-picker';

/** Normalize MIME/name for multer (jpeg/png/webp/heic) + Cloudinary upload path */
export function normalizeChatImagePart(asset: Asset): { uri: string; type: string; name: string } {
  const uri = asset.uri ?? '';
  let type = (asset.type || 'image/jpeg').toLowerCase();
  if (type === 'image/jpg') type = 'image/jpeg';
  if (!type.startsWith('image/')) type = 'image/jpeg';
  const rawName = asset.fileName?.trim().replace(/\s+/g, '_');
  const name =
    rawName && /\.(jpe?g|png|webp|heic|heif)$/i.test(rawName)
      ? rawName
      : type.includes('png')
        ? 'photo.png'
        : type.includes('webp')
          ? 'photo.webp'
          : type.includes('heic') || type.includes('heif')
            ? 'photo.heic'
            : 'photo.jpg';
  return { uri, type, name };
}
