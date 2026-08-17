import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../../../store/useGroupStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  X,
  Crown,
  Plus,
  UserX,
  RefreshCw,
  Users,
} from "lucide-react-native";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { GroupRole, UserGroup } from "../../../types/group.types";
import { groupService } from "../services/group.service";
import { ActionSheet, ActionSheetOption } from "../../../components/ActionSheet";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Pencil, Trash2, RefreshCw as RoleIcon, UserX as RemoveIcon } from "lucide-react-native";
import Toast from "react-native-toast-message";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type LevelColor = {
  icon: string;
  bg: string;
  border: string;
  text: string;
};

function getLevelColor(level: number): LevelColor {
  if (level > ROLE_LEVELS.OWNER)   return { icon: "#FFC200", bg: "#FFFDE7", border: "#FFC200", text: "#78350f" };
  if (level >= ROLE_LEVELS.OWNER)  return { icon: "#ef4444", bg: "#FEF2F2", border: "#fca5a5", text: "#991b1b" };
  if (level >= ROLE_LEVELS.MANAGER)return { icon: "#8b5cf6", bg: "#F5F3FF", border: "#c4b5fd", text: "#5b21b6" };
  if (level >= ROLE_LEVELS.ADMIN)  return { icon: "#f59e0b", bg: "#FFFBEB", border: "#fcd34d", text: "#92400e" };
  if (level >= ROLE_LEVELS.NOTICES)return { icon: "#3AC4BE", bg: "#e0f7f6", border: "#3AC4BE", text: "#0f766e" };
  return                                  { icon: "#3b82f6", bg: "#EFF6FF", border: "#bfdbfe", text: "#1d4ed8" };
}

function getLevelIcon(level: number, size = 18) {
  if (level > ROLE_LEVELS.OWNER)    return <Crown size={size} color="#FFC200" />;
  if (level >= ROLE_LEVELS.OWNER)   return <ShieldAlert size={size} color="#ef4444" />;
  if (level >= ROLE_LEVELS.MANAGER) return <ShieldCheck size={size} color="#8b5cf6" />;
  if (level >= ROLE_LEVELS.ADMIN)   return <ShieldCheck size={size} color="#f59e0b" />;
  return                                    <Shield size={size} color="#3b82f6" />;
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();
}

// ─── Componentes ─────────────────────────────────────────────────────────────

function RoleChip({ name, level }: { name: string; level: number }) {
  const c = getLevelColor(level);
  return (
    <View style={[s.chip, { backgroundColor: c.bg, borderColor: c.border }]}>
      {getLevelIcon(level, 11)}
      <Text style={[s.chipText, { color: c.text }]}>{name}</Text>
    </View>
  );
}

