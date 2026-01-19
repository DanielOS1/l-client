import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useAuthStore } from "../../../store/useAuthStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { useNavigation } from "@react-navigation/native";

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      await login(email, password);

    } catch (e: any) {
      console.error("Login Error Details:", e);
      if (e.message === "Network Error") {
        Alert.alert(
          "Error de Conexión",
          "No se pudo conectar con el servidor. Verifica que tu dispositivo y tu PC estén en la misma red y que la IP sea correcta."
        );
      } else {
        Alert.alert(
          "Login Fallido",
          e.response?.data?.message || "Credenciales incorrectas"
        );
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center px-6">
            <View className="mb-10 items-center">
              <Text className="text-4xl font-extrabold text-blue-600 tracking-tighter">
                Lolos<Text className="text-slate-900">App</Text>
              </Text>
              <Text className="text-gray-500 mt-2 text-lg">
                Tu gestión financiera, simplificada.
              </Text>
            </View>

            <View className="space-y-4">
              <Input
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                error={error ? " " : undefined} 
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {error && (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              )}

              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                isLoading={isLoading}
                className="mt-4"
              />

              <Button
                title="¿No tienes cuenta? Regístrate"
                variant="ghost"
                onPress={() => navigation.navigate("Register")}
                className="mt-2"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
