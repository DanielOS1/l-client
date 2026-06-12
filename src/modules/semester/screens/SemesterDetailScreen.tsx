import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSemesterStore } from "../../../store/useSemesterStore";
import { useActivityStore } from "../../../store/useActivityStore";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { DatePicker } from "../../../components/DatePicker";
import { SemesterAgenda } from "../components/SemesterAgenda";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { Settings, Plus, Users, Pencil, X, ChevronLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";

export function SemesterDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { semesterId } = route.params;
  const {
    activeSemester,
    getSemesterDetails,
    deleteSemester,
    updateSemester,
    isLoading,
  } = useSemesterStore();
  const { activities } = useActivityStore();
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentUserGroup = activeGroup?.userGroups?.find(
    (ug) => ug.user.id === user?.id
  );
  const myLevel = currentUserGroup?.groupRole?.level || 0;
  const canManage = myLevel >= ROLE_LEVELS.ADMIN;

  useEffect(() => {
    if (semesterId) {
      getSemesterDetails(semesterId);
    }
  }, [semesterId]);

  const openEditModal = () => {
    if (!activeSemester) return;
    setEditName(activeSemester.name);
    setEditStartDate(activeSemester.startDate.split("T")[0]);
    setEditEndDate(activeSemester.endDate.split("T")[0]);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editStartDate || !editEndDate) {
      Toast.show({ type: "error", text1: "Todos los campos son obligatorios" });
      return;
    }
    setIsSaving(true);
    try {
      await updateSemester(activeSemester!.id, activeGroup!.id, {
        name: editName.trim(),
        startDate: editStartDate,
        endDate: editEndDate,
      });
      setEditModalVisible(false);
      Toast.show({ type: "success", text1: "Semestre actualizado" });
    } catch {
      Toast.show({ type: "error", text1: "No se pudo actualizar el semestre" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSemester = () => {
    Alert.alert(
      "Eliminar Semestre",
      `¿Eliminar "${activeSemester?.name}"? Se eliminarán también sus actividades y asignaciones.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSemester(activeSemester!.id, activeGroup!.id);
              navigation.goBack();
            } catch {
              Alert.alert("Error", "No se pudo eliminar el semestre.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + (dateStr.includes("T") ? "" : "T12:00:00")).toLocaleDateString("es-CL");

  if (!activeSemester && isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!activeSemester) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Semestre no encontrado</Text>
        <Button title="Volver" onPress={() => navigation.goBack()} variant="ghost" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView>
        <View className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm mb-4">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-4 self-start p-1 -ml-1"
          >
            <ChevronLeft size={24} color="#64748b" />
          </TouchableOpacity>

          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-3">
              <Text className="text-3xl font-bold text-slate-900 mb-2">
                {activeSemester.name}
              </Text>
              <Text className="text-slate-500">
                {formatDate(activeSemester.startDate)} —{" "}
                {formatDate(activeSemester.endDate)}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${activeSemester.isActive ? "bg-green-100" : "bg-slate-100"}`}>
              <Text className={`text-xs font-bold ${activeSemester.isActive ? "text-green-700" : "text-slate-500"}`}>
                {activeSemester.isActive ? "Activo" : "Finalizado"}
              </Text>
            </View>
          </View>

          <View className="flex-row mt-4">
            <View className="bg-brand-teal-light px-4 py-2 rounded-lg mr-2">
              <Text className="text-brand-teal-dark font-bold">
                {activities.length} Actividades
              </Text>
            </View>
          </View>

          {canManage && (
            <View className="mt-6 pt-4 border-t border-slate-100">
              <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                Administración
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CreateActivity", {
                      semesterId: activeSemester.id,
                    })
                  }
                  className="bg-brand-teal-light px-4 py-3 rounded-xl flex-row items-center"
                >
                  <Plus size={18} color="#3AC4BE" />
                  <Text className="text-brand-teal font-bold ml-1">
                    Nueva Actividad
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ManagePositions", {
                      semesterId: activeSemester.id,
                    })
                  }
                  className="bg-indigo-50 px-4 py-3 rounded-xl flex-row items-center"
                >
                  <Users size={18} color="#4f46e5" />
                  <Text className="text-indigo-700 font-bold ml-1">Cargos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openEditModal}
                  className="bg-amber-50 px-4 py-3 rounded-xl flex-row items-center"
                >
                  <Pencil size={18} color="#d97706" />
                  <Text className="text-amber-700 font-bold ml-1">Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDeleteSemester}
                  className="bg-red-50 px-4 py-3 rounded-xl flex-row items-center"
                >
                  <Settings size={18} color="#ef4444" />
                  <Text className="text-red-600 font-bold ml-1">Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View className="flex-1 min-h-[500px]">
          <SemesterAgenda
            semesterId={activeSemester.id}
            startDate={activeSemester.startDate.split("T")[0]}
            endDate={activeSemester.endDate.split("T")[0]}
          />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-slate-900">
                  Editar Semestre
                </Text>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  className="p-2 bg-slate-100 rounded-full"
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Input
                label="Nombre"
                value={editName}
                onChangeText={setEditName}
                containerClassName="mb-4"
              />

              <DatePicker
                label="Fecha de inicio"
                value={editStartDate}
                onDateSelect={setEditStartDate}
              />

              <DatePicker
                label="Fecha de término"
                value={editEndDate}
                onDateSelect={setEditEndDate}
                minDate={editStartDate}
              />

              <Button
                title="Guardar Cambios"
                onPress={handleSaveEdit}
                isLoading={isSaving}
                className="mt-4"
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
