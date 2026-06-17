import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { ChevronLeft, Users } from "lucide-react-native";
import Toast from "react-native-toast-message";

export function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { createGroup, isLoading } = useGroupStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Error", text2: "El nombre del grupo es obligatorio" });
      return;
    }
    if (!user?.id) return;
    try {
      await createGroup(name.trim(), description.trim(), user.id);
      Toast.show({ type: "success", text1: "Grupo creado" });
      navigation.goBack();
    } catch {
      // Error handled by store
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nuevo Grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Users size={32} color="#3AC4BE" />
          </View>
          <Text style={s.heroTitle}>Crea tu organización</Text>
          <Text style={s.heroSub}>Serás el fundador y podrás gestionar todos los aspectos del grupo.</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nombre del grupo</Text>
          <TextInput
            style={s.input}
            placeholder="Ej. Centro de Estudiantes 2025"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            maxLength={60}
          />

          <Text style={s.fieldLabel}>Descripción <Text style={s.optional}>(opcional)</Text></Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            placeholder="¿De qué trata tu organización?"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={isLoading}
          style={[s.submitBtn, isLoading && { opacity: 0.6 }]}
          activeOpacity={0.85}
        >
          <Text style={s.submitText}>{isLoading ? "Creando..." : "Crear Grupo"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={s.cancelBtn}>
          <Text style={s.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
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

  hero: { alignItems: "center", paddingVertical: 24, marginBottom: 8 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#e0f7f6",
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  heroSub: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20, paddingHorizontal: 16 },

  card: {
    backgroundColor: "#ffffff", borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 },
  optional: { fontWeight: "400", color: "#94a3b8" },
  input: {
    backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1.5, borderColor: "#e2e8f0",
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#0f172a", marginBottom: 16,
  },
  inputMulti: { height: 90, paddingTop: 12, marginBottom: 0 },

  submitBtn: {
    backgroundColor: "#3AC4BE", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginBottom: 10,
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  cancelBtn: { borderRadius: 16, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  cancelText: { color: "#64748b", fontSize: 15, fontWeight: "600" },
});
