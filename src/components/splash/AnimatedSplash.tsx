import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { BrandDropLogo } from '../brand/BrandDropLogo';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.5; // ajusta según el tamaño que quieras en pantalla

// tope duro: pase lo que pase con el spring, la splash no dura más que esto
const MAX_ANIMATION_MS = 2000;

// el clip dura 1000ms exactos y no trae fade-out propio, así que lo simulamos a mano
// para evitar el "click" del corte abrupto
const SOUND_FADE_OUT_DELAY_MS = 900;
const SOUND_FADE_OUT_DURATION_MS = 100;
const SOUND_FADE_STEP_MS = 20;

interface AnimatedSplashProps {
  onAnimationEnd: () => void;
}

export default function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
  const endedRef = useRef(false);
  const player = useAudioPlayer(require('../../../assets/sounds/icon-sound.mp3'));
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finishOnce = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    onAnimationEnd();
  };

  const clearFade = () => {
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
  };

  const handleDropStart = () => {
    // arranca el sonido en el mismo instante en que la corona empieza a caer
    player.volume = 1;
    player.seekTo(0);
    player.play();

    fadeTimeoutRef.current = setTimeout(() => {
      const steps = SOUND_FADE_OUT_DURATION_MS / SOUND_FADE_STEP_MS;
      let step = 0;
      fadeIntervalRef.current = setInterval(() => {
        step += 1;
        player.volume = Math.max(1 - step / steps, 0);
        if (step >= steps && fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }, SOUND_FADE_STEP_MS);
    }, SOUND_FADE_OUT_DELAY_MS);
  };

  useEffect(() => {
    // red de seguridad: si el spring tarda más de la cuenta en "asentar", igual avanzamos
    const safetyTimeout = setTimeout(finishOnce, MAX_ANIMATION_MS);
    return () => {
      clearTimeout(safetyTimeout);
      clearFade();
    };
  }, []);

  return (
    <View style={styles.container}>
      <BrandDropLogo size={LOGO_SIZE} onDropStart={handleDropStart} onSettled={finishOnce} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // o el color de fondo de tu splash nativa
    alignItems: 'center',
    justifyContent: 'center',
  },
});