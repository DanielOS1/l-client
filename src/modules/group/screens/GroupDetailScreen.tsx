import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { Button } from "../../../components/Button";
import { Users, Shield, UserPlus } from "lucide-react-native";

export function GroupDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId } = route.params;
  const { activeGroup, getGroupDetails, isLoading } = useGroupStore();

  useEffect(() => {
    if (groupId) {
      getGroupDetails(groupId);
    }
  }, [groupId]);

  const handleCreateRole = () => {
    navigation.navigate("CreateGroupRole", { groupId });
  };

  if (!activeGroup && isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!activeGroup) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Grupo no encontrado</Text>
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
            onRefresh={() => getGroupDetails(groupId)}
          />
        }
      >
        <View className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm mb-4">
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            {activeGroup.name}
          </Text>
          {activeGroup.description && (
            <Text className="text-slate-500 text-base">
              {activeGroup.description}
            </Text>
          )}
        </View>

        <View className="px-4 space-y-6 pb-20">
          {/* Roles Section */}
          <View>
            <View className="flex-row justify-between items-center mb-3 px-2">
              <View className="flex-row items-center gap-2">
                <Shield size={20} color="#64748b" />
                <Text className="text-lg font-bold text-slate-800">Roles</Text>
              </View>
              <Button
                title="Nuevo Rol"
                onPress={handleCreateRole}
                variant="ghost"
                className="h-8 px-2"
                // textClassName="text-sm" // Need to support this in Button or use style
              />
            </View>

            {activeGroup.roles?.map((role) => (
              <View
                key={role.id}
                className="bg-white p-4 rounded-xl mb-2 flex-row justify-between items-center border border-slate-100"
              >
                <View>
                  <Text className="font-bold text-slate-800">{role.name}</Text>
                  {role.description && (
                    <Text className="text-slate-400 text-xs">
                      {role.description}
                    </Text>
                  )}
                </View>
                {role.isDefault && (
                  <View className="bg-blue-100 px-2 py-1 rounded">
                    <Text className="text-blue-700 text-xs font-bold">
                      Default
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Members Section */}
          <View>
            <View className="flex-row justify-between items-center mb-3 px-2">
              <View className="flex-row items-center gap-2">
                <Users size={20} color="#64748b" />
                <Text className="text-lg font-bold text-slate-800">
                  Miembros
                </Text>
              </View>
              <Button
                title="Agregar"
                onPress={() => navigation.navigate("AddMember", { groupId })}
                variant="ghost"
                className="h-8 px-2"
                icon={<UserPlus size={16} color="#2563EB" />}
              />
            </View>
            {activeGroup.userGroups?.map((ug) => (
              <View
                key={ug.id}
                className="bg-white p-4 rounded-xl mb-2 flex-row items-center border border-slate-100"
              >
                <View className="h-10 w-10 bg-slate-200 rounded-full items-center justify-center mr-3">
                  <Text className="font-bold text-slate-500">
                    {ug.user.firstName?.[0]}
                    {ug.user.lastName?.[0]}
                  </Text>
                </View>
                <View>
                  <Text className="font-bold text-slate-800">
                    {ug.user.firstName} {ug.user.lastName}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {ug.groupRole?.name || "Sin rol"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Fab or Bottom Bar could go here */}
    </SafeAreaView>
  );
}
