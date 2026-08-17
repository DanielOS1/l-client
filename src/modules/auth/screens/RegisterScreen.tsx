import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../../store/useAuthStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { useKeyboardScrollToInput } from "../../../hooks/useKeyboardScrollToInput";

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register, isLoading, error } = useAuthStore();
  const { scrollRef, handleFocus } = useKeyboardScrollToInput();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rut: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.rut || !form.password) {
      Toast.show({ type: "error", text1: "Completa todos los campos" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      Toast.show({ type: "error", text1: "Las contraseñas no coinciden" });
      return;
    }

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        rut: form.rut,
      });
      Toast.show({ type: "success", text1: "¡Cuenta creada!", text2: "Bienvenido a Lolos App." });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error al registrarse",
        text2: e.response?.data?.message || "Intenta nuevamente.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 200 }}
          className="px-6 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text className="text-3xl font-bold text-slate-900">
              Crear Cuenta
            </Text>
            <Text className="text-gray-500 mt-1">
              Únete a tu grupo y comienza a organizar.
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Input
                  label="Nombre"
                  value={form.firstName}
                  onFocus={handleFocus}
                  onChangeText={(t: string) => handleChange("firstName", t)}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Apellido"
                  value={form.lastName}
                  onFocus={handleFocus}
                  onChangeText={(t: string) => handleChange("lastName", t)}
                />
              </View>
            </View>

            <Input
              label="RUT"
              placeholder="12.345.678-9"
              helperText="Con puntos y guión, ej: 12.345.678-9"
              value={form.rut}
              onFocus={handleFocus}
              onChangeText={(t: string) => handleChange("rut", t)}
            />

            <Input
              label="Correo Electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onFocus={handleFocus}
              onChangeText={(t: string) => handleChange("email", t)}
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              helperText={
                form.password.length > 0
                  ? `${form.password.length}/6 caracteres mínimo`
                  : "Mínimo 6 caracteres"
              }
              secureTextEntry
              value={form.password}
              onFocus={handleFocus}
              onChangeText={(t: string) => handleChange("password", t)}
            />

            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              helperText={
                form.confirmPassword.length > 0 && form.confirmPassword !== form.password
                  ? undefined
                  : "Repite la misma contraseña"
              }
              error={
                form.confirmPassword.length > 0 && form.confirmPassword !== form.password
                  ? "Las contraseñas no coinciden"
                  : undefined
              }
              secureTextEntry
              value={form.confirmPassword}
              onFocus={handleFocus}
              onChangeText={(t: string) => handleChange("confirmPassword", t)}
            />

            <Button
              title="Registrarse"
              onPress={handleRegister}
              isLoading={isLoading}
              className="mt-4"
            />

            <Button
              title="Ya tengo cuenta"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
