import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../store/useAuthStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { api } from "../../../services/api";
import { ApiResponse } from "../../../types/api.types";
import { User } from "../../../types";
import { ChevronLeft, User as UserIcon } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

export function UserProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [occupation, setOccupation] = useState(user?.occupation || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "El nombre y apellido son obligatorios.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.patch<ApiResponse<User>>(`/users/${user!.id}`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        occupation: occupation.trim() || undefined,
      });
      // Update user in auth store without full logout
      useAuthStore.setState({ user: response.data.data });
      Alert.alert("Guardado", "Tu perfil fue actualizado.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo actualizar el perfil."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 mr-2">
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Mi Perfil</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          {/* Avatar placeholder */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-brand-teal-light rounded-full items-center justify-center mb-3">
              <Text className="text-brand-teal text-3xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Text>
            </View>
            <Text className="text-slate-500 text-sm">{user?.email}</Text>
            <View className="mt-1 bg-slate-100 px-3 py-1 rounded-full">
              <Text className="text-slate-500 text-xs font-medium">RUT: {user?.rut}</Text>
            </View>
          </View>

          {/* Editable fields */}
          <Input
            label="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            containerClassName="mb-4"
          />
          <Input
            label="Apellido"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            containerClassName="mb-4"
          />
          <Input
            label="Teléfono (opcional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            containerClassName="mb-4"
          />
          <Input
            label="Ocupación (opcional)"
            value={occupation}
            onChangeText={setOccupation}
            autoCapitalize="words"
            containerClassName="mb-6"
          />

          <Button
            title="Guardar Cambios"
            onPress={handleSave}
            isLoading={isLoading}
          />

          {__DEV__ && (
            <TouchableOpacity
              onPress={async () => {
                await SecureStore.deleteItemAsync("seen_notice_ids");
                await SecureStore.deleteItemAsync("seen_asgn_ids");
                Toast.show({ type: "success", text1: "[DEV] SecureStore reseteado", text2: "Vuelve a entrar al grupo para probar notificaciones" });
              }}
              style={{ marginTop: 24, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#fca5a5", alignItems: "center" }}
            >
              <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: "600" }}>[DEV] Reset notificaciones vistas</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
