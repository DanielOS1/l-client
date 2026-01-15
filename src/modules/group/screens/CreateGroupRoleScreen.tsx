import React, { useState } from "react";
import { View, Text, SafeAreaView, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { groupService } from "../services/group.service";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";

export function CreateGroupRoleScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { getGroupDetails } = useGroupStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del rol es obligatorio");
      return;
    }

    setIsLoading(true);
    try {
      await groupService.createRole({ groupId, name, description });
      // Refresh group details to show new role
      await getGroupDetails(groupId);
      Alert.alert("Éxito", "Rol creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Error al crear rol");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-slate-900 mb-6">
          Nuevo Rol
        </Text>

        <View className="space-y-4">
          <Input
            label="Nombre del Rol"
            placeholder="Ej. Secretaria"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Descripción (Opcional)"
            placeholder="Descripción del rol..."
            value={description}
            onChangeText={setDescription}
          />

          <Button
            title="Crear Rol"
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
