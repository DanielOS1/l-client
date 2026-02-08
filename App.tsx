import "./global.css";
import React from "react";
import { RootNavigator } from "./src/navigation";
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <PaperProvider>
      <RootNavigator />
      <Toast />
    </PaperProvider>
  );
}
