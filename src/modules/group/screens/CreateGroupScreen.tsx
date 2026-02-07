import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { SafeAreaView } from "react-native-safe-area-context";

export function CreateGroupScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createGroup, isLoading } = useGroupStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del grupo es obligatorio");
      return;
    }

    if (!user?.id) return;

    try {
      await createGroup(name, description, user.id);
      Alert.alert("Éxito", "Grupo creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      // Error handled by store but we can show alert here too if needed
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-slate-900 mb-6">
          Nuevo Grupo
        </Text>

        <View className="space-y-4">
          <Input
            label="Nombre del Grupo"
            placeholder="Ej. Finanzas 2024"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Descripción (Opcional)"
            placeholder="Breve descripción..."
            value={description}
            onChangeText={setDescription}
          />

          <Button
            title="Crear Grupo"
            onPress={handleCreate}
            isLoading={isLoading}
            className="mt-4"
          />

          <Button
            title="Cancelar"
            variant="ghost"
            onPress={() => navigation.goBack()}
            className="mt-2"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
