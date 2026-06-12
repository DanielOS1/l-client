import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { ChevronLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";

export function EditActivityScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { activityId, semesterId } = route.params;
  const { activeActivity, getActivityDetails, updateActivity, isLoading } =
    useActivityStore();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (activityId && !activeActivity) {
      getActivityDetails(activityId);
    }
  }, [activityId]);

  useEffect(() => {
    if (activeActivity && !initialized) {
      setName(activeActivity.name || "");
      const dateOnly = activeActivity.date
        ? activeActivity.date.split("T")[0]
        : "";
      setDate(dateOnly);
      setLocation(activeActivity.location || "");
      setDescription(activeActivity.description || "");
      setInitialized(true);
    }
  }, [activeActivity]);

  const handleSave = async () => {
    if (!name.trim() || !date || !location.trim()) {
      Toast.show({
        type: "error",
        text1: "Nombre, fecha y ubicación son obligatorios",
      });
      return;
    }

    try {
      await updateActivity(activityId, semesterId, {
        name: name.trim(),
        date,
        location: location.trim(),
        description: description.trim() || undefined,
      });
      Toast.show({ type: "success", text1: "Actividad actualizada" });
      navigation.goBack();
    } catch {
      Toast.show({ type: "error", text1: "No se pudo actualizar la actividad" });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 mr-2">
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Editar Actividad</Text>
      </View>

      <ScrollView className="p-6">
        <View className="space-y-4 pb-20">
          <Input
            label="Nombre de la Actividad"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Bingo Bailable"
          />

          <DatePicker
            label="Fecha"
            value={date}
            onDateSelect={setDate}
            placeholder="Seleccionar fecha"
          />

          <Input
            label="Ubicación"
            value={location}
            onChangeText={setLocation}
            placeholder="Ej. Sede Social"
          />

          <Input
            label="Descripción (Opcional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Detalles sobre el evento..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Guardar Cambios"
            onPress={handleSave}
            isLoading={isLoading}
            className="mt-6"
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
