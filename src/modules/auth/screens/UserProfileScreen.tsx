import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../services/api";
import { ApiResponse } from "../../../types/api.types";
import { User } from "../../../types";
import { ChevronLeft, Mail, Hash, Phone, Briefcase, Save } from "lucide-react-native";
import Toast from "react-native-toast-message";

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIcon}>{icon}</View>
      <View>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function UserProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [occupation, setOccupation] = useState(user?.occupation || "");
  const [isLoading, setIsLoading] = useState(false);

  const initials = `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Toast.show({ type: "error", text1: "Error", text2: "El nombre y apellido son obligatorios." });
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.patch<ApiResponse<User>>(`/users/${user!.id}`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        occupation: occupation.trim() || undefined,
      });
      useAuthStore.setState({ user: response.data.data });
      Toast.show({ type: "success", text1: "Perfil actualizado" });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "No se pudo actualizar el perfil.",
      });
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
        <Text style={s.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.body}>
          {/* Avatar */}
          <View style={s.avatarSection}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <Text style={s.avatarName}>{user?.firstName} {user?.lastName}</Text>
          </View>

          {/* Info fija */}
          <View style={s.card}>
            <Text style={s.sectionLabel}>Información de cuenta</Text>
            <InfoRow
              icon={<Mail size={16} color="#3AC4BE" />}
              label="Correo"
              value={user?.email ?? "—"}
            />
            <View style={s.divider} />
            <InfoRow
              icon={<Hash size={16} color="#3AC4BE" />}
              label="RUT"
              value={user?.rut ?? "—"}
            />
          </View>

          {/* Campos editables */}
          <View style={s.card}>
            <Text style={s.sectionLabel}>Editar información</Text>

            <Text style={s.fieldLabel}>Nombre</Text>
            <TextInput
              style={s.input}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor="#94a3b8"
            />

            <Text style={s.fieldLabel}>Apellido</Text>
            <TextInput
              style={s.input}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              placeholderTextColor="#94a3b8"
            />

            <Text style={s.fieldLabel}>Teléfono <Text style={s.optional}>(opcional)</Text></Text>
            <View style={s.inputIconWrap}>
              <Phone size={16} color="#94a3b8" style={s.inputIcon} />
              <TextInput
                style={[s.input, s.inputWithIcon]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
                placeholder="+56 9 XXXX XXXX"
              />
            </View>

            <Text style={s.fieldLabel}>Ocupación <Text style={s.optional}>(opcional)</Text></Text>
            <View style={s.inputIconWrap}>
              <Briefcase size={16} color="#94a3b8" style={s.inputIcon} />
              <TextInput
                style={[s.input, s.inputWithIcon]}
                value={occupation}
                onChangeText={setOccupation}
                autoCapitalize="words"
                placeholderTextColor="#94a3b8"
                placeholder="Ej. Estudiante, Tesorero..."
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={[s.saveBtn, isLoading && { opacity: 0.6 }]}
            activeOpacity={0.85}
          >
            <Save size={18} color="#fff" />
            <Text style={s.saveBtnText}>{isLoading ? "Guardando..." : "Guardar Cambios"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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

  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "#e0f7f6",
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3, borderColor: "#3AC4BE40",
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: "#3AC4BE" },
  avatarName: { fontSize: 20, fontWeight: "800", color: "#0f172a" },

  card: {
    backgroundColor: "#ffffff", borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e0f7f6", alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },

  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 6 },
  optional: { fontWeight: "400", color: "#94a3b8" },
  input: {
    backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1.5, borderColor: "#e2e8f0",
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#0f172a", marginBottom: 16,
  },
  inputIconWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 14, top: 14, zIndex: 1 },
  inputWithIcon: { paddingLeft: 42 },

  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#3AC4BE", borderRadius: 16, paddingVertical: 16, marginTop: 4,
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
