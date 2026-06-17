import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSemesterStore } from "../../../store/useSemesterStore";
import { Calendar, ChevronRight, Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { ROLE_LEVELS } from "../../../constants/role-levels";

function formatDate(str: string) {
  return new Date(str + (str.includes("T") ? "" : "T12:00:00")).toLocaleDateString("es-CL");
}

export function SemestersListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { semesters, fetchGroupSemesters, isLoading, setActiveSemester } = useSemesterStore();
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();

  const myLevel = activeGroup?.userGroups?.find(ug => ug.user.id === user?.id)?.groupRole?.level || 0;
  const canManage = myLevel >= ROLE_LEVELS.ADMIN;

  useEffect(() => {
    if (groupId) fetchGroupSemesters(groupId);
  }, [groupId]);

  const handlePress = (semester: any) => {
    setActiveSemester(semester);
    navigation.navigate("SemesterDetail", { semesterId: semester.id });
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Semestres</Text>
        {canManage && (
          <TouchableOpacity
            style={s.newBtn}
            onPress={() => navigation.navigate("CreateSemester", { groupId })}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#fff" />
            <Text style={s.newBtnText}>Nuevo</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={semesters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchGroupSemesters(groupId)}
          />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Calendar size={36} color="#cbd5e1" />
            </View>
            <Text style={s.emptyTitle}>Sin semestres</Text>
            <Text style={s.emptySub}>Crea el primer semestre para organizar las actividades del grupo.</Text>
            {canManage && (
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate("CreateSemester", { groupId })}
              >
                <Plus size={14} color="#3AC4BE" />
                <Text style={s.emptyBtnText}>Crear primer semestre</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            style={s.semCard}
            activeOpacity={0.75}
          >
            {/* Left accent by status */}
            <View style={[s.semAccent, { backgroundColor: item.isActive ? "#3AC4BE" : "#cbd5e1" }]} />

            <View style={[s.semIconWrap, { backgroundColor: item.isActive ? "#e0f7f6" : "#f1f5f9" }]}>
              <Calendar size={20} color={item.isActive ? "#3AC4BE" : "#94a3b8"} />
            </View>

            <View style={s.semInfo}>
              <View style={s.semNameRow}>
                <Text style={s.semName}>{item.name}</Text>
                {item.isActive && (
                  <View style={s.activeBadge}>
                    <Text style={s.activeBadgeText}>Activo</Text>
                  </View>
                )}
              </View>
              <Text style={s.semDates}>
                {formatDate(item.startDate)} — {formatDate(item.endDate)}
              </Text>
            </View>

            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  newBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#3AC4BE", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
  },
  newBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  semCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#ffffff", borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    overflow: "hidden",
  },
  semAccent: { width: 4, alignSelf: "stretch" },
  semIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    margin: 14, marginRight: 10,
  },
  semInfo: { flex: 1, paddingVertical: 14 },
  semNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  semName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  semDates: { fontSize: 12, color: "#94a3b8" },
  activeBadge: { backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  activeBadgeText: { fontSize: 10, fontWeight: "800", color: "#16a34a" },

  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#334155" },
  emptySub: { fontSize: 13, color: "#94a3b8", textAlign: "center", paddingHorizontal: 40, lineHeight: 18 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#e0f7f6", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, marginTop: 8,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: "#3AC4BE" },
});
