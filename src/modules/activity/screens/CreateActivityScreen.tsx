import React, { useState } from "react";
import { View, Text, SafeAreaView, Alert, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";

export function CreateActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { semesterId } = route.params;
  const { createActivity, isLoading } = useActivityStore();

  const [name, setName] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !date.trim() || !location.trim()) {
      Alert.alert("Error", "Nombre, Fecha y Ubicación son obligatorios");
      return;
    }

    try {
      await createActivity(semesterId, name, date, location, description);
      Alert.alert("Éxito", "Actividad creada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Error al crear actividad"
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-6">
        <Text className="text-2xl font-bold text-slate-900 mb-6">
          Nueva Actividad
        </Text>

        <View className="space-y-4 pb-20">
          <Input
            label="Nombre de la Actividad"
            placeholder="Ej. Bingo Bailable"
            value={name}
            onChangeText={setName}
          />

          <DatePicker
            label="Fecha"
            value={date}
            onDateSelect={setDate}
            placeholder="Seleccionar fecha"
          />

          <Input
            label="Ubicación"
            placeholder="Ej. Sede Social"
            value={location}
            onChangeText={setLocation}
          />

          <Input
            label="Descripción (Opcional)"
            placeholder="Detalles sobre el evento..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Crear Actividad"
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
      </ScrollView>
    </SafeAreaView>
  );
}
