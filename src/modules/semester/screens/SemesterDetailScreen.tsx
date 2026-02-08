import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSemesterStore } from "../../../store/useSemesterStore";
import { Button } from "../../../components/Button";
import { SemesterAgenda } from "../components/SemesterAgenda";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { Settings, Plus, Users, Calendar as CalendarIcon } from "lucide-react-native";

export function SemesterDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { semesterId } = route.params;
  const { activeSemester, getSemesterDetails, isLoading } = useSemesterStore();
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();

  // Permission check
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
        <Button
          title="Volver"
          onPress={() => navigation.goBack()}
          variant="ghost"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView>
        <View className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm mb-4">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-3xl font-bold text-slate-900 mb-2">
                {activeSemester.name}
              </Text>
              <Text className="text-slate-500">
                {new Date(activeSemester.startDate).toLocaleDateString()} -{" "}
                {new Date(activeSemester.endDate).toLocaleDateString()}
              </Text>
            </View>
            {/* Status Badge */}
            <View className={`px-3 py-1 rounded-full ${activeSemester.isActive ? 'bg-green-100' : 'bg-slate-100'}`}>
              <Text className={`text-xs font-bold ${activeSemester.isActive ? 'text-green-700' : 'text-slate-500'}`}>
                {activeSemester.isActive ? 'Activo' : 'Finalizado'}
              </Text>
            </View>
          </View>

          <View className="flex-row mt-4">
            {/* Future: Activity Stats */}
            <View className="bg-blue-50 px-4 py-2 rounded-lg mr-2">
              <Text className="text-blue-700 font-bold">{activeSemester.activities?.length || 0} Actividades</Text>
            </View>
          </View>

          {/* Administration Section */}
          {canManage && (
            <View className="mt-6 pt-4 border-t border-slate-100">
              <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Administración</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => navigation.navigate("CreateActivity", { semesterId: activeSemester.id })}
                  className="bg-blue-50 px-4 py-3 rounded-xl flex-row items-center"
                >
                  <Plus size={18} color="#2563EB" className="mr-2" />
                  <Text className="text-blue-700 font-bold">Nueva Actividad</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ManagePositions", { semesterId: activeSemester.id })}
                  className="bg-indigo-50 px-4 py-3 rounded-xl flex-row items-center"
                >
                  <Users size={18} color="#4f46e5" className="mr-2" />
                  <Text className="text-indigo-700 font-bold">Cargos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => Alert.alert("Próximamente", "Editar Semestre")}
                  className="bg-slate-50 px-4 py-3 rounded-xl flex-row items-center"
                >
                  <Settings size={18} color="#64748b" className="mr-2" />
                  <Text className="text-slate-600 font-bold">Ajustes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View className="flex-1 min-h-[500px]">
          <SemesterAgenda
            semesterId={activeSemester.id}
            startDate={activeSemester.startDate}
            endDate={activeSemester.endDate}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
