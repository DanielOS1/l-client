import React, { useEffect } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Avatar, FAB, Badge, Divider, IconButton } from "react-native-paper";
import { Shield, ShieldAlert, ShieldCheck, ChevronLeft } from "lucide-react-native";
import { ROLE_LEVELS } from "../../../constants/role-levels";

export function GroupRolesListScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { groupId } = route.params;
    const { activeGroup, getGroupDetails, isLoading } = useGroupStore();

    useEffect(() => {
        if (groupId) getGroupDetails(groupId);
    }, [groupId]);

    // Sort roles by level descending
    const sortedRoles = activeGroup?.roles ? [...activeGroup.roles].sort((a, b) => b.level - a.level) : [];

    // Get members for each role
    const getMembersForRole = (roleId: string) => {
        return activeGroup?.userGroups?.filter((ug) => ug.groupRole?.id === roleId) || [];
    };

    const getRoleIcon = (level: number) => {
        if (level >= ROLE_LEVELS.OWNER) return <ShieldAlert size={24} color="#ef4444" />;
        if (level >= ROLE_LEVELS.ADMIN) return <ShieldCheck size={24} color="#f59e0b" />;
        return <Shield size={24} color="#3b82f6" />;
    };

    const getRoleColor = (level: number) => {
        if (level >= ROLE_LEVELS.OWNER) return "#FEF2F2"; // red-50
        if (level >= ROLE_LEVELS.ADMIN) return "#FFFBEB"; // amber-50
        return "#EFF6FF"; // blue-50
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-100 shadow-sm z-10">
                <IconButton
                    icon={() => <ChevronLeft size={24} color="#1e293b" />}
                    onPress={() => navigation.goBack()}
                    size={24}
                />
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 8, flex: 1 }}>Roles del Grupo</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        enabled={true}
                        onRefresh={() => getGroupDetails(groupId)}
                    />
                }
            >
                {sortedRoles.map((role) => {
                    const members = getMembersForRole(role.id);
                    const bgColor = getRoleColor(role.level);

                    return (
                        <Card key={role.id} style={{ marginBottom: 16, backgroundColor: 'white' }} mode="elevated">
                            <Card.Title
                                title={role.name}
                                subtitle={`Nivel ${role.level}`}
                                left={(props) => (
                                    <View style={{ backgroundColor: bgColor, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        {getRoleIcon(role.level)}
                                    </View>
                                )}
                                right={(props) => (
                                    role.isSystem ? <View style={{ marginRight: 16, backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}><Text variant="labelSmall" style={{ color: '#64748b' }}>Sistema</Text></View> : null
                                )}
                            />
                            <Card.Content>
                                {role.description ? (
                                    <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 12 }}>{role.description}</Text>
                                ) : null}

                                <Divider style={{ marginVertical: 8 }} />

                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                    {members.length > 0 ? members.map((member) => (
                                        <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 20, paddingRight: 12, paddingLeft: 4, paddingVertical: 4 }}>
                                            <Avatar.Text
                                                size={24}
                                                label={member.user.firstName?.substring(0, 2).toUpperCase() || 'U'}
                                                style={{ backgroundColor: '#cbd5e1' }}
                                                color="#fff"
                                            />
                                            <Text variant="labelSmall" style={{ marginLeft: 8, color: '#334155' }}>
                                                {member.user.firstName}
                                            </Text>
                                        </View>
                                    )) : (
                                        <Text variant="bodySmall" style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin miembros asignados</Text>
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
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#2563EB',
                }}
                color="white"
                onPress={() => navigation.navigate("CreateGroupRole", { groupId })}
            />
        </SafeAreaView>
    );
}
