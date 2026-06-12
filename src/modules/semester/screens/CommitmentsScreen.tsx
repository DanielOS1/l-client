import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../store/useAuthStore";
import { assignmentService } from "../../activity/services/assignment.service";
import { Assignment } from "../../../types/operations.types";
import { CalendarClock, MapPin, Briefcase, ChevronRight } from "lucide-react-native";

// The backend returns activity.semester in assignments by user
interface AssignmentWithSemester extends Assignment {
  activity?: Assignment["activity"] & { semester?: { name: string } };
}

export function CommitmentsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<AssignmentWithSemester[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssignments = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await assignmentService.getByUser(user.id);
      // Sort by activity date ascending (upcoming first)
      const sorted = [...data].sort((a, b) => {
        const dateA = a.activity?.date ? new Date(a.activity.date).getTime() : 0;
        const dateB = b.activity?.date ? new Date(b.activity.date).getTime() : 0;
        return dateA - dateB;
      });
      setAssignments(sorted);
    } catch {
      // silently fail — user may have no assignments
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssignments();
    }, [user?.id])
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const isPast = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const renderItem = ({ item }: { item: AssignmentWithSemester }) => {
    const past = isPast(item.activity?.date);
    return (
      <TouchableOpacity
        onPress={() =>
          item.activity?.id &&
          navigation.navigate("TabActivities", {
            screen: "ActivityDetail",
            params: { activityId: item.activity.id },
          })
        }
        className={`bg-white p-4 rounded-xl mb-3 border-l-4 shadow-sm ${
          past ? "border-l-slate-300" : "border-l-brand-teal"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text
              className={`font-bold text-base mb-1 ${
                past ? "text-slate-400" : "text-slate-800"
              }`}
            >
              {item.activity?.name || "Actividad"}
            </Text>

            <View className="flex-row items-center mb-1">
              <Briefcase size={13} color="#64748b" />
              <Text className="text-slate-500 text-sm ml-1">
                {item.position?.name || "Sin cargo"}
              </Text>
            </View>

            {item.activity?.date && (
              <View className="flex-row items-center mb-1">
                <CalendarClock size={13} color="#64748b" />
                <Text className="text-slate-500 text-sm ml-1">
                  {formatDate(item.activity.date)}
                </Text>
              </View>
            )}

            {(item.activity as any)?.semester?.name && (
              <View className="flex-row items-center">
                <MapPin size={13} color="#64748b" />
                <Text className="text-slate-400 text-xs ml-1">
                  {(item.activity as any).semester.name}
                </Text>
              </View>
            )}
          </View>

          <View className="items-end">
            {past ? (
              <View className="bg-slate-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-slate-400 font-medium">Pasado</Text>
              </View>
            ) : (
              <View className="bg-brand-teal-light px-2 py-1 rounded-full">
                <Text className="text-xs text-brand-teal font-medium">Próximo</Text>
              </View>
            )}
            <ChevronRight size={16} color="#cbd5e1" style={{ marginTop: 8 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-slate-900">Mis Compromisos</Text>
        <Text className="text-slate-500 text-sm">Actividades en las que estás asignado</Text>
      </View>

      <FlatList
        data={assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchAssignments} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-16">
              <CalendarClock size={48} color="#cbd5e1" />
              <Text className="text-slate-400 text-center mt-4 text-base font-medium">
                Sin compromisos asignados
              </Text>
              <Text className="text-slate-300 text-center mt-1 text-sm">
                Cuando un admin te asigne a una actividad, aparecerá aquí.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
