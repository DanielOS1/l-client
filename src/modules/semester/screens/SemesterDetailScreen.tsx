import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSemesterStore } from "../../../store/useSemesterStore";
import { Button } from "../../../components/Button";
import { SemesterAgenda } from "../components/SemesterAgenda";
import { SafeAreaView } from "react-native-safe-area-context";

export function SemesterDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { semesterId } = route.params;
  const { activeSemester, getSemesterDetails, isLoading } = useSemesterStore();

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
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            {activeSemester.name}
          </Text>
          <Text className="text-slate-500">
            {new Date(activeSemester.startDate).toLocaleDateString()} -{" "}
            {new Date(activeSemester.endDate).toLocaleDateString()}
          </Text>
          <View className="flex-row mt-4">
            {/* Future: Activity Stats */}
            <View className="bg-blue-50 px-4 py-2 rounded-lg mr-2">
              <Text className="text-blue-700 font-bold">0 Actividades</Text>
            </View>
            <View className="bg-green-50 px-4 py-2 rounded-lg">
              <Text className="text-green-700 font-bold">$0 Balance</Text>
            </View>
          </View>
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
