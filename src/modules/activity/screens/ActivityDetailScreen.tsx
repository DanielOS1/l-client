import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { Button } from "../../../components/Button";
import { MapPin, Calendar, Users, DollarSign, Plus, Trash2, X, UserPlus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityPosition } from "../../../types/operations.types";
import { useAuthStore } from "../../../store/useAuthStore";
import { ROLE_LEVELS } from "../../../constants/role-levels";

export function ActivityDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { activityId } = route.params;
  const { activeActivity, getActivityDetails, isLoading, assignMember, removeAssignment } = useActivityStore();
  const { activeGroup } = useGroupStore();
  const { user } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<ActivityPosition | null>(null);

  // Permission check
  const currentUserGroup = activeGroup?.userGroups?.find(
    (ug) => ug.user.id === user?.id
  );
  const myLevel = currentUserGroup?.groupRole?.level || 0;
  const canManage = myLevel >= ROLE_LEVELS.ADMIN;

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

  // Helper to calculate progress
  const totalPositions = activeActivity.activityPositions?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  const filledPositions = activeActivity.assignments?.length || 0;
  const progress = totalPositions > 0 ? filledPositions / totalPositions : 0;

  const handleOpenAssignModal = (position: ActivityPosition) => {
    setSelectedPosition(position);
    setModalVisible(true);
  };

  const handleAssign = async (userId: string) => {
    if (!selectedPosition) return;
    try {
      await assignMember(activeActivity.id, selectedPosition.position!.id, userId);
      setModalVisible(false);
      setSelectedPosition(null);
    } catch (error) {
      Alert.alert("Error", "No se pudo asignar el miembro.");
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de quitar esta asignación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar", style: "destructive", onPress: async () => {
            try {
              await removeAssignment(assignmentId, activeActivity.id);
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la asignación.");
            }
          }
        }
      ]
    );
  };

  // Filter users not already assigned to THIS activity (or maybe strictly this position? Usually one role per activity)
  // Let's assume one user can only have one role per activity for simplicity, or we check if they are already assigned to *any* position in this activity.
  const availableUsers = activeGroup?.userGroups?.filter(ug =>
    !activeActivity.assignments?.some(a => a.user.id === ug.user.id)
  ) || [];

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

          {/* Progress Section */}
          <View className="mt-6">
            <View className="flex-row justify-between mb-2">
              <Text className="font-bold text-slate-700">Progreso de Asignación</Text>
              <Text className="text-slate-500">{filledPositions}/{totalPositions}</Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </View>
          </View>
        </View>

        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-slate-800 mb-3">Cargos y Asignaciones</Text>
          {activeActivity.activityPositions && activeActivity.activityPositions.length > 0 ? (
            activeActivity.activityPositions.map((ap) => {
              const assignmentsForPos = activeActivity.assignments?.filter(a => a.position.id === ap.position?.id) || [];
              const assignedCount = assignmentsForPos.length;
              const isFull = assignedCount >= ap.quantity;

              return (
                <View key={ap.id} className="bg-white p-4 rounded-xl mb-3 border border-slate-100 shadow-sm">
                  <View className="flex-row justify-between items-center mb-3">
                    <View>
                      <Text className="font-bold text-slate-800 text-base">{ap.position?.name}</Text>
                      <Text className="text-xs text-slate-500">{assignedCount} / {ap.quantity} ocupados</Text>
                    </View>
                    {canManage && !isFull && (
                      <TouchableOpacity
                        onPress={() => handleOpenAssignModal(ap)}
                        className="bg-blue-50 px-3 py-2 rounded-lg flex-row items-center"
                      >
                        <UserPlus size={16} color="#2563EB" className="mr-1" />
                        <Text className="text-blue-700 font-bold text-xs">Asignar</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* List of assigned users */}
                  {assignmentsForPos.length > 0 ? (
                    <View className="space-y-2">
                      {assignmentsForPos.map(assignment => (
                        <View key={assignment.id} className="flex-row items-center justify-between bg-slate-50 p-2 rounded-lg">
                          <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-blue-200 rounded-full items-center justify-center mr-2">
                              <Text className="text-blue-800 font-bold text-xs">
                                {assignment.user.firstName?.charAt(0) || "U"}
                                {assignment.user.lastName?.charAt(0) || ""}
                              </Text>
                            </View>
                            <Text className="text-slate-700 font-medium">
                              {assignment.user.firstName} {assignment.user.lastName}
                            </Text>
                          </View>
                          {canManage && (
                            <TouchableOpacity onPress={() => handleRemoveAssignment(assignment.id)}>
                              <Trash2 size={16} color="#ef4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-slate-400 text-xs italic">Sin asignaciones</Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text className="text-slate-400 italic">No se han definido cargos para esta actividad.</Text>
          )}
        </View>

        <View className="p-4 flex-row gap-3">
          <View className="flex-1 bg-white p-4 rounded-xl border border-slate-100 items-center">
            <Users size={24} color="#2563EB" className="mb-2" />
            <Text className="text-slate-500 text-xs font-bold uppercase">
              Asistentes
            </Text>
            <Text className="text-slate-900 text-2xl font-bold mt-1">{activeActivity.assignments?.length || 0}</Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-xl border border-slate-100 items-center">
            <DollarSign size={24} color="#16a34a" className="mb-2" />
            <Text className="text-slate-500 text-xs font-bold uppercase">
              Recaudado
            </Text>
            <Text className="text-slate-900 text-2xl font-bold mt-1">$0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Assignment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-[70%]">
            <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-slate-800">
                Asignar a {selectedPosition?.position?.name}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {availableUsers.length === 0 ? (
              <View className="flex-1 items-center justify-center p-8">
                <Text className="text-slate-500 text-center">No hay miembros disponibles para asignar o todos ya tienen una asignación.</Text>
              </View>
            ) : (
              <FlatList
                data={availableUsers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleAssign(item.user.id)}
                    className="flex-row items-center p-4 bg-slate-50 mb-3 rounded-xl border border-slate-100"
                  >
                    <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-indigo-700 font-bold">
                        {item.user.firstName?.charAt(0)}
                        {item.user.lastName?.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-bold text-slate-800 text-base">
                        {item.user.firstName} {item.user.lastName}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {item.user.email}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
