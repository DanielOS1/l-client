import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useGroupStore } from "../../../store/useGroupStore";
import { useNoticeStore } from "../../../store/useNoticeStore";
import { NoticeLevel } from "../../../types/notice.types";

const LEVELS: { value: NoticeLevel; label: string; color: string; bg: string }[] = [
  { value: "NORMAL", label: "Normal", color: "#64748b", bg: "#f1f5f9" },
  { value: "IMPORTANT", label: "Importante", color: "#92400e", bg: "#fffbeb" },
  { value: "URGENT", label: "Urgente", color: "#991b1b", bg: "#fef2f2" },
];

export function CreateNoticeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { noticeId } = route.params || {};

  const { activeGroup } = useGroupStore();
  const { allNotices, createNotice, updateDraft, sendNotice } = useNoticeStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<NoticeLevel>("NORMAL");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const groupId = activeGroup?.id ?? "";
  const isEditing = !!noticeId;

  // Pre-fill if editing a draft
  useEffect(() => {
    if (isEditing) {
      const existing = allNotices.find((n) => n.id === noticeId);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description);
        setLevel(existing.level);
      }
    }
  }, [noticeId]);

  const handleSaveDraft = async () => {
    if (!title.trim() || !description.trim()) {
      Toast.show({ type: "error", text1: "Título y descripción son obligatorios" });
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing) {
        await updateDraft(noticeId, { title: title.trim(), description: description.trim(), level });
        Toast.show({ type: "success", text1: "Borrador actualizado" });
      } else {
        await createNotice({ title: title.trim(), description: description.trim(), level, groupId, isSent: false });
        Toast.show({ type: "success", text1: "Borrador guardado" });
      }
      navigation.goBack();
    } catch {
      Toast.show({ type: "error", text1: "No se pudo guardar el borrador" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNow = async () => {
    if (!title.trim() || !description.trim()) {
      Toast.show({ type: "error", text1: "Título y descripción son obligatorios" });
      return;
    }
    setIsSending(true);
    try {
      if (isEditing) {
        await updateDraft(noticeId, { title: title.trim(), description: description.trim(), level });
        await sendNotice(noticeId, groupId);
      } else {
        await createNotice({ title: title.trim(), description: description.trim(), level, groupId, isSent: true });
      }
      Toast.show({ type: "success", text1: "Aviso enviado correctamente" });
      navigation.goBack();
    } catch {
      Toast.show({ type: "error", text1: "No se pudo enviar el aviso" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12, padding: 4 }}>
              <ChevronLeft size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>
              {isEditing ? "Editar borrador" : "Nuevo aviso"}
            </Text>
          </View>

          {/* Nivel de urgencia */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 10 }}>
            NIVEL DE URGENCIA
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l.value}
                onPress={() => setLevel(l.value)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: level === l.value ? l.bg : "#ffffff",
                  borderWidth: 2,
                  borderColor: level === l.value ? l.color : "#e2e8f0",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: level === l.value ? l.color : "#94a3b8" }}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Título */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 }}>TÍTULO</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Título del aviso"
            placeholderTextColor="#94a3b8"
            maxLength={200}
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              color: "#0f172a",
              marginBottom: 20,
            }}
          />

          {/* Descripción */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 }}>DESCRIPCIÓN</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Escribe el contenido del aviso..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              color: "#0f172a",
              minHeight: 140,
              marginBottom: 32,
            }}
          />

          {/* Botones */}
          <TouchableOpacity
            onPress={handleSendNow}
            disabled={isSending || isSaving}
            style={{
              backgroundColor: "#3AC4BE",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 12,
              opacity: isSending ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
              {isSending ? "Enviando..." : "Enviar ahora"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveDraft}
            disabled={isSaving || isSending}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#e2e8f0",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#64748b", fontWeight: "700", fontSize: 15 }}>
              {isSaving ? "Guardando..." : "Guardar borrador"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
