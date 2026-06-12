import "./global.css";
import React, { useEffect } from "react";
import { RootNavigator } from "./src/navigation";
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { setAuthLogout } from './src/services/api';
import { useAuthStore } from './src/store/useAuthStore';

export default function App() {
  useEffect(() => {
    setAuthLogout(useAuthStore.getState().logout);
  }, []);

  return (
    <PaperProvider>
      <RootNavigator />
      <Toast />
    </PaperProvider>
  );
}
