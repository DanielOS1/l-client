import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGroupStore } from "../../../store/useGroupStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { groupService } from "../services/group.service";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import {
  Crown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TierInfo = {
  label: string;
  description: string;
  iconColor: string;
  bg: string;
  border: string;
  text: string;
};

function getTierInfo(level: number): TierInfo {
  if (level > ROLE_LEVELS.OWNER) return {
    label: "Fundador", description: "Acceso total, no puede ser gestionado",
    iconColor: "#FFC200", bg: "#FFFDE7", border: "#FFC200", text: "#78350f",
  };
  if (level >= ROLE_LEVELS.OWNER) return {
    label: "Dueño", description: "Puede remover miembros del grupo",
    iconColor: "#ef4444", bg: "#FEF2F2", border: "#fca5a5", text: "#991b1b",
  };
  if (level >= ROLE_LEVELS.MANAGER) return {
    label: "Manager", description: "Puede crear roles y agregar miembros",
    iconColor: "#8b5cf6", bg: "#F5F3FF", border: "#c4b5fd", text: "#5b21b6",
  };
  if (level >= ROLE_LEVELS.ADMIN) return {
    label: "Administrador", description: "Puede gestionar semestres y actividades",
    iconColor: "#f59e0b", bg: "#FFFBEB", border: "#fcd34d", text: "#92400e",
  };
  if (level >= ROLE_LEVELS.NOTICES) return {
    label: "Comunicador", description: "Puede enviar avisos al grupo",
    iconColor: "#3AC4BE", bg: "#e0f7f6", border: "#3AC4BE", text: "#0f766e",
  };
  return {
    label: "Miembro", description: "Acceso básico de lectura",
    iconColor: "#3b82f6", bg: "#EFF6FF", border: "#bfdbfe", text: "#1d4ed8",
  };
}

