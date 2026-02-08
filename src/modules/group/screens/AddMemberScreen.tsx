import React, { useState } from "react";
import { View, Text, SafeAreaView, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../store/useAuthStore";
import { groupService } from "../services/group.service";
import { useGroupStore } from "../../../store/useGroupStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Search, UserPlus } from "lucide-react-native";
import Toast from 'react-native-toast-message';

export function AddMemberScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { user } = useAuthStore();
  const { getGroupDetails } = useGroupStore();

  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);



  const handleSearch = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setFoundUser(null);
    try {
      const result = await groupService.searchUserByEmail(
        email.toLowerCase().trim()
      );
      setFoundUser(result);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'No encontrado',
        text2: 'No existe un usuario con ese correo electrónico.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser || !user) return;
    setIsAdding(true);
    try {
      await groupService.addMember(groupId, foundUser.id, user.id);

      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: `${foundUser.firstName} ha sido agregado al grupo.`
      });

      await getGroupDetails(groupId); // Refresh group details
      navigation.goBack();
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e.response?.data?.message || "Error al agregar miembro."
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-slate-900 mb-6">
          Agregar Miembro
        </Text>

        <View className="flex-row items-end gap-2 mb-6">
          <View className="flex-1">
            <Input
              label="Correo Electrónico"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <Button
            title=""
            icon={<Search size={20} color="white" />}
            onPress={handleSearch}
            isLoading={isLoading}
            className="mb-[2px] h-[50px] w-[50px] p-0"
          />
        </View>

        {foundUser && (
          <View className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <Text className="text-slate-500 mb-1">Usuario encontrado:</Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-slate-800">
                  {foundUser.firstName} {foundUser.lastName}
                </Text>
                <Text className="text-slate-400">{foundUser.email}</Text>
              </View>
              <Button
                title="Agregar"
                onPress={handleAddMember}
                isLoading={isAdding}
                icon={<UserPlus size={18} color="white" />}
                className="h-10 px-4"
              // textClassName="text-sm"
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