function MemberCard({
  member,
  isManageable,
  isMe,
  onPress,
}: {
  member: UserGroup;
  isManageable: boolean;
  isMe: boolean;
  onPress: () => void;
}) {
  const level = member.groupRole?.level ?? 0;
  const c = getLevelColor(level);
  const initials = getInitials(member.user.firstName, member.user.lastName);

  return (
    <TouchableOpacity
      onPress={isManageable ? onPress : undefined}
      activeOpacity={isManageable ? 0.7 : 1}
      style={[s.memberCard, isManageable && s.memberCardManageable]}
    >
      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: isManageable ? c.bg : "#f1f5f9", borderColor: c.border }]}>
        <Text style={[s.avatarText, { color: isManageable ? c.icon : "#94a3b8" }]}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={s.memberInfo}>
        <View style={s.memberNameRow}>
          <Text style={s.memberName}>
            {member.user.firstName} {member.user.lastName}
          </Text>
          {isMe && (
            <View style={s.meChip}>
              <Text style={s.meChipText}>Tú</Text>
            </View>
          )}
        </View>
        <Text style={s.memberEmail} numberOfLines={1}>{member.user.email}</Text>
      </View>

      {/* Role chip + level */}
      <View style={s.memberRight}>
        {member.groupRole ? (
          <RoleChip name={member.groupRole.name} level={level} />
        ) : (
          <View style={[s.chip, { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" }]}>
            <Text style={[s.chipText, { color: "#94a3b8" }]}>Sin rol</Text>
          </View>
        )}
        <Text style={s.levelLabel}>Nv. {level}</Text>
      </View>
    </TouchableOpacity>
  );
}

function RoleCard({
  role,
  memberCount,
  onPress,
}: {
  role: GroupRole;
  memberCount: number;
  onPress?: () => void;
}) {
  const c = getLevelColor(role.level);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[s.roleCard, { borderLeftColor: c.border }]}
    >
      <View style={[s.roleIconWrap, { backgroundColor: c.bg }]}>
        {getLevelIcon(role.level, 22)}
      </View>
      <View style={s.roleInfo}>
        <View style={s.roleNameRow}>
          <Text style={s.roleName}>{role.name}</Text>
          {role.isSystem && (
            <View style={s.systemChip}>
              <Text style={s.systemChipText}>Sistema</Text>
            </View>
          )}
        </View>
        {role.description ? (
          <Text style={s.roleDescription} numberOfLines={1}>{role.description}</Text>
        ) : null}
        <View style={s.roleMetaRow}>
          <Users size={12} color="#94a3b8" />
          <Text style={s.roleMeta}>
            {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
          </Text>
        </View>
      </View>
      <View style={[s.levelBadge, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Text style={[s.levelBadgeText, { color: c.text }]}>{role.level}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function GroupRolesListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { groupId } = route.params;
  const { activeGroup, getGroupDetails, assignRole, removeMember, isLoading } = useGroupStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"members" | "roles">("members");
  const [selectedMember, setSelectedMember] = useState<UserGroup | null>(null);
  const [selectedRole, setSelectedRole] = useState<GroupRole | null>(null);
  const [rolePickerVisible, setRolePickerVisible] = useState(false);
  const [memberActionVisible, setMemberActionVisible] = useState(false);
  const [roleActionVisible, setRoleActionVisible] = useState(false);
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false);
  const [deleteRoleConfirmVisible, setDeleteRoleConfirmVisible] = useState(false);

  useEffect(() => {
    if (groupId) getGroupDetails(groupId);
  }, [groupId]);

  // ── Permisos ──
  const currentUserGroup = activeGroup?.userGroups?.find(ug => ug.user.id === user?.id);
  const myLevel = currentUserGroup?.groupRole?.level ?? 0;
  const canManageRoles   = myLevel >= ROLE_LEVELS.MANAGER;
  const canRemoveMembers = myLevel >= ROLE_LEVELS.OWNER;

  // ── Datos ──
  const sortedMembers = activeGroup?.userGroups
    ? [...activeGroup.userGroups].sort((a, b) => (b.groupRole?.level ?? 0) - (a.groupRole?.level ?? 0))
    : [];

  const sortedRoles = activeGroup?.roles
    ? [...activeGroup.roles].sort((a, b) => b.level - a.level)
    : [];

  const assignableRoles = sortedRoles.filter(r => r.level < myLevel);

  const getMemberCount = (roleId: string) =>
    activeGroup?.userGroups?.filter(ug => ug.groupRole?.id === roleId).length ?? 0;

  // ── Handlers ──
  const handleMemberPress = (member: UserGroup) => {
    const memberLevel = member.groupRole?.level ?? 0;
    const canInteract = (canManageRoles || canRemoveMembers) && memberLevel < myLevel;
    if (!canInteract) return;
    setSelectedMember(member);
    setMemberActionVisible(true);
  };

  const doRemoveMember = async () => {
    if (!selectedMember) return;
    const memberName = `${selectedMember.user.firstName} ${selectedMember.user.lastName}`;
    setRemoveConfirmVisible(false);
    try {
      await removeMember(groupId, selectedMember.user.id);
      Toast.show({ type: "success", text1: "Miembro removido", text2: `${memberName} ya no pertenece al grupo` });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo remover al miembro",
        text2: e.response?.data?.message || "Ocurrió un error",
      });
    } finally {
      setSelectedMember(null);
    }
  };

  const handleAssignRole = async (role: GroupRole) => {
    if (!selectedMember) return;
    const memberName = `${selectedMember.user.firstName} ${selectedMember.user.lastName}`;
    setRolePickerVisible(false);
    try {
      await assignRole(groupId, selectedMember.user.id, role.id);
      Toast.show({ type: "success", text1: "Rol asignado", text2: `${memberName} ahora es ${role.name}` });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo asignar el rol",
        text2: e.response?.data?.message || "Ocurrió un error",
      });
    } finally {
      setSelectedMember(null);
    }
  };

  const handleRolePress = (role: GroupRole) => {
    if (!canManageRoles || role.level >= myLevel) return;
    setSelectedRole(role);
    setRoleActionVisible(true);
  };

  const doDeleteRole = async () => {
    if (!selectedRole) return;
    const roleName = selectedRole.name;
    setDeleteRoleConfirmVisible(false);
    try {
      await groupService.deleteRole(selectedRole.id);
      await getGroupDetails(groupId);
      Toast.show({ type: "success", text1: "Rol eliminado", text2: `"${roleName}" fue eliminado` });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo eliminar el rol",
        text2: e.response?.data?.message || "Ocurrió un error",
      });
    } finally {
      setSelectedRole(null);
    }
  };

  // ── ActionSheet options ──
  const memberActions: ActionSheetOption[] = [];
  if (canManageRoles) {
    memberActions.push({
      label: "Cambiar Rol",
      icon: <RoleIcon size={20} color="#3AC4BE" />,
      onPress: () => {
        setMemberActionVisible(false);
        setRolePickerVisible(true);
      },
    });
  }
  if (canRemoveMembers) {
    memberActions.push({
      label: "Remover del Grupo",
      icon: <RemoveIcon size={20} color="#ef4444" />,
      variant: "destructive",
      onPress: () => {
        setMemberActionVisible(false);
        setRemoveConfirmVisible(true);
      },
    });
  }

  const roleActions: ActionSheetOption[] = [
    {
      label: "Editar Rol",
      icon: <Pencil size={20} color="#3AC4BE" />,
      onPress: () => {
        if (!selectedRole) return;
        setRoleActionVisible(false);
        navigation.navigate("CreateGroupRole", {
          groupId,
          roleId: selectedRole.id,
          roleName: selectedRole.name,
          roleDescription: selectedRole.description ?? "",
          roleLevel: selectedRole.level,
        });
      },
    },
    {
      label: "Eliminar Rol",
      icon: <Trash2 size={20} color="#ef4444" />,
      variant: "destructive",
      onPress: () => {
        setRoleActionVisible(false);
        setDeleteRoleConfirmVisible(true);
      },
    },
  ];

  // ── Render ──
  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Miembros y Roles</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, activeTab === "members" && s.tabActive]}
          onPress={() => setActiveTab("members")}
        >
          <Text style={[s.tabText, activeTab === "members" && s.tabTextActive]}>
            Miembros ({sortedMembers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === "roles" && s.tabActive]}
          onPress={() => setActiveTab("roles")}
        >
          <Text style={[s.tabText, activeTab === "roles" && s.tabTextActive]}>
            Roles ({sortedRoles.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hint banner */}
      {(canManageRoles || canRemoveMembers) && activeTab === "members" && (
        <View style={s.hint}>
          <Text style={s.hintText}>
            {canRemoveMembers
              ? "Toca un miembro para cambiar su rol o removerlo."
              : "Toca un miembro para cambiar su rol."}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => getGroupDetails(groupId)} />}
      >
        {/* ── MEMBERS TAB ── */}
        {activeTab === "members" && (
          <>
            {sortedMembers.length === 0 ? (
              <View style={s.emptyState}>
                <Users size={40} color="#cbd5e1" />
                <Text style={s.emptyText}>Sin miembros</Text>
              </View>
            ) : (
              sortedMembers.map((member) => {
                const memberLevel = member.groupRole?.level ?? 0;
                const isManageable = (canManageRoles || canRemoveMembers) && memberLevel < myLevel;
                const isMe = member.user.id === user?.id;
                return (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isManageable={isManageable}
                    isMe={isMe}
                    onPress={() => handleMemberPress(member)}
                  />
                );
              })
            )}
          </>
        )}

        {/* ── ROLES TAB ── */}
        {activeTab === "roles" && (
          <>
            {sortedRoles.length === 0 ? (
              <View style={s.emptyState}>
                <Shield size={40} color="#cbd5e1" />
                <Text style={s.emptyText}>Sin roles definidos</Text>
                {canManageRoles && (
                  <TouchableOpacity
                    style={s.emptyAction}
                    onPress={() => navigation.navigate("CreateGroupRole", { groupId })}
                  >
                    <Plus size={14} color="#3AC4BE" />
                    <Text style={s.emptyActionText}>Crear primer rol</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              sortedRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  memberCount={getMemberCount(role.id)}
                  onPress={canManageRoles && role.level < myLevel ? () => handleRolePress(role) : undefined}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* FAB Nuevo Rol — solo en tab Roles y con permisos */}
      {canManageRoles && activeTab === "roles" && (
        <TouchableOpacity
          style={s.fab}
          onPress={() => navigation.navigate("CreateGroupRole", { groupId })}
          activeOpacity={0.85}
        >
          <Plus size={20} color="#fff" />
          <Text style={s.fabText}>Nuevo Rol</Text>
        </TouchableOpacity>
      )}

      {/* Role Picker Modal */}
      <Modal
        visible={rolePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setRolePickerVisible(false); setSelectedMember(null); }}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>Asignar rol</Text>
                <Text style={s.modalSubtitle}>
                  {selectedMember?.user.firstName} {selectedMember?.user.lastName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { setRolePickerVisible(false); setSelectedMember(null); }}
                style={s.modalClose}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={assignableRoles}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              renderItem={({ item }) => {
                const c = getLevelColor(item.level);
                return (
                  <TouchableOpacity
                    onPress={() => handleAssignRole(item)}
                    style={[s.rolePickerItem, { borderColor: c.border }]}
                  >
                    <View style={[s.rolePickerIcon, { backgroundColor: c.bg }]}>
                      {getLevelIcon(item.level, 20)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rolePickerName}>{item.name}</Text>
                      <Text style={s.rolePickerLevel}>Nivel {item.level}</Text>
                    </View>
                    <View style={[s.levelBadge, { backgroundColor: c.bg, borderColor: c.border }]}>
                      <Text style={[s.levelBadgeText, { color: c.text }]}>{item.level}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={s.emptyText}>No hay roles disponibles para asignar.</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Member ActionSheet */}
      <ActionSheet
        visible={memberActionVisible}
        title={selectedMember ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}` : ""}
        subtitle={selectedMember?.groupRole ? `${selectedMember.groupRole.name} · Nv. ${selectedMember.groupRole.level}` : "Sin rol asignado"}
        options={memberActions}
        // Ojo: ActionSheet llama a onClose() justo después de cada opción (ver
        // ActionSheet.tsx), así que NO limpiamos selectedMember aquí — lo
        // necesitan el selector de rol y el modal de confirmación que se abren
        // a continuación. Se limpia en el finally de cada acción.
        onClose={() => setMemberActionVisible(false)}
      />

      {/* Role ActionSheet */}
      <ActionSheet
        visible={roleActionVisible}
        title={selectedRole?.name ?? ""}
        subtitle={selectedRole ? `Nivel ${selectedRole.level}` : undefined}
        options={roleActions}
        // mismo motivo que arriba: no limpiar selectedRole acá, lo necesita
        // el modal de confirmación de eliminación que se abre después
        onClose={() => setRoleActionVisible(false)}
      />

      {/* Remove member confirm */}
      <ConfirmModal
        visible={removeConfirmVisible}
        title="Remover miembro"
        message={`¿Remover a ${selectedMember?.user.firstName} ${selectedMember?.user.lastName} del grupo?`}
        confirmLabel="Remover"
        variant="danger"
        onConfirm={doRemoveMember}
        onCancel={() => { setRemoveConfirmVisible(false); setSelectedMember(null); }}
      />

      {/* Delete role confirm */}
      <ConfirmModal
        visible={deleteRoleConfirmVisible}
        title="Eliminar rol"
        message={`¿Eliminar el rol "${selectedRole?.name}"?\n\nLos miembros con este rol perderán su asignación.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={doDeleteRole}
        onCancel={() => { setDeleteRoleConfirmVisible(false); setSelectedRole(null); }}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: "center",
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#3AC4BE" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  tabTextActive: { color: "#3AC4BE" },

  // Hint
  hint: {
    backgroundColor: "#e0f7f6", paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "#3AC4BE30",
  },
  hintText: { fontSize: 12, color: "#0f766e" },

  // Member card
  memberCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#ffffff", borderRadius: 16,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  memberCardManageable: { borderColor: "#e2e8f0" },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, marginRight: 12,
  },
  avatarText: { fontSize: 15, fontWeight: "700" },
  memberInfo: { flex: 1, marginRight: 10 },
  memberNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  memberName: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  memberEmail: { fontSize: 12, color: "#94a3b8" },
  memberRight: { alignItems: "flex-end", gap: 4 },
  meChip: {
    backgroundColor: "#e0f7f6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  meChipText: { fontSize: 10, fontWeight: "700", color: "#0f766e" },
  levelLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },

  // Role card
  roleCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#ffffff", borderRadius: 16,
    padding: 16, marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  roleIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginRight: 14,
  },
  roleInfo: { flex: 1, marginRight: 10 },
  roleNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  roleName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  roleDescription: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  roleMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  roleMeta: { fontSize: 12, color: "#94a3b8" },
  systemChip: {
    backgroundColor: "#e2e8f0", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  systemChipText: { fontSize: 10, color: "#64748b", fontWeight: "600" },
  levelBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1,
  },
  levelBadgeText: { fontSize: 12, fontWeight: "800" },

  // Chip
  chip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 100, borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: "700" },

  // FAB
  fab: {
    position: "absolute", right: 16, bottom: 24,
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#3AC4BE", paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 100,
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#ffffff", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "70%", paddingTop: 12 },
  modalHandle: { width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  modalSubtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  modalClose: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 20 },
  rolePickerItem: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 14, marginBottom: 10,
    borderWidth: 1.5, backgroundColor: "#fafafa",
  },
  rolePickerIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  rolePickerName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  rolePickerLevel: { fontSize: 12, color: "#64748b", marginTop: 2 },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: "#94a3b8", textAlign: "center" },
  emptyAction: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#e0f7f6", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100,
    marginTop: 4,
  },
  emptyActionText: { fontSize: 13, fontWeight: "700", color: "#3AC4BE" },
});