function getTierIcon(level: number, size = 28) {
  if (level > ROLE_LEVELS.OWNER)    return <Crown size={size} color="#FFC200" />;
  if (level >= ROLE_LEVELS.OWNER)   return <ShieldAlert size={size} color="#ef4444" />;
  if (level >= ROLE_LEVELS.MANAGER) return <ShieldCheck size={size} color="#8b5cf6" />;
  if (level >= ROLE_LEVELS.ADMIN)   return <ShieldCheck size={size} color="#f59e0b" />;
  return                                    <Shield size={size} color="#3b82f6" />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CreateGroupRoleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId, roleId, roleName, roleDescription, roleLevel } = route.params ?? {};

  const isEditMode = !!roleId;

  const { activeGroup, getGroupDetails } = useGroupStore();
  const { user } = useAuthStore();

  const currentUserGroup = activeGroup?.userGroups?.find(ug => ug.user.id === user?.id);
  const myLevel = currentUserGroup?.groupRole?.level ?? 0;

  const [name, setName] = useState<string>(roleName ?? "");
  const [description, setDescription] = useState<string>(roleDescription ?? "");
  const [levelStr, setLevelStr] = useState<string>(roleLevel?.toString() ?? "10");
  const [isLoading, setIsLoading] = useState(false);

  const parsedLevel = parseInt(levelStr, 10);
  const validLevel = !isNaN(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 100;
  const tier = getTierInfo(validLevel ? parsedLevel : 0);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Error", text2: "El nombre es obligatorio" });
      return;
    }

    const levelNum = parseInt(levelStr, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 100) {
      Toast.show({ type: "error", text1: "Error", text2: "El nivel debe estar entre 1 y 100" });
      return;
    }

    if (levelNum >= myLevel) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `No puedes crear un rol con nivel igual o mayor al tuyo (${myLevel})`,
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode) {
        await groupService.updateRole(roleId, { name: name.trim(), description: description.trim() || undefined, level: levelNum });
        Toast.show({ type: "success", text1: "Rol actualizado" });
      } else {
        await groupService.createRole({ groupId, name: name.trim(), description: description.trim() || undefined, level: levelNum });
        Toast.show({ type: "success", text1: "Rol creado" });
      }
      await getGroupDetails(groupId);
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Ocurrió un error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{isEditMode ? "Editar Rol" : "Nuevo Rol"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {/* Tier preview */}
        <View style={[s.tierCard, { backgroundColor: tier.bg, borderColor: tier.border }]}>
          <View style={[s.tierIconWrap, { backgroundColor: "#ffffff50" }]}>
            {getTierIcon(validLevel ? parsedLevel : 0)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.tierLabel, { color: tier.text }]}>
              {name.trim() || "Nombre del rol"}
            </Text>
            <Text style={[s.tierDesc, { color: tier.text + "cc" }]}>
              {tier.label} · Nivel {validLevel ? parsedLevel : "—"}
            </Text>
            <Text style={[s.tierPerm, { color: tier.text + "99" }]}>
              {tier.description}
            </Text>
          </View>
        </View>

        {/* Nombre */}
        <Text style={s.label}>Nombre del rol</Text>
        <TextInput
          style={s.input}
          placeholder="Ej. Presidente, Tesorero, Vocero..."
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        {/* Descripción */}
        <Text style={s.label}>Descripción <Text style={s.optional}>(opcional)</Text></Text>
        <TextInput
          style={[s.input, s.inputMultiline]}
          placeholder="¿Qué hace este rol?"
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={120}
        />

        {/* Nivel */}
        <Text style={s.label}>Nivel de autoridad</Text>
        <View style={s.levelRow}>
          <TextInput
            style={[s.input, s.levelInput]}
            placeholder="1–100"
            placeholderTextColor="#94a3b8"
            value={levelStr}
            onChangeText={setLevelStr}
            keyboardType="numeric"
            maxLength={3}
          />
          <View style={[s.levelBadge, { backgroundColor: tier.bg, borderColor: tier.border }]}>
            <Text style={[s.levelBadgeText, { color: tier.text }]}>
              {validLevel ? parsedLevel : "—"}
            </Text>
          </View>
        </View>

        {/* Escala de referencia */}
        <View style={s.scaleWrap}>
          {[
            { lvl: 10, label: "Miembro" },
            { lvl: 30, label: "Avisos" },
            { lvl: 50, label: "Admin" },
            { lvl: 75, label: "Manager" },
            { lvl: 100, label: "Dueño" },
          ].map(({ lvl, label }) => {
            const t = getTierInfo(lvl);
            const isActive = validLevel && parsedLevel >= lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setLevelStr(lvl.toString())}
                style={[s.scaleItem, { borderColor: isActive ? t.border : "#e2e8f0", backgroundColor: isActive ? t.bg : "#f8fafc" }]}
              >
                {getTierIcon(lvl, 14)}
                <Text style={[s.scaleLabel, { color: isActive ? t.text : "#94a3b8" }]}>{lvl}</Text>
                <Text style={[s.scaleName, { color: isActive ? t.text : "#cbd5e1" }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.hint}>
          Tu nivel actual: <Text style={{ fontWeight: "700", color: "#1e293b" }}>{myLevel}</Text>.
          Solo puedes crear roles con nivel inferior al tuyo.
        </Text>

        {/* Botón submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={[s.submitBtn, isLoading && { opacity: 0.6 }]}
        >
          <Text style={s.submitText}>{isLoading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear Rol"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={s.cancelBtn}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },

  body: { padding: 20, paddingBottom: 60 },

  tierCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 20, padding: 18, borderWidth: 1.5, marginBottom: 28,
  },
  tierIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: "center", justifyContent: "center",
  },
  tierLabel: { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  tierDesc: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  tierPerm: { fontSize: 11 },

  label: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 6, marginTop: 2 },
  optional: { fontWeight: "400", color: "#94a3b8" },

  input: {
    backgroundColor: "#ffffff",
    borderRadius: 14, borderWidth: 1.5, borderColor: "#e2e8f0",
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: "#0f172a", marginBottom: 18,
  },
  inputMultiline: { height: 84, textAlignVertical: "top", paddingTop: 12 },

  levelRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  levelInput: { flex: 1, marginBottom: 0 },
  levelBadge: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5,
  },
  levelBadgeText: { fontSize: 20, fontWeight: "900" },

  scaleWrap: {
    flexDirection: "row", gap: 6, marginBottom: 12, flexWrap: "nowrap",
  },
  scaleItem: {
    flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, gap: 2,
  },
  scaleLabel: { fontSize: 11, fontWeight: "800" },
  scaleName: { fontSize: 9, fontWeight: "600" },

  hint: { fontSize: 12, color: "#94a3b8", marginBottom: 28, lineHeight: 18 },

  submitBtn: {
    backgroundColor: "#3AC4BE", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginBottom: 10,
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  submitText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },

  cancelBtn: {
    borderRadius: 16, paddingVertical: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  cancelText: { color: "#64748b", fontSize: 15, fontWeight: "600" },
});
