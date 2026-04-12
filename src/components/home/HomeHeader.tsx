/**
 * @file HomeHeader.tsx
 * @description Home navbar: mark + wordmark; search opens with animation (wordmark fades, field slides in).
 * Search control sits left of the menu (hamburger).
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LOGO_MARK = require('../../assets/logo/logo-mark.png');
const LOGO_WORD = require('../../assets/logo/logo-wordmark.png');

const NAVY = '#122A47';
const SURFACE = '#F1F3F5';

export interface HomeHeaderProps {
  onMenuPress?: () => void;
  /** Called when user submits the search field (return key) */
  onSubmitSearch: (query: string) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ onMenuPress, onSubmitSearch }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  const wordOpacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 0, 0],
  });
  const searchOpacity = progress.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 1, 1],
  });
  const searchSlide = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  const openSearch = useCallback(() => {
    setExpanded(true);
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      friction: 9,
      tension: 65,
    }).start();
  }, [progress]);

  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    Animated.spring(progress, {
      toValue: 0,
      useNativeDriver: true,
      friction: 9,
      tension: 70,
    }).start(({ finished }) => {
      if (finished) {
        setExpanded(false);
        setQuery('');
      }
    });
  }, [progress]);

  useEffect(() => {
    if (expanded) {
      const t = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  const submit = useCallback(() => {
    const q = query.trim();
    if (q.length > 0) {
      onSubmitSearch(q);
    }
    closeSearch();
  }, [query, onSubmitSearch, closeSearch]);

  return (
    <View style={styles.header}>
      <View style={styles.leftCluster}>
        <View style={styles.logoMarkBox}>
          <Image
            source={LOGO_MARK}
            style={styles.logoMarkFill}
            resizeMode="contain"
            fadeDuration={0}
            accessibilityLabel="Ghar Dekho"
          />
        </View>

        <View style={styles.middleSlot}>
          <Animated.View
            style={[styles.layerAbs, { opacity: wordOpacity }]}
            pointerEvents={expanded ? 'none' : 'auto'}
            accessibilityElementsHidden={expanded}
          >
            <Image
              source={LOGO_WORD}
              style={styles.wordmarkImg}
              resizeMode="contain"
              fadeDuration={0}
              accessibilityLabel="Ghar Dekho India"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.layerAbs,
              styles.searchLayer,
              {
                opacity: searchOpacity,
                transform: [{ translateX: searchSlide }],
              },
            ]}
            pointerEvents={expanded ? 'auto' : 'none'}
          >
            <View style={styles.searchFieldShell}>
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Search locality, area…"
                placeholderTextColor="rgba(18,42,71,0.45)"
                style={styles.searchInputInner}
                returnKeyType="search"
                onSubmitEditing={submit}
                editable={expanded}
                accessibilityLabel="Search properties"
              />
              {expanded ? (
                <TouchableOpacity
                  onPress={closeSearch}
                  style={styles.clearInside}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.65}
                  accessibilityRole="button"
                  accessibilityLabel="Close search"
                >
                  <Icon name="close" size={20} color={NAVY} />
                </TouchableOpacity>
              ) : null}
            </View>
          </Animated.View>
        </View>
      </View>

      <View style={styles.rightActions}>
        {!expanded ? (
          <TouchableOpacity
            onPress={openSearch}
            style={styles.iconBtn}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Open search"
          >
            <Icon name="magnify" size={24} color={NAVY} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={styles.iconBtn} accessibilityLabel="Menu">
          <Icon name="menu" size={24} color={NAVY} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
  },
  leftCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 8,
  },
  logoMarkBox: {
    width: 44,
    height: 44,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMarkFill: {
    width: '75%',
    height: '75%',
  },
  middleSlot: {
    flex: 1,
    height: 44,
    marginLeft: 0,
    minWidth: 0,
    position: 'relative',
  },
  layerAbs: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  searchLayer: {
    paddingRight: 2,
  },
  wordmarkImg: {
    width: '80%',
    maxWidth: 240,
    height: 30,
    alignSelf: 'flex-start',
  },
  searchFieldShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    height: 40,
    borderRadius: 999,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: 'rgba(18, 42, 71, 0.08)',
    paddingLeft: 14,
    paddingRight: 4,
  },
  searchInputInner: {
    flex: 1,
    minWidth: 0,
    height: 40,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingRight: 6,
    fontSize: 15,
    color: NAVY,
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  clearInside: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 999,
  },
});

export default HomeHeader;
