import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { Button } from "../../../components/Button";
import { Plus, Users, ChevronRight } from "lucide-react-native";

export function GroupsListScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { groups, fetchUserGroups, isLoading, setActiveGroup } =
    useGroupStore();

  useEffect(() => {
    if (user?.id) {
      fetchUserGroups(user.id);
    }
  }, [user]);

  const handleGroupPress = (group: any) => {
    setActiveGroup(group);
    navigation.navigate("GroupDetail", { groupId: group.id });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleGroupPress(item)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-slate-800">{item.name}</Text>
        {item.description && (
          <Text className="text-slate-500 text-sm mt-1">
            {item.description}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-900">
              Mis Grupos
            </Text>
            <Text className="text-slate-500">Hola, {user?.firstName}</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="bg-slate-200 p-2 rounded-full"
          >
            <Users size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {groups.length === 0 && !isLoading ? (
          <View className="items-center justify-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
            <Text className="text-slate-500 mb-4 text-center">
              No estás en ningún grupo aún.
            </Text>
            <Button
              title="Crear Nuevo Grupo"
              onPress={() => navigation.navigate("CreateGroup")}
              className="w-full max-w-[200px]"
            />
          </View>
        ) : (
          <FlatList
            data={groups}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => user?.id && fetchUserGroups(user.id)}
              />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            ListFooterComponent={
              <Button
                title="Crear Nuevo Grupo"
                onPress={() => navigation.navigate("CreateGroup")}
                className="mt-4"
                icon={<Plus size={20} color="white" />}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
