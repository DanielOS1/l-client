import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Users,
  Calendar,
  ChevronLeft,
  Target,
  ChevronRight,
  UserPlus,
  Shield,
  LogOut,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { goalService, Goal } from "../../finance/services/goal.service";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { UpcomingActivities } from "../components/UpcomingActivities";
import { ConfirmModal } from "../../../components/ConfirmModal";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  onPress,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={[s.statCard, onPress && s.statCardTappable]}>
      <View style={[s.statIconWrap, { backgroundColor: bgColor }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {onPress && (
        <View style={[s.statArrow, { backgroundColor: bgColor }]}>
          <ChevronRight size={12} color={color} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={{ flex: 1 }} onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={{ flex: 1 }}>{content}</View>;
}

// ─── Admin menu item ──────────────────────────────────────────────────────────

function AdminItem({
  icon: Icon,
  label,
  description,
  color,
  bgColor,
  onPress,
}: {
  icon: any;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.adminItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.adminIconWrap, { backgroundColor: bgColor }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={s.adminItemText}>
        <Text style={s.adminItemLabel}>{label}</Text>
        <Text style={s.adminItemDesc}>{description}</Text>
      </View>
      <ChevronRight size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function GroupDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId } = route.params;
  const { activeGroup, getGroupDetails, removeMember, isLoading } = useGroupStore();
  const { user } = useAuthStore();
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);

  const currentUserGroup = activeGroup?.userGroups?.find(ug => ug.user.id === user?.id);
  const myLevel = currentUserGroup?.groupRole?.level || 0;
  const canManageActivities = myLevel >= ROLE_LEVELS.ADMIN;
  const canManageRoles      = myLevel >= ROLE_LEVELS.MANAGER;
  const canAddMembers        = myLevel >= ROLE_LEVELS.MANAGER;
  const isFounder            = myLevel >= ROLE_LEVELS.FOUNDER;

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
    } catch {
      // No active goal
    }
  };

  const handleLeaveGroup = async () => {
    setLeaveConfirmVisible(false);
    try {
      await removeMember(groupId, user!.id);
      navigation.navigate("GroupsList");
    } catch {
      // Error handled by store
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);

  if (!activeGroup && isLoading) {
    return (
      <SafeAreaView style={s.centered}>
        <Text style={s.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!activeGroup) {
    return (
      <SafeAreaView style={s.centered}>
        <Text style={s.loadingText}>Grupo no encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.ghostBtn}>
          <Text style={s.ghostBtnText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const hasAdminActions = canManageActivities || canManageRoles || canAddMembers;

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.navigate("GroupsList")} style={s.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{activeGroup.name}</Text>
          {activeGroup.description ? (
            <Text style={s.headerSub} numberOfLines={1}>{activeGroup.description}</Text>
          ) : null}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { getGroupDetails(groupId); fetchActiveGoal(); }}
          />
        }
      >
        {/* ─── Stats grid ─── */}
        <View style={s.statsSection}>
          <View style={s.statsRow}>
            <StatCard
              icon={Calendar}
              value={activeGroup.semesters?.length?.toString() || "0"}
              label="Semestres"
              color="#3AC4BE"
              bgColor="#e0f7f6"
              onPress={() => navigation.navigate("TabActivities")}
            />
            <StatCard
              icon={Users}
              value={activeGroup.userGroups?.length?.toString() || "0"}
              label="Miembros"
              color="#059669"
              bgColor="#D1FAE5"
              onPress={() => navigation.navigate("GroupRolesList", { groupId })}
            />
          </View>
          <View style={s.statsRow}>
            <StatCard
              icon={Target}
              value={activeGoal ? formatCurrency(activeGoal.targetAmount) : "Sin meta"}
              label="Meta activa"
              color="#D97706"
              bgColor="#FEF3C7"
            />
            <StatCard
              icon={Calendar}
              value="—"
              label="Próximamente"
              color="#8b5cf6"
              bgColor="#EDE9FE"
            />
          </View>
        </View>

        {/* ─── Upcoming activities ─── */}
        <UpcomingActivities groupId={groupId} />

        {/* ─── Admin section ─── */}
        {hasAdminActions && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Administración</Text>
            <View style={s.adminCard}>
              {canManageRoles && (
                <AdminItem
                  icon={Shield}
                  label="Miembros y Roles"
                  description="Gestiona miembros y asigna roles"
                  color="#8b5cf6"
                  bgColor="#F5F3FF"
                  onPress={() => navigation.navigate("GroupRolesList", { groupId })}
                />
              )}
              {canManageActivities && (
                <>
                  {canManageRoles && <View style={s.itemDivider} />}
                  <AdminItem
                    icon={Calendar}
                    label="Semestres"
                    description="Gestiona semestres y actividades"
                    color="#3AC4BE"
                    bgColor="#e0f7f6"
                    onPress={() => navigation.navigate("TabActivities")}
                  />
                </>
              )}
              {canAddMembers && (
                <>
                  {(canManageRoles || canManageActivities) && <View style={s.itemDivider} />}
                  <AdminItem
                    icon={UserPlus}
                    label="Agregar Miembro"
                    description="Invita a alguien al grupo"
                    color="#059669"
                    bgColor="#D1FAE5"
                    onPress={() => navigation.navigate("AddMember", { groupId })}
                  />
                </>
              )}
            </View>
          </View>
        )}

        {/* ─── Leave group ─── */}
        {!isFounder && (
          <View style={s.section}>
            <TouchableOpacity
              onPress={() => setLeaveConfirmVisible(true)}
              style={s.leaveBtn}
              activeOpacity={0.8}
            >
              <LogOut size={18} color="#ef4444" />
              <Text style={s.leaveBtnText}>Salirse del Grupo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={leaveConfirmVisible}
        title="Salirse del grupo"
        message={`¿Seguro que quieres salir de "${activeGroup.name}"?`}
        confirmLabel="Salir"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleLeaveGroup}
        onCancel={() => setLeaveConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#64748b", fontSize: 16 },
  ghostBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 20 },
  ghostBtnText: { color: "#3AC4BE", fontWeight: "700" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  headerSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },

  statsSection: { padding: 16, gap: 10 },
  statsRow: { flexDirection: "row", gap: 10 },

  statCard: {
    backgroundColor: "#ffffff", borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    minHeight: 110, justifyContent: "space-between",
  },
  statCardTappable: { borderColor: "#e2e8f0" },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  statLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  statArrow: {
    position: "absolute", top: 12, right: 12,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },

  section: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },

  adminCard: {
    backgroundColor: "#ffffff", borderRadius: 20,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    overflow: "hidden",
  },
  adminItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  adminIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center", marginRight: 14,
  },
  adminItemText: { flex: 1 },
  adminItemLabel: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  adminItemDesc: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  itemDivider: { height: 1, backgroundColor: "#f8fafc", marginHorizontal: 16 },

  leaveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14,
    borderRadius: 16, borderWidth: 1, borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
  },
  leaveBtnText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});
