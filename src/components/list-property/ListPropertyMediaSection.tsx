import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useController, type Control, type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import type { ListPropertyFormValues } from '../../types/list-property-form.types';
import ListPropertyStepSection from './ListPropertyStepSection';
import { LP_COLOR, LP_STACK } from './listPropertyLayout';

interface ListPropertyMediaSectionProps {
  control: Control<ListPropertyFormValues>;
  setValue: UseFormSetValue<ListPropertyFormValues>;
  getValues: UseFormGetValues<ListPropertyFormValues>;
}

const ListPropertyMediaSection: React.FC<ListPropertyMediaSectionProps> = ({ control, setValue, getValues }) => {
  const {
    field: { value: photoUris },
  } = useController({ control, name: 'photoUris' });
  const {
    field: { value: coverIndex, onChange: setCoverIndex },
  } = useController({ control, name: 'coverIndex' });
  const { field: videoUriField } = useController({ control, name: 'videoTourUri' });

  const [videoBusy, setVideoBusy] = useState(false);
  const [panoramaBusy, setPanoramaBusy] = useState(false);

  const openPhotoPicker = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 12,
      },
      res => {
        if (res.didCancel) {
          return;
        }
        const uris = res.assets?.map(a => a.uri).filter((u): u is string => Boolean(u)) ?? [];
        if (!uris.length) {
          return;
        }
        const prev = getValues('photoUris');
        setValue('photoUris', [...prev, ...uris], { shouldDirty: true });
      },
    );
  }, [getValues, setValue]);

  const openVideoPicker = useCallback(() => {
    setVideoBusy(true);
    launchImageLibrary(
      {
        mediaType: 'video',
        selectionLimit: 1,
        videoQuality: 'high',
      },
      res => {
        setVideoBusy(false);
        if (res.didCancel) {
          return;
        }
        const uri = res.assets?.[0]?.uri;
        if (!uri) {
          Toast.show({ type: 'error', text1: 'No video selected' });
          return;
        }
        setValue('videoTourUri', uri, { shouldDirty: true });
        Toast.show({ type: 'success', text1: 'Video tour attached' });
      },
    );
  }, [setValue]);

  const openPanoramaImage = useCallback(() => {
    setPanoramaBusy(true);
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      res => {
        setPanoramaBusy(false);
        if (res.didCancel) {
          return;
        }
        const uri = res.assets?.[0]?.uri;
        if (!uri) {
          Toast.show({ type: 'error', text1: 'No image selected' });
          return;
        }
        const prev = getValues('photoUris');
        setValue('photoUris', [...prev, uri], { shouldDirty: true });
        Toast.show({ type: 'success', text1: '360° image added', text2: 'Shown in your gallery above.' });
      },
    );
  }, [getValues, setValue]);

  return (
    <ListPropertyStepSection title="Media & Tours">
      <View style={LP_STACK.section}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={openPhotoPicker}
          className="items-center justify-center rounded-3xl border-2 border-dashed border-outline bg-surface-muted p-8"
        >
          <View
            className="mb-4 h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: LP_COLOR.tealIconBg }}
          >
            <Icon name="cloud-upload-outline" size={28} color="#008080" />
          </View>
          <Text className="text-sm font-extrabold text-primary">Upload HD Photos</Text>
          <Text className="mt-1 text-center text-[11px] font-medium uppercase tracking-wider text-on-surface-muted">
            Tap to browse photos
          </Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryScroll}
        >
          {photoUris.length === 0 ? (
            <View style={styles.emptyGallerySlot} accessibilityLabel="No property photos yet">
              <Icon name="image-off-outline" size={36} color="#ADB5BD" />
              <Text className="mt-2 px-2 text-center text-[10px] font-bold uppercase tracking-wide text-on-surface-muted">
                No photos here yet
              </Text>
            </View>
          ) : (
            photoUris.map((uri, index) => {
              const isCover = index === coverIndex;
              return (
                <TouchableOpacity
                  key={`${uri}-${index}`}
                  activeOpacity={0.9}
                  onPress={() => setCoverIndex(index)}
                  className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-3xl"
                  style={isCover ? styles.coverRing : styles.thumbDimmed}
                >
                  <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
                  {isCover ? (
                    <View className="absolute left-3 top-3 rounded-full bg-brand-teal px-3 py-1">
                      <Text className="text-[8px] font-black uppercase tracking-widest text-on-primary">Cover</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <View style={LP_STACK.row12}>
          <TouchableOpacity
            activeOpacity={0.85}
            className="rounded-full bg-surface-container-high py-4"
            style={LP_STACK.tourBtn}
            onPress={openVideoPicker}
            disabled={videoBusy}
          >
            {videoBusy ? (
              <ActivityIndicator size="small" color="#122A47" />
            ) : (
              <Icon name="video-outline" size={22} color="#122A47" />
            )}
            <Text className="text-[11px] font-black uppercase tracking-widest text-primary">Video Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            className="rounded-full bg-surface-container-high py-4"
            style={LP_STACK.tourBtn}
            onPress={openPanoramaImage}
            disabled={panoramaBusy}
          >
            {panoramaBusy ? (
              <ActivityIndicator size="small" color="#122A47" />
            ) : (
              <Icon name="panorama-variant-outline" size={24} color="#122A47" />
            )}
            <Text className="text-[11px] font-black uppercase tracking-widest text-primary">360° View</Text>
          </TouchableOpacity>
        </View>

        {videoUriField.value ? (
          <View className="flex-row items-center gap-2 rounded-2xl px-3 py-2" style={{ backgroundColor: LP_COLOR.videoAttachedBg }}>
            <Icon name="check-circle" size={18} color="#008080" />
            <Text className="min-w-0 flex-1 text-xs font-semibold text-on-teal-surface" numberOfLines={2}>
              Video file ready to upload with your listing
            </Text>
            <TouchableOpacity
              onPress={() => setValue('videoTourUri', '', { shouldDirty: true })}
              hitSlop={8}
              accessibilityLabel="Remove video"
            >
              <Icon name="close-circle-outline" size={22} color="#004D40" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ListPropertyStepSection>
  );
};

const styles = StyleSheet.create({
  galleryScroll: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyGallerySlot: {
    height: 144,
    width: 144,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CED4DA',
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  coverRing: {
    borderWidth: 4,
    borderColor: '#008080',
  },
  thumbDimmed: {
    opacity: 0.88,
  },
});

export default ListPropertyMediaSection;
