import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../components/Button";
import {
  Users,
  Calendar,
  ChevronLeft,
  Target,
  Clock,
  LogOut,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "react-native-paper";
import { goalService, Goal } from "../../finance/services/goal.service";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { UpcomingActivities } from "../components/UpcomingActivities";

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  color = "#3AC4BE",
  bgColor = "#DBEAFE",
}: {
  icon: any;
  label: string;
  value: string;
  color?: string;
  bgColor?: string;
}) => (
  <Card style={{ flex: 1, margin: 6, backgroundColor: "white", borderRadius: 16 }} mode="elevated">
    <Card.Content className="p-4 flex-col justify-between h-32">
      <View
        style={{ backgroundColor: bgColor }}
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
      >
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text className="text-2xl font-bold text-slate-800">{value}</Text>
        <Text className="text-slate-500 text-xs mt-1">{label}</Text>
      </View>
    </Card.Content>
  </Card>
);

export function GroupDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId } = route.params;
  const { activeGroup, getGroupDetails, removeMember, isLoading } = useGroupStore();
  const { user } = useAuthStore();
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  // Find current user's role level
  const currentUserGroup = activeGroup?.userGroups?.find(
    (ug) => ug.user.id === user?.id
  );
  const myLevel = currentUserGroup?.groupRole?.level || 0;
  const canManageMembers = myLevel >= ROLE_LEVELS.ADMIN;

  useEffect(() => {
    if (groupId) {
      getGroupDetails(groupId);
      fetchActiveGoal();
    }
  }, [groupId]);

  const fetchActiveGoal = async () => {
    try {
      const goal = await goalService.getActiveGoal(groupId);
      setActiveGoal(goal);
    } catch (error) {
      console.log("No active goal or error fetching", error);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Salirse del Grupo",
      `¿Seguro que quieres salir de "${activeGroup?.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember(groupId, user!.id);
              navigation.navigate("GroupsList");
            } catch {
              Alert.alert("Error", "No se pudo salir del grupo.");
            }
          },
        },
      ]
    );
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.navigate("GroupsList")}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-bold text-slate-900">{activeGroup.name}</Text>
          <Text className="text-slate-400 text-xs">{activeGroup.description || "Sin descripción"}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              getGroupDetails(groupId);
              fetchActiveGoal();
            }}
          />
        }
      >
        <View className="p-4">
          {/* Grid de Resumen */}
          <View className="flex-row flex-wrap">
            <View className="w-1/2 p-1">
              <SummaryCard
                icon={Calendar}
                value={activeGroup.semesters?.length?.toString() || "0"}
                label="Semestres"
                color="#3AC4BE"
                bgColor="#d0f5f3"
              />
            </View>
            <View className="w-1/2 p-1">
              <SummaryCard
                icon={Users}
                value={activeGroup.userGroups?.length?.toString() || "0"}
                label="Miembros"
                color="#059669"
                bgColor="#D1FAE5"
              />
            </View>
            <View className="w-1/2 p-1">
              <SummaryCard
                icon={Target}
                value={activeGoal ? formatCurrency(activeGoal.targetAmount) : "Sin Meta"}
                label="Meta Activa"
                color="#D97706"
                bgColor="#FEF3C7"
              />
            </View>
            <View className="w-1/2 p-1">
              <SummaryCard
                icon={Clock}
                value="..."
                label="Próximamente"
                color="#64748b"
                bgColor="#f1f5f9"
              />
            </View>
          </View>

          {/* Upcoming Activities Section */}
          <UpcomingActivities groupId={groupId} />

          {canManageMembers && (
            <View className="mt-8 px-2 space-y-6">
              <View>
                <Text className="text-lg font-bold text-slate-800 mb-3">Administración</Text>
                <View className="flex-row gap-2 flex-wrap">
                  <Button
                    title="Roles"
                    variant="secondary"
                    className="flex-1 min-w-[45%]"
                    onPress={() => navigation.navigate("GroupRolesList", { groupId })}
                  />
                  <Button
                    title="Semestres"
                    variant="secondary"
                    className="flex-1 min-w-[45%]"
                    onPress={() => navigation.navigate("TabActivities")}
                  />
                  <Button
                    title="Agregar Miembro"
                    variant="primary"
                    className="w-full mt-2"
                    onPress={() => navigation.navigate("AddMember", { groupId })}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Leave group (for non-admin members only) */}
          {!canManageMembers && (
            <View className="mt-8 px-2">
              <TouchableOpacity
                onPress={handleLeaveGroup}
                className="flex-row items-center justify-center py-3 border border-red-200 rounded-xl bg-red-50"
              >
                <LogOut size={18} color="#ef4444" />
                <Text className="text-red-600 font-bold ml-2">Salirse del Grupo</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
