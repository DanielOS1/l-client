import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import Corona from '../../../assets/svg/Corona.svg';
import U from '../../../assets/svg/U.svg';
import J from '../../../assets/svg/J.svg';

const { width } = Dimensions.get('window');
const DEFAULT_SIZE = width * 0.35;

// separación máxima entre piezas en cada ciclo del loop
const SEPARATION_PX = 14;
const LOOP_HALF_DURATION_MS = 700;
const ENTRY_DELAY_MS = 100;

interface LoadingLogoProps {
  /** lado del componente (cuadrado); default ~35% del ancho de pantalla */
  size?: number;
}

export function LoadingLogo({ size = DEFAULT_SIZE }: LoadingLogoProps) {
  // único shared value que maneja el loop infinito de "respiración" de las 3 piezas
  const progress = useSharedValue(0);
  // fase de entrada, independiente del loop: la corona cae a su lugar al montar
  const coronaEntryY = useSharedValue(-size * 0.6);

  useEffect(() => {
    coronaEntryY.value = withDelay(
      ENTRY_DELAY_MS,
      withSpring(0, { damping: 16, stiffness: 220, mass: 0.6 }, (finished) => {
        if (finished) {
          progress.value = withRepeat(
            withSequence(
              withTiming(1, { duration: LOOP_HALF_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: LOOP_HALF_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
        }
      }),
    );
  }, []);

  const coronaStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + progress.value * 0.5,
    transform: [{ translateY: coronaEntryY.value - progress.value * SEPARATION_PX }],
  }));

  const uStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + progress.value * 0.5,
    transform: [{ translateX: -progress.value * SEPARATION_PX }],
  }));

  const jStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + progress.value * 0.5,
    transform: [{ translateX: progress.value * SEPARATION_PX }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, uStyle]}>
        <U width={size} height={size} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, jStyle]}>
        <J width={size} height={size} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, coronaStyle]}>
        <Corona width={size} height={size} />
      </Animated.View>
    </View>
  );
}
