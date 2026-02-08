import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { positionService } from "../../semester/services/position.service";
import { Position } from "../../../types/operations.types";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { Plus, Trash2, Users } from "lucide-react-native";
import Toast from "react-native-toast-message";

export function CreateActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { semesterId } = route.params;
  const { createActivity, isLoading } = useActivityStore();

  const [name, setName] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Positions Logic
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<{ positionId: string; quantity: number; name: string }[]>([]);
  const [showPositionSelector, setShowPositionSelector] = useState(false);

  useEffect(() => {
    loadPositions();
  }, [semesterId]);

  const loadPositions = async () => {
    try {
      const positions = await positionService.getBySemesterId(semesterId);
      setAvailablePositions(positions);
    } catch (error) {
      console.log("Error loading positions", error);
    }
  };

  const addPosition = (position: Position) => {
    // Check if already added
    if (selectedPositions.find(p => p.positionId === position.id)) {
      Toast.show({ type: "info", text1: "Este cargo ya está agregado" });
      return;
    }
    setSelectedPositions([...selectedPositions, { positionId: position.id, quantity: 1, name: position.name }]);
    setShowPositionSelector(false);
  };

  const removePosition = (positionId: string) => {
    setSelectedPositions(selectedPositions.filter(p => p.positionId !== positionId));
  };

  const updateQuantity = (positionId: string, quantity: string) => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) return;

    setSelectedPositions(selectedPositions.map(p =>
      p.positionId === positionId ? { ...p, quantity: qty } : p
    ));
  };

  const handleCreate = async () => {
    if (!name.trim() || !date.trim() || !location.trim()) {
      Alert.alert("Error", "Nombre, Fecha y Ubicación son obligatorios");
      return;
    }

    try {
      const positionsPayload = selectedPositions.map(p => ({
        positionId: p.positionId,
        quantity: p.quantity
      }));

      await createActivity(semesterId, name, date, location, description, positionsPayload);
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

          {/* Positions Section */}
          <View>
            <Text className="text-base font-bold text-slate-700 mb-2">Cargos Requeridos</Text>

            {selectedPositions.map((sp) => (
              <View key={sp.positionId} className="flex-row items-center justify-between bg-slate-50 p-3 rounded-lg mb-2 border border-slate-200">
                <Text className="font-bold text-slate-700 flex-1">{sp.name}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-slate-500 text-xs">Cant:</Text>
                  <Input
                    value={sp.quantity.toString()}
                    onChangeText={(t) => updateQuantity(sp.positionId, t)}
                    keyboardType="numeric"
                    containerClassName="w-16 mb-0"
                    className="h-8 py-0 text-center"
                  />
                  <TouchableOpacity onPress={() => removePosition(sp.positionId)}>
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setShowPositionSelector(!showPositionSelector)}
              className="flex-row items-center justify-center py-3 border border-dashed border-blue-300 rounded-lg bg-blue-50 mt-2"
            >
              <Plus size={20} color="#2563EB" className="mr-2" />
              <Text className="text-blue-600 font-bold">Agregar Cargo</Text>
            </TouchableOpacity>

            {/* Simple Dropdown/List for selection */}
            {showPositionSelector && (
              <View className="mt-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {availablePositions.length === 0 ? (
                  <Text className="p-4 text-center text-slate-400">No hay cargos disponibles en el semestre.</Text>
                ) : (
                  availablePositions.map(pos => (
                    <TouchableOpacity
                      key={pos.id}
                      className="p-3 border-b border-slate-100 flex-row items-center"
                      onPress={() => addPosition(pos)}
                    >
                      <Users size={16} color="#64748b" className="mr-2" />
                      <Text className="text-slate-700">{pos.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          <Button
            title="Crear Actividad"
            onPress={handleCreate}
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
