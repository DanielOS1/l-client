import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../../store/useAuthStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { AppLogo } from "../../../components/AppLogo";
import { useNavigation } from "@react-navigation/native";

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Completa todos los campos" });
      return;
    }

    try {
      await login(email, password);
    } catch (e: any) {
      if (e.message === "Network Error") {
        Toast.show({
          type: "error",
          text1: "Sin conexión",
          text2: "Verifica que el servidor esté disponible.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Credenciales incorrectas",
          text2: e.response?.data?.message || "Revisa tu correo y contraseña.",
        });
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Top teal band */}
            <View
              style={{
                backgroundColor: "#3AC4BE",
                paddingTop: 48,
                paddingBottom: 52,
                alignItems: "center",
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
              }}
            >
              {/* Decorative circles */}
              <View
                style={{
                  position: "absolute",
                  right: -24,
                  top: -24,
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  left: -16,
                  bottom: 0,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              />

              <AppLogo
                iconSize={64}
                showText={true}
                layout="column"
                textVariant="light"
              />
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Gestión para organizaciones estudiantiles
              </Text>
            </View>

            {/* Form */}
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: "#0f172a",
                  marginBottom: 20,
                }}
              >
                Iniciar Sesión
              </Text>

              <Input
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

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
