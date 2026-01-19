import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { Button } from "../../../components/Button";
import {
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
} from "lucide-react-native";

interface ActivitiesListProps {
  semesterId: string;
}

export function ActivitiesList({ semesterId }: ActivitiesListProps) {
  const navigation = useNavigation<any>();
  const { activities, fetchSemesterActivities, isLoading, setActiveActivity } =
    useActivityStore();

  useEffect(() => {
    if (semesterId) {
      fetchSemesterActivities(semesterId);
    }
  }, [semesterId]);

  const handlePress = (activity: any) => {
    setActiveActivity(activity);
    navigation.navigate("ActivityDetail", { activityId: activity.id });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handlePress(item)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
        <View className="flex-row items-center mt-1 gap-3">
          <View className="flex-row items-center">
            <Calendar size={12} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1">
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={12} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1">{item.location}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-xl font-bold text-slate-900">Actividades</Text>
        <Button
          title="Nueva"
          onPress={() => navigation.navigate("CreateActivity", { semesterId })}
          variant="ghost"
          className="h-9 px-3"
          icon={<Plus size={18} color="#2563EB" />}
        />
      </View>

      {activities.length === 0 && !isLoading ? (
        <View className="items-center justify-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 mx-2">
          <Text className="text-slate-400 mb-2">No hay actividades aún.</Text>
          <Button
            title="Crear Primera Actividad"
            onPress={() =>
              navigation.navigate("CreateActivity", { semesterId })
            }
            className="h-10 px-4"
            // textClassName="text-sm"
          />
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Since clear it will be inside a ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
