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
import { useSemesterStore } from "../../../store/useSemesterStore";
import { DatePicker } from "../../../components/DatePicker";
import { ChevronLeft, Calendar } from "lucide-react-native";
import Toast from "react-native-toast-message";

export function CreateSemesterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { createSemester, isLoading } = useSemesterStore();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !startDate || !endDate) {
      Toast.show({ type: "error", text1: "Error", text2: "Todos los campos son obligatorios" });
      return;
    }
    try {
      await createSemester(groupId, name.trim(), startDate, endDate);
      Toast.show({ type: "success", text1: "Semestre creado" });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e.response?.data?.message || "Error al crear semestre",
      });
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nuevo Semestre</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Calendar size={30} color="#3AC4BE" />
          </View>
          <Text style={s.heroTitle}>Organiza tu período</Text>
          <Text style={s.heroSub}>Define un semestre para agrupar actividades y compromisos.</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nombre del semestre</Text>
          <TextInput
            style={s.input}
            placeholder="Ej. Primer semestre 2025"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            maxLength={60}
          />

          <DatePicker
            label="Fecha de inicio"
            value={startDate}
            onDateSelect={setStartDate}
            placeholder="Seleccionar inicio"
          />

          <DatePicker
            label="Fecha de término"
            value={endDate}
            onDateSelect={setEndDate}
            placeholder="Seleccionar fin"
            minDate={startDate}
          />
        </View>

        {startDate && endDate ? (
          <View style={s.previewCard}>
            <Text style={s.previewLabel}>Vista previa</Text>
            <Text style={s.previewName}>{name || "Nombre del semestre"}</Text>
            <Text style={s.previewDates}>
              {new Date(startDate + "T12:00:00").toLocaleDateString("es-CL")} —{" "}
              {new Date(endDate + "T12:00:00").toLocaleDateString("es-CL")}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleCreate}
          disabled={isLoading}
          style={[s.submitBtn, isLoading && { opacity: 0.6 }]}
          activeOpacity={0.85}
        >
          <Text style={s.submitText}>{isLoading ? "Creando..." : "Crear Semestre"}</Text>
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

  hero: { alignItems: "center", paddingVertical: 20, marginBottom: 8 },
  heroIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#e0f7f6", alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  heroSub: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 18, paddingHorizontal: 20 },

  card: {
    backgroundColor: "#ffffff", borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 },
  input: {
    backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1.5, borderColor: "#e2e8f0",
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#0f172a", marginBottom: 16,
  },

  previewCard: {
    backgroundColor: "#e0f7f6", borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: "#3AC4BE40",
  },
  previewLabel: { fontSize: 11, fontWeight: "700", color: "#0f766e", textTransform: "uppercase", marginBottom: 4 },
  previewName: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 2 },
  previewDates: { fontSize: 13, color: "#0f766e" },

  submitBtn: {
    backgroundColor: "#3AC4BE", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginBottom: 10,
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  cancelBtn: { borderRadius: 16, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  cancelText: { color: "#64748b", fontSize: 15, fontWeight: "600" },
});
