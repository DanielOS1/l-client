import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoadingLogo } from './LoadingLogo';

// tiempo mínimo visible: aunque el dashboard esté listo al instante, la
// animación siempre alcanza a mostrarse (entrada de la corona + un loop completo)
const MIN_VISIBLE_MS = 1800;

interface PostLoginLoadingProps {
  onDone: () => void;
}

export function PostLoginLoading({ onDone }: PostLoginLoadingProps) {
  useEffect(() => {
    const timeout = setTimeout(onDone, MIN_VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <LoadingLogo />
      <Text style={styles.label}>Preparando tu espacio...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 18,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});
