import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import Corona from '../../../assets/svg/Corona.svg';
import Letras from '../../../assets/svg/Letras.svg';

// delay antes de que la corona empiece a caer (también usado para sincronizar el audio del splash)
const DROP_START_DELAY_MS = 100;

interface BrandDropLogoProps {
  size: number;
  /** respiro suave y continuo una vez que la corona asienta, para loaders que permanecen visibles */
  pulse?: boolean;
  /** dispara justo cuando arranca la caída (translateY/opacity), útil para sincronizar sonido */
  onDropStart?: () => void;
  onSettled?: () => void;
}

export function BrandDropLogo({ size, pulse = false, onDropStart, onSettled }: BrandDropLogoProps) {
  const translateY = useSharedValue(-size * 0.6);
  const opacity = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    // reanimated no expone un callback "onStart" para withDelay/withSpring,
    // así que espejamos el mismo delay desde JS para avisar al arrancar la caída
    const dropStartTimeout = onDropStart ? setTimeout(onDropStart, DROP_START_DELAY_MS) : null;

    opacity.value = withDelay(DROP_START_DELAY_MS, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      DROP_START_DELAY_MS,
      withSpring(0, { damping: 16, stiffness: 220, mass: 0.6 }, (finished) => {
        if (finished) {
          if (onSettled) runOnJS(onSettled)();
          if (pulse) {
            breathe.value = withRepeat(
              withSequence(
                withTiming(1.035, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
              ),
              -1,
              false
            );
          }
        }
      })
    );

    return () => {
      if (dropStartTimeout) clearTimeout(dropStartTimeout);
    };
  }, []);

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  const coronaStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, wrapperStyle]}>
      <View style={StyleSheet.absoluteFill}>
        <Letras width={size} height={size} />
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, coronaStyle]}>
        <Corona width={size} height={size} />
      </Animated.View>
    </Animated.View>
  );
}
