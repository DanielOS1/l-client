import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { Button } from "../../../components/Button";
import { MapPin, Calendar, Users, DollarSign } from "lucide-react-native";

export function ActivityDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { activityId } = route.params;
  const { activeActivity, getActivityDetails, isLoading } = useActivityStore();

  useEffect(() => {
    if (activityId) {
      getActivityDetails(activityId);
    }
  }, [activityId]);

  if (!activeActivity && isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!activeActivity) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Actividad no encontrada</Text>
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
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => getActivityDetails(activityId)}
          />
        }
      >
        <View className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm mb-4">
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            {activeActivity.name}
          </Text>

          <View className="space-y-2 mt-2">
            <View className="flex-row items-center gap-2">
              <Calendar size={18} color="#64748b" />
              <Text className="text-slate-600 text-base">
                {new Date(activeActivity.date).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <MapPin size={18} color="#64748b" />
              <Text className="text-slate-600 text-base">
                {activeActivity.location}
              </Text>
            </View>
          </View>

          {activeActivity.description && (
            <Text className="text-slate-500 mt-4 leading-6">
              {activeActivity.description}
            </Text>
          )}
        </View>

        <View className="p-4 flex-row gap-3">
          <View className="flex-1 bg-white p-4 rounded-xl border border-slate-100 items-center">
            <Users size={24} color="#2563EB" className="mb-2" />
            <Text className="text-slate-500 text-xs font-bold uppercase">
              Asistentes
            </Text>
            <Text className="text-slate-900 text-2xl font-bold mt-1">0</Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-xl border border-slate-100 items-center">
            <DollarSign size={24} color="#16a34a" className="mb-2" />
            <Text className="text-slate-500 text-xs font-bold uppercase">
              Recaudado
            </Text>
            <Text className="text-slate-900 text-2xl font-bold mt-1">$0</Text>
          </View>
        </View>

        <View className="p-6">
          <Text className="text-center text-slate-400 mt-4">
            Próximamente: Asignación de Cargos y Recaudación
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
