import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSemesterStore } from "../../../store/useSemesterStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { SafeAreaView } from "react-native-safe-area-context";

export function CreateSemesterScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { createSemester, isLoading } = useSemesterStore();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(""); // Simple string YYYY-MM-DD for now
  const [endDate, setEndDate] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !startDate.trim() || !endDate.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      await createSemester(groupId, name, startDate, endDate);
      Alert.alert("Éxito", "Semestre creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Error al crear semestre"
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-slate-900 mb-6">
          Nuevo Semestre
        </Text>

        <View className="space-y-4">
          <Input
            label="Nombre del Semestre"
            placeholder="Ej. Otoño 2024"
            value={name}
            onChangeText={setName}
          />

          <DatePicker
            label="Fecha Inicio"
            value={startDate}
            onDateSelect={setStartDate}
            placeholder="Seleccionar inicio"
          />

          <DatePicker
            label="Fecha Fin"
            value={endDate}
            onDateSelect={setEndDate}
            placeholder="Seleccionar fin"
            minDate={startDate}
          />

          <Button
            title="Crear Semestre"
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
