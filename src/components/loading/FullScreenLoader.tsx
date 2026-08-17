import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BrandDropLogo } from '../brand/BrandDropLogo';
import { LoadingBar } from './LoadingBar';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.4;
const BAR_WIDTH = width * 0.55;

interface FullScreenLoaderProps {
  label?: string;
}

export function FullScreenLoader({ label = 'Cargando...' }: FullScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <BrandDropLogo size={LOGO_SIZE} pulse />
      <LoadingBar style={{ width: BAR_WIDTH, marginTop: 28 }} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
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
    marginTop: 14,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});
