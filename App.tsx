import "./global.css";
import React, { useCallback, useEffect, useState } from "react";
import * as ExpoSplashScreen from "expo-splash-screen";
import { RootNavigator } from "./src/navigation";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";
import { setAuthLogout } from "./src/services/api";
import { useAuthStore } from "./src/store/useAuthStore";

// evita que la splash nativa se oculte sola, antes de que el árbol de React se monte
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    setAuthLogout(useAuthStore.getState().logout);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    // apenas el primer frame de React (tu AnimatedSplash) ya se pintó, oculta la nativa
    await ExpoSplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider>
      <RootNavigator onReady={onLayoutRootView} />
      <Toast />
    </PaperProvider>
  );
}