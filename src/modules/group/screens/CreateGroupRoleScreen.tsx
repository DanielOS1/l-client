import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Alert, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { groupService } from "../services/group.service";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { Check, ShieldAlert, ShieldCheck, Shield } from "lucide-react-native";
import Toast from 'react-native-toast-message';

export function CreateGroupRoleScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { activeGroup, getGroupDetails } = useGroupStore();
  const { user } = useAuthStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<string>("10"); // Default MEMBER level
  const [isLoading, setIsLoading] = useState(false);

  // Find current user's role level
  const currentUserGroup = activeGroup?.userGroups?.find(
    (ug) => ug.user.id === user?.id
  );
  const myLevel = currentUserGroup?.groupRole?.level || 0;

  const roleOptions = [
    { label: "Administrador", value: ROLE_LEVELS.ADMIN, icon: ShieldAlert, color: "#ef4444", description: "Gestión completa del grupo (Nivel 50)" },
    { label: "Moderador", value: 30, icon: ShieldCheck, color: "#f59e0b", description: "Gestión de contenido y miembros (Nivel 30)" },
    { label: "Miembro", value: ROLE_LEVELS.MEMBER, icon: Shield, color: "#3b82f6", description: "Acceso básico (Nivel 10)" },
  ];



  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "El nombre del rol es obligatorio"
      });
      return;
    }

    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "El nivel debe ser un número"
      });
      return;
    }

    if (levelNum >= myLevel) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `No puedes crear un rol con nivel igual o superior al tuyo (${myLevel})`
      });
      return;
    }

    setIsLoading(true);
    try {
      await groupService.createRole({
        groupId,
        name,
        description,
        level: levelNum
      });
      // Refresh group details to show new role
      await getGroupDetails(groupId);

      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: "Rol creado correctamente"
      });

      navigation.goBack();
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e.response?.data?.message || "Error al crear rol"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-slate-900 mb-2">
          Nuevo Rol
        </Text>
        <Text className="text-slate-500 mb-6">
          Tu nivel de autoridad: {myLevel}
        </Text>

        <View className="space-y-4">
          <Input
            label="Nombre del Rol"
            placeholder="Ej. Moderador"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Descripción (Opcional)"
            placeholder="Descripción del rol..."
            value={description}
            onChangeText={setDescription}
          />

          <View>
            <Text className="text-sm font-medium text-slate-700 mb-2">Nivel de Autoridad</Text>
            <View className="flex-row flex-wrap gap-2">
              {roleOptions.map((option) => {
                const isDisabled = option.value >= myLevel;
                const isSelected = parseInt(level) === option.value;
                const Icon = option.icon;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => !isDisabled && setLevel(option.value.toString())}
                    className={`p-3 rounded-xl border flex-row items-center flex-1 min-w-[45%] ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'} ${isDisabled ? 'opacity-50' : ''}`}
                    disabled={isDisabled}
                  >
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-2`} style={{ backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9' }}>
                      <Icon size={16} color={isSelected ? '#2563EB' : '#64748b'} />
                    </View>
                    <View>
                      <Text className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{option.label}</Text>
                      <Text className="text-xs text-slate-400">Nivel {option.value}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Text className="text-xs text-slate-500 mt-2 italic">
              * Solo puedes crear roles con nivel inferior a {myLevel}.
            </Text>
          </View>

          <View className="mt-2">
            <Input
              label="Nivel Personalizado"
              placeholder="1-99"
              value={level}
              onChangeText={setLevel}
              keyboardType="numeric"
            />
          </View>

          <Button
            title="Crear Rol"
            onPress={handleCreate}
            isLoading={isLoading}
            className="mt-4"
          />

          <Button
            title="Cancelar"
            variant="ghost"
            onPress={() => navigation.goBack()}
            className="mt-2"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
