import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { Plus, LogOut, ChevronRight, Users, Calendar, Shield, Bell } from "lucide-react-native";
import { AppLogo } from "../../../components/AppLogo";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { useNotificationStore } from "../../../store/useNotificationStore";
import { useNoticeStore } from "../../../store/useNoticeStore";

function GroupCard({
  group,
  userId,
  onPress,
}: {
  group: any;
  userId?: string;
  onPress: () => void;
}) {
  const userGroup = group.userGroups?.find(
    (ug: any) => ug.user?.id === userId
  );
  const roleName = userGroup?.groupRole?.name;
  const roleLevel = userGroup?.groupRole?.level ?? 0;

  const roleColor =
    roleLevel >= ROLE_LEVELS.OWNER
      ? { bg: "#FFF3CC", text: "#B45309", border: "#FFC200" }
      : roleLevel >= ROLE_LEVELS.ADMIN
      ? { bg: "#e0f7f6", text: "#2ba9a3", border: "#3AC4BE" }
      : { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" };

  const memberCount = group.userGroups?.length;
  const semesterCount = group.semesters?.length;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: roleColor.border,
      }}
    >
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {group.name}
            </Text>
            {group.description ? (
              <Text
                style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}
                numberOfLines={2}
              >
                {group.description}
              </Text>
            ) : null}
          </View>
          <ChevronRight size={20} color="#94a3b8" />
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {memberCount != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Users size={13} color="#94a3b8" />
              <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                {memberCount} miembro{memberCount !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {semesterCount != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Calendar size={13} color="#94a3b8" />
              <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                {semesterCount} semestre{semesterCount !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {roleName && (
            <View
              style={{
                backgroundColor: roleColor.bg,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 99,
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                marginLeft: "auto",
              }}
            >
              <Shield size={11} color={roleColor.text} />
              <Text
                style={{ fontSize: 11, color: roleColor.text, fontWeight: "600" }}
              >
                {roleName}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function GroupsListScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { groups, fetchUserGroups, isLoading, setActiveGroup } = useGroupStore();
  const { unreadCount: notifCount, checkForNewAssignments } = useNotificationStore();
  const { checkForNewNotices } = useNoticeStore();

  useEffect(() => {
    if (user?.id) {
      fetchUserGroups(user.id);
      checkForNewAssignments(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (groups.length === 0) return;
    const checkAll = async () => {
      for (const group of groups) {
        await checkForNewNotices(group.id);
      }
    };
    checkAll();
  }, [groups]);

  const handleGroupPress = (group: any) => {
    setActiveGroup(group);
    navigation.navigate("GroupTabs", { groupId: group.id });
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: logout },
      ]
    );
  };

  const initials =
    `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => user?.id && fetchUserGroups(user.id)}
            tintColor="#3AC4BE"
          />
        }
      >
        {/* Top bar with logo + user actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: "white",
            borderBottomWidth: 1,
            borderBottomColor: "#f1f5f9",
          }}
        >
          <AppLogo iconSize={36} showText={true} layout="row" />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Bell — local notification inbox */}
            <TouchableOpacity
              onPress={() => navigation.navigate("NotificationsInbox")}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
            >
              <Bell size={18} color="#475569" />
              {notifCount > 0 && (
                <View style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>{notifCount > 9 ? "9+" : notifCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("UserProfile")}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#e0f7f6", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#3AC4BE", fontWeight: "700", fontSize: 13 }}>
                {initials}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
            >
              <LogOut size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome banner */}
        <View
          style={{
            margin: 16,
            borderRadius: 20,
            backgroundColor: "#3AC4BE",
            padding: 20,
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <View
            style={{
              position: "absolute",
              right: -20,
              top: -20,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 40,
              bottom: -30,
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />

          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            Bienvenido de vuelta
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "800",
              marginTop: 2,
              marginBottom: 10,
            }}
          >
            {user?.firstName} {user?.lastName}
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 10,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Users size={14} color="white" />
              <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
                {groups.length} grupo{groups.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Groups section */}
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "700", color: "#0f172a" }}
            >
              Mis Grupos
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateGroup")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#e0f7f6",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 99,
                gap: 4,
              }}
            >
              <Plus size={14} color="#3AC4BE" />
              <Text
                style={{ color: "#3AC4BE", fontSize: 13, fontWeight: "700" }}
              >
                Nuevo
              </Text>
            </TouchableOpacity>
          </View>

          {groups.length === 0 && !isLoading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
                backgroundColor: "white",
                borderRadius: 16,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: "#cbd5e1",
              }}
            >
              <Users size={40} color="#cbd5e1" />
              <Text
                style={{
                  color: "#94a3b8",
                  marginTop: 12,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Sin grupos aún
              </Text>
              <Text
                style={{
                  color: "#cbd5e1",
                  marginTop: 4,
                  fontSize: 13,
                  textAlign: "center",
                  paddingHorizontal: 32,
                }}
              >
                Crea tu primera organización o pide a un administrador que te agregue.
              </Text>
            </View>
          ) : (
            groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                userId={user?.id}
                onPress={() => handleGroupPress(group)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
