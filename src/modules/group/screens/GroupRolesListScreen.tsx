import React, { useEffect, useState } from "react";
import { View, ScrollView, RefreshControl, TouchableOpacity, Modal, Alert, FlatList } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Avatar, FAB, Divider, IconButton } from "react-native-paper";
import { Shield, ShieldAlert, ShieldCheck, ChevronLeft, X } from "lucide-react-native";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { GroupRole, UserGroup } from "../../../types/group.types";

export function GroupRolesListScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { groupId } = route.params;
    const { activeGroup, getGroupDetails, assignRole, removeMember, isLoading } = useGroupStore();
    const { user } = useAuthStore();

    const [selectedMember, setSelectedMember] = useState<UserGroup | null>(null);
    const [rolePickerVisible, setRolePickerVisible] = useState(false);

    useEffect(() => {
        if (groupId) getGroupDetails(groupId);
    }, [groupId]);

    const currentUserGroup = activeGroup?.userGroups?.find(ug => ug.user.id === user?.id);
    const myLevel = currentUserGroup?.groupRole?.level || 0;
    const canManage = myLevel >= ROLE_LEVELS.ADMIN;

    const sortedRoles = activeGroup?.roles
        ? [...activeGroup.roles].sort((a, b) => b.level - a.level)
        : [];

    // Roles assignable by the current user (only roles with level < myLevel)
    const assignableRoles = sortedRoles.filter(r => r.level < myLevel);

    const getMembersForRole = (roleId: string) =>
        activeGroup?.userGroups?.filter(ug => ug.groupRole?.id === roleId) || [];

    const getRoleIcon = (level: number) => {
        if (level >= ROLE_LEVELS.OWNER) return <ShieldAlert size={24} color="#ef4444" />;
        if (level >= ROLE_LEVELS.ADMIN) return <ShieldCheck size={24} color="#f59e0b" />;
        return <Shield size={24} color="#3b82f6" />;
    };

    const getRoleBgColor = (level: number) => {
        if (level >= ROLE_LEVELS.OWNER) return "#FEF2F2";
        if (level >= ROLE_LEVELS.ADMIN) return "#FFFBEB";
        return "#EFF6FF";
    };

    const handleMemberPress = (member: UserGroup) => {
        if (!canManage) return;
        // Can't manage members with same or higher level
        if ((member.groupRole?.level || 0) >= myLevel) return;
        setSelectedMember(member);
        Alert.alert(
            `${member.user.firstName} ${member.user.lastName}`,
            `Rol actual: ${member.groupRole?.name || "Sin rol"}`,
            [
                { text: "Cancelar", style: "cancel", onPress: () => setSelectedMember(null) },
                {
                    text: "Cambiar Rol",
                    onPress: () => setRolePickerVisible(true),
                },
                {
                    text: "Remover del Grupo",
                    style: "destructive",
                    onPress: () => confirmRemove(member),
                },
            ]
        );
    };

    const confirmRemove = (member: UserGroup) => {
        Alert.alert(
            "Remover Miembro",
            `¿Remover a ${member.user.firstName} ${member.user.lastName} del grupo?`,
            [
                { text: "Cancelar", style: "cancel", onPress: () => setSelectedMember(null) },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeMember(groupId, member.user.id);
                            setSelectedMember(null);
                        } catch (error: any) {
                            Alert.alert("Error", error.response?.data?.message || "No se pudo remover al miembro.");
                            setSelectedMember(null);
                        }
                    },
                },
            ]
        );
    };

    const handleAssignRole = async (role: GroupRole) => {
        if (!selectedMember) return;
        setRolePickerVisible(false);
        try {
            await assignRole(groupId, selectedMember.user.id, role.id);
            setSelectedMember(null);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "No se pudo asignar el rol.");
            setSelectedMember(null);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-100 shadow-sm z-10">
                <IconButton
                    icon={() => <ChevronLeft size={24} color="#1e293b" />}
                    onPress={() => navigation.goBack()}
                    size={24}
                />
                <Text variant="titleMedium" style={{ fontWeight: "bold", marginLeft: 8, flex: 1 }}>
                    Roles del Grupo
                </Text>
            </View>

            {canManage && (
                <View className="px-4 py-2 bg-brand-teal-light border-b border-brand-teal/20">
                    <Text className="text-xs text-brand-teal">
                        Toca a un miembro para cambiar su rol o removerlo del grupo.
                    </Text>
                </View>
            )}

            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => getGroupDetails(groupId)} />
                }
            >
                {sortedRoles.map((role) => {
                    const members = getMembersForRole(role.id);
                    return (
                        <Card key={role.id} style={{ marginBottom: 16, backgroundColor: "white" }} mode="elevated">
                            <Card.Title
                                title={role.name}
                                subtitle={`Nivel ${role.level}`}
                                left={() => (
                                    <View style={{
                                        backgroundColor: getRoleBgColor(role.level),
                                        width: 40, height: 40, borderRadius: 20,
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        {getRoleIcon(role.level)}
                                    </View>
                                )}
                                right={() =>
                                    role.isSystem ? (
                                        <View style={{ marginRight: 16, backgroundColor: "#e2e8f0", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                                            <Text variant="labelSmall" style={{ color: "#64748b" }}>Sistema</Text>
                                        </View>
                                    ) : null
                                }
                            />
                            <Card.Content>
                                {role.description ? (
                                    <Text variant="bodySmall" style={{ color: "#64748b", marginBottom: 12 }}>
                                        {role.description}
                                    </Text>
                                ) : null}
                                <Divider style={{ marginVertical: 8 }} />
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                                    {members.length > 0 ? members.map((member) => {
                                        const isManageable = canManage && (member.groupRole?.level || 0) < myLevel;
                                        return (
                                            <TouchableOpacity
                                                key={member.id}
                                                onPress={() => handleMemberPress(member)}
                                                style={{
                                                    flexDirection: "row", alignItems: "center",
                                                    backgroundColor: isManageable ? "#f1f5f9" : "#f8fafc",
                                                    borderRadius: 20, paddingRight: 12, paddingLeft: 4,
                                                    paddingVertical: 4,
                                                    borderWidth: isManageable ? 1 : 0,
                                                    borderColor: "#e2e8f0",
                                                }}
                                            >
                                                <Avatar.Text
                                                    size={24}
                                                    label={member.user.firstName?.substring(0, 2).toUpperCase() || "U"}
                                                    style={{ backgroundColor: isManageable ? "#93c5fd" : "#cbd5e1" }}
                                                    color="#fff"
                                                />
                                                <Text variant="labelSmall" style={{ marginLeft: 8, color: "#334155" }}>
                                                    {member.user.firstName} {member.user.lastName}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }) : (
                                        <Text variant="bodySmall" style={{ color: "#94a3b8", fontStyle: "italic" }}>
                                            Sin miembros asignados
                                        </Text>
                                    )}
                                </View>
                            </Card.Content>
                        </Card>
                    );
                })}
            </ScrollView>

            <FAB
                icon="plus"
                label="Nuevo Rol"
                style={{ position: "absolute", margin: 16, right: 0, bottom: 0, backgroundColor: "#3AC4BE" }}
                color="white"
                onPress={() => navigation.navigate("CreateGroupRole", { groupId })}
            />

            {/* Role Picker Modal */}
            <Modal
                visible={rolePickerVisible}
                animationType="slide"
                transparent
                onRequestClose={() => { setRolePickerVisible(false); setSelectedMember(null); }}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-slate-800">
                                Asignar Rol a {selectedMember?.user.firstName}
                            </Text>
                            <TouchableOpacity
                                onPress={() => { setRolePickerVisible(false); setSelectedMember(null); }}
                                className="p-2 bg-slate-100 rounded-full"
                            >
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={assignableRoles}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleAssignRole(item)}
                                    className="flex-row items-center p-4 bg-slate-50 mb-3 rounded-xl border border-slate-100"
                                >
                                    <View style={{
                                        backgroundColor: getRoleBgColor(item.level),
                                        width: 36, height: 36, borderRadius: 18,
                                        alignItems: "center", justifyContent: "center", marginRight: 12,
                                    }}>
                                        {getRoleIcon(item.level)}
                                    </View>
                                    <View>
                                        <Text className="font-bold text-slate-800">{item.name}</Text>
                                        <Text className="text-xs text-slate-500">Nivel {item.level}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text className="text-center text-slate-400 py-4">
                                    No hay roles disponibles para asignar.
                                </Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
