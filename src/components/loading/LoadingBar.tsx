import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingBarProps {
  height?: number;
  style?: ViewStyle;
}

// ancho del segmento animado, relativo al ancho total de la barra
const SEGMENT_RATIO = 0.38;

export function LoadingBar({ height = 6, style }: LoadingBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!trackWidth) return;
    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [trackWidth]);

  const segmentWidth = trackWidth * SEGMENT_RATIO;

  const segmentStyle = useAnimatedStyle(() => {
    const travel = trackWidth + segmentWidth;
    return { transform: [{ translateX: -segmentWidth + progress.value * travel }] };
  });

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      {trackWidth > 0 && (
        <Animated.View
          style={[
            styles.segment,
            { width: segmentWidth, borderRadius: height / 2 },
            segmentStyle,
          ]}
        >
          <LinearGradient
            colors={['#3AC4BE', '#FFC200']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: '#e0f7f6',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
});
