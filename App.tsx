import "./global.css";
import React from "react";
import { RootNavigator } from "./src/navigation";
import { PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider>
      <RootNavigator />
    </PaperProvider>
  );
}
