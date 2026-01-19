import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuthStore } from "../../../store/useAuthStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { useNavigation } from "@react-navigation/native";

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register, isLoading, error } = useAuthStore();

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
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
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
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Error al crear cuenta"
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6 py-10"
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
                  placeholder="Juan"
                  value={form.firstName}
                  onChangeText={(t: string) => handleChange("firstName", t)}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Apellido"
                  placeholder="Pérez"
                  value={form.lastName}
                  onChangeText={(t: string) => handleChange("lastName", t)}
                />
              </View>
            </View>

            <Input
              label="RUT"
              placeholder="12.345.678-9"
              value={form.rut}
              onChangeText={(t: string) => handleChange("rut", t)}
            />

            <Input
              label="Correo Electrónico"
              placeholder="juan@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(t: string) => handleChange("email", t)}
            />

            <Input
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              value={form.password}
              onChangeText={(t: string) => handleChange("password", t)}
            />

            <Input
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              secureTextEntry
              value={form.confirmPassword}
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
