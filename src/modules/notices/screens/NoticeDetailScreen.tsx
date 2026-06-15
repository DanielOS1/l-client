import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, EyeOff, Calendar, User } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { useNoticeStore } from "../../../store/useNoticeStore";
import { NoticeLevel } from "../../../types/notice.types";

const LEVEL_CONFIG: Record<NoticeLevel, { label: string; bg: string; text: string; border: string; accentBg: string }> = {
  NORMAL: { label: "Normal", bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0", accentBg: "#f8fafc" },
  IMPORTANT: { label: "Importante", bg: "#fffbeb", text: "#92400e", border: "#fcd34d", accentBg: "#fffdf0" },
  URGENT: { label: "Urgente", bg: "#fef2f2", text: "#991b1b", border: "#fca5a5", accentBg: "#fff5f5" },
};

export function NoticeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { noticeId } = route.params || {};

  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();
  const { allNotices, notices, deactivateNotice } = useNoticeStore();
  const [isDeactivating, setIsDeactivating] = useState(false);

  const groupId = activeGroup?.id ?? "";
  const currentUserGroup = activeGroup?.userGroups?.find((ug) => ug.user.id === user?.id);
  const myLevel = currentUserGroup?.groupRole?.level ?? 0;
  const canManage = myLevel >= 30;

  // Find notice in either admin or member list
  const notice = [...allNotices, ...notices].find((n) => n.id === noticeId);

  if (!notice) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#94a3b8" }}>Aviso no encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: "#3AC4BE", fontWeight: "600" }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const cfg = LEVEL_CONFIG[notice.level];

  const handleDeactivate = () => {
    Alert.alert(
      "Desactivar aviso",
      "El aviso dejará de ser visible para los miembros. Los administradores podrán seguir viéndolo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            setIsDeactivating(true);
            try {
              await deactivateNotice(notice.id, groupId);
              Toast.show({ type: "success", text1: "Aviso desactivado" });
              navigation.goBack();
            } catch {
              Toast.show({ type: "error", text1: "No se pudo desactivar el aviso" });
            } finally {
              setIsDeactivating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cfg.accentBg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
            <ChevronLeft size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#475569" }}>Aviso</Text>
        </View>

        {/* Content card */}
        <View style={{ margin: 16, backgroundColor: "#ffffff", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: cfg.border }}>
          {/* Level + status */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, backgroundColor: cfg.bg, borderWidth: 1, borderColor: cfg.border }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: cfg.text }}>{cfg.label}</Text>
            </View>
            {!notice.isActive && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 }}>
                <EyeOff size={12} color="#94a3b8" />
                <Text style={{ fontSize: 12, color: "#94a3b8", fontWeight: "600" }}>Desactivado</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#0f172a", lineHeight: 30, marginBottom: 16 }}>
            {notice.title}
          </Text>

          {/* Meta */}
          <View style={{ gap: 8, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <User size={14} color="#94a3b8" />
              <Text style={{ fontSize: 13, color: "#64748b" }}>
                {notice.sender.firstName} {notice.sender.lastName}
              </Text>
            </View>
            {notice.sentAt && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Calendar size={14} color="#94a3b8" />
                <Text style={{ fontSize: 13, color: "#64748b" }}>
                  {new Date(notice.sentAt).toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#f1f5f9", marginBottom: 20 }} />

          {/* Description */}
          <Text style={{ fontSize: 15, color: "#334155", lineHeight: 24 }}>
            {notice.description}
          </Text>
        </View>

        {/* Deactivate button (admin only, only if active) */}
        {canManage && notice.isSent && notice.isActive && (
          <TouchableOpacity
            onPress={handleDeactivate}
            disabled={isDeactivating}
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              paddingVertical: 14,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: "#fca5a5",
              backgroundColor: "#fef2f2",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: isDeactivating ? 0.6 : 1,
            }}
          >
            <EyeOff size={16} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>
              {isDeactivating ? "Desactivando..." : "Desactivar aviso"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
