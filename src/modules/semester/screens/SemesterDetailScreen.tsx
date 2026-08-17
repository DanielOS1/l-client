import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSemesterStore } from "../../../store/useSemesterStore";
import { useActivityStore } from "../../../store/useActivityStore";
import { Input } from "../../../components/Input";
import { DatePicker } from "../../../components/DatePicker";
import { SemesterAgenda } from "../components/SemesterAgenda";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import {
  Plus,
  Users,
  Pencil,
  X,
  ChevronLeft,
  Trash2,
  Calendar,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { FullScreenLoader } from "../../../components/loading/FullScreenLoader";

function formatDate(str: string) {
  return new Date(str + (str.includes("T") ? "" : "T12:00:00")).toLocaleDateString("es-CL");
}

export function SemesterDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { semesterId } = route.params;
  const { activeSemester, getSemesterDetails, deleteSemester, updateSemester, isLoading } = useSemesterStore();
  const { activities } = useActivityStore();
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const myLevel = activeGroup?.userGroups?.find(ug => ug.user.id === user?.id)?.groupRole?.level || 0;
  const canManage = myLevel >= ROLE_LEVELS.ADMIN;

  useEffect(() => {
    if (semesterId) getSemesterDetails(semesterId);
  }, [semesterId]);

  const openEditModal = () => {
    if (!activeSemester) return;
    setEditName(activeSemester.name);
    setEditStartDate(activeSemester.startDate.split("T")[0]);
    setEditEndDate(activeSemester.endDate.split("T")[0]);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editStartDate || !editEndDate) {
      Toast.show({ type: "error", text1: "Todos los campos son obligatorios" });
      return;
    }
    setIsSaving(true);
    try {
      await updateSemester(activeSemester!.id, activeGroup!.id, {
        name: editName.trim(),
        startDate: editStartDate,
        endDate: editEndDate,
      });
      setEditModalVisible(false);
      Toast.show({ type: "success", text1: "Semestre actualizado" });
    } catch {
      Toast.show({ type: "error", text1: "No se pudo actualizar el semestre" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setDeleteConfirmVisible(false);
    try {
      await deleteSemester(activeSemester!.id, activeGroup!.id);
      navigation.goBack();
    } catch {
      Toast.show({ type: "error", text1: "No se pudo eliminar el semestre" });
    }
  };

  if (!activeSemester && isLoading) {
    return <FullScreenLoader label="Cargando semestre..." />;
  }

  if (!activeSemester) {
    return (
      <SafeAreaView style={s.centered}>
        <Text style={s.loadingText}>Semestre no encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.ghostBtn}>
          <Text style={s.ghostBtnText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Hero header */}
        <View style={s.heroCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={22} color="#64748b" />
          </TouchableOpacity>

          <View style={s.heroContent}>
            <View style={s.heroLeft}>
              <Text style={s.heroName}>{activeSemester.name}</Text>
              <View style={s.heroDateRow}>
                <Calendar size={13} color="#94a3b8" />
                <Text style={s.heroDates}>
                  {formatDate(activeSemester.startDate)} — {formatDate(activeSemester.endDate)}
                </Text>
              </View>
              <View style={s.heroStats}>
                <View style={s.heroStat}>
                  <Text style={s.heroStatVal}>{activities.length}</Text>
                  <Text style={s.heroStatLabel}>Actividades</Text>
                </View>
              </View>
            </View>
            <View style={[s.statusBadge, activeSemester.isActive ? s.statusActive : s.statusInactive]}>
              <Text style={[s.statusText, activeSemester.isActive ? s.statusActiveText : s.statusInactiveText]}>
                {activeSemester.isActive ? "Activo" : "Finalizado"}
              </Text>
            </View>
          </View>

          {canManage && (
            <View style={s.adminRow}>
              <TouchableOpacity
                style={s.adminChip}
                onPress={() => navigation.navigate("CreateActivity", { semesterId: activeSemester.id })}
              >
                <Plus size={15} color="#3AC4BE" />
                <Text style={[s.adminChipText, { color: "#3AC4BE" }]}>Nueva Actividad</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.adminChip, s.adminChipIndigo]}
                onPress={() => navigation.navigate("ManagePositions", { semesterId: activeSemester.id })}
              >
                <Users size={15} color="#4f46e5" />
                <Text style={[s.adminChipText, { color: "#4f46e5" }]}>Cargos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.adminChip, s.adminChipAmber]}
                onPress={openEditModal}
              >
                <Pencil size={15} color="#d97706" />
                <Text style={[s.adminChipText, { color: "#d97706" }]}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.adminChip, s.adminChipRed]}
                onPress={() => setDeleteConfirmVisible(true)}
              >
                <Trash2 size={15} color="#ef4444" />
                <Text style={[s.adminChipText, { color: "#ef4444" }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Agenda */}
        <View style={{ minHeight: 500 }}>
          <SemesterAgenda
            semesterId={activeSemester.id}
            startDate={activeSemester.startDate.split("T")[0]}
            endDate={activeSemester.endDate.split("T")[0]}
          />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Editar Semestre</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={s.modalClose}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Input label="Nombre" value={editName} onChangeText={setEditName} containerClassName="mb-2" />
            <DatePicker label="Fecha de inicio" value={editStartDate} onDateSelect={setEditStartDate} />
            <DatePicker label="Fecha de término" value={editEndDate} onDateSelect={setEditEndDate} minDate={editStartDate} />

            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={isSaving}
              style={[s.saveBtn, isSaving && { opacity: 0.6 }]}
            >
              <Text style={s.saveBtnText}>{isSaving ? "Guardando..." : "Guardar Cambios"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmModal
        visible={deleteConfirmVisible}
        title="Eliminar semestre"
        message={`¿Eliminar "${activeSemester.name}"?\n\nSe eliminarán también todas sus actividades y asignaciones.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#64748b", fontSize: 16 },
  ghostBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 20 },
  ghostBtnText: { color: "#3AC4BE", fontWeight: "700" },

  heroCard: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    padding: 20, paddingTop: 12, marginBottom: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center",
    marginBottom: 16, alignSelf: "flex-start",
  },
  heroContent: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  heroLeft: { flex: 1, marginRight: 12 },
  heroName: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  heroDateRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 },
  heroDates: { fontSize: 13, color: "#94a3b8" },
  heroStats: { flexDirection: "row", gap: 16 },
  heroStat: { alignItems: "flex-start" },
  heroStatVal: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  heroStatLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  statusActive: { backgroundColor: "#dcfce7" },
  statusInactive: { backgroundColor: "#f1f5f9" },
  statusText: { fontSize: 12, fontWeight: "800" },
  statusActiveText: { color: "#16a34a" },
  statusInactiveText: { color: "#64748b" },

  adminRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  adminChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#e0f7f6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100,
  },
  adminChipIndigo: { backgroundColor: "#eef2ff" },
  adminChipAmber: { backgroundColor: "#fffbeb" },
  adminChipRed: { backgroundColor: "#fff5f5" },
  adminChipText: { fontSize: 13, fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2,
    alignSelf: "center", marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  modalClose: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 20 },
  saveBtn: {
    backgroundColor: "#3AC4BE", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginTop: 16,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
