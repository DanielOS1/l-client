import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSemesterStore } from "../../../store/useSemesterStore";
import { Button } from "../../../components/Button";
import { Plus, Calendar, ChevronRight } from "lucide-react-native";

export function SemestersListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { semesters, fetchGroupSemesters, isLoading, setActiveSemester } =
    useSemesterStore();

  useEffect(() => {
    if (groupId) {
      fetchGroupSemesters(groupId);
    }
  }, [groupId]);

  const handleSemanticPress = (semester: any) => {
    setActiveSemester(semester);
    navigation.navigate("SemesterDetail", { semesterId: semester.id });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleSemanticPress(item)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
        <View className="flex-row items-center mt-1">
          <Calendar size={14} color="#64748b" />
          <Text className="text-slate-500 text-sm ml-1">
            {new Date(item.startDate).toLocaleDateString()} -{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
        {item.isActive && (
          <Text className="text-green-600 text-xs font-bold mt-2">ACTIVO</Text>
        )}
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-slate-900">Semestres</Text>
          <Button
            title="Nuevo"
            onPress={() => navigation.navigate("CreateSemester", { groupId })}
            variant="ghost"
            className="h-10 px-3"
            icon={<Plus size={20} color="#2563EB" />}
          />
        </View>

        {semesters.length === 0 && !isLoading ? (
          <View className="items-center justify-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
            <Text className="text-slate-500 mb-4 text-center">
              No hay semestres registrados.
            </Text>
            <Button
              title="Crear Primer Semestre"
              onPress={() => navigation.navigate("CreateSemester", { groupId })}
              className="w-full max-w-[200px]"
            />
          </View>
        ) : (
          <FlatList
            data={semesters}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => fetchGroupSemesters(groupId)}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
