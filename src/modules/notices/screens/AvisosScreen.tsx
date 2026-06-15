import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Plus, Send, EyeOff, ChevronRight } from "lucide-react-native";
import { useAuthStore } from "../../../store/useAuthStore";
import { useGroupStore } from "../../../store/useGroupStore";
import { useNoticeStore } from "../../../store/useNoticeStore";
import { ROLE_LEVELS } from "../../../constants/role-levels";
import { Notice, NoticeLevel } from "../../../types/notice.types";
import Toast from "react-native-toast-message";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<NoticeLevel, { label: string; bg: string; text: string; border: string }> = {
  NORMAL: { label: "Normal", bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" },
  IMPORTANT: { label: "Importante", bg: "#fffbeb", text: "#92400e", border: "#fcd34d" },
  URGENT: { label: "Urgente", bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
};

const DATE_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "today", label: "Hoy" },
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mes" },
] as const;

type DateFilter = typeof DATE_FILTERS[number]["id"];

function filterByDate(notices: Notice[], filter: DateFilter): Notice[] {
  if (filter === "all") return notices;
  const now = new Date();
  return notices.filter((n) => {
    const d = new Date(n.sentAt ?? n.createdAt);
    if (filter === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (filter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return d >= start;
    }
    if (filter === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

function formatSentDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Level chip ──────────────────────────────────────────────────────────────

function LevelChip({ level }: { level: NoticeLevel }) {
  const cfg = LEVEL_CONFIG[level];
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 100,
        backgroundColor: cfg.bg,
        borderWidth: 1,
        borderColor: cfg.border,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.text }}>{cfg.label}</Text>
    </View>
  );
}

// ─── Notice card (member view) ────────────────────────────────────────────────

function NoticeCard({ notice, onPress }: { notice: Notice; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <LevelChip level={notice.level} />
        <Text style={{ fontSize: 12, color: "#94a3b8" }}>{formatSentDate(notice.sentAt)}</Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 4 }}>
        {notice.title}
      </Text>
      <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 19 }} numberOfLines={2}>
        {notice.description}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <Text style={{ fontSize: 12, color: "#94a3b8" }}>
          {notice.sender.firstName} {notice.sender.lastName}
        </Text>
        <ChevronRight size={16} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Draft card (admin view) ──────────────────────────────────────────────────

function DraftCard({
  notice,
  onEdit,
  onSend,
  isSending,
}: {
  notice: Notice;
  onEdit: () => void;
  onSend: () => void;
  isSending: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        borderStyle: "dashed",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <LevelChip level={notice.level} />
        <View style={{ backgroundColor: "#e2e8f0", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 }}>
          <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "600" }}>Borrador</Text>
        </View>
      </View>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#334155", marginBottom: 4 }}>{notice.title}</Text>
      <Text style={{ fontSize: 13, color: "#94a3b8", lineHeight: 18 }} numberOfLines={2}>
        {notice.description}
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          onPress={onEdit}
          style={{ flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#3AC4BE", alignItems: "center" }}
        >
          <Text style={{ color: "#3AC4BE", fontWeight: "700", fontSize: 13 }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSend}
          disabled={isSending}
          style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: "#3AC4BE", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
        >
          <Send size={14} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function AvisosScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();
  const { notices, allNotices, drafts, fetchForGroup, fetchAdminView, sendNotice, markRead, isLoading } = useNoticeStore();

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const groupId = activeGroup?.id ?? "";
  const currentUserGroup = activeGroup?.userGroups?.find((ug) => ug.user.id === user?.id);
  const myLevel = currentUserGroup?.groupRole?.level ?? 0;
  const canManage = myLevel >= 30;

  const loadData = useCallback(async () => {
    if (!groupId) return;
    if (canManage) {
      await fetchAdminView(groupId);
    } else {
      await fetchForGroup(groupId);
    }
    markRead();
  }, [groupId, canManage]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSend = async (notice: Notice) => {
    setSendingId(notice.id);
    try {
      await sendNotice(notice.id, groupId);
      Toast.show({ type: "success", text1: "Aviso enviado", text2: notice.title });
    } catch {
      Toast.show({ type: "error", text1: "No se pudo enviar el aviso" });
    } finally {
      setSendingId(null);
    }
  };

  // ── Admin view ──
  if (canManage) {
    const sentNotices = allNotices.filter((n) => n.isSent);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 8 }}>
            <View>
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#0f172a" }}>Avisos</Text>
              <Text style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Gestiona los avisos del grupo</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateNotice")}
              style={{ backgroundColor: "#3AC4BE", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Plus size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Redactar</Text>
            </TouchableOpacity>
          </View>

          {/* Borradores */}
          {drafts.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                Borradores ({drafts.length})
              </Text>
              {drafts.map((n) => (
                <DraftCard
                  key={n.id}
                  notice={n}
                  onEdit={() => navigation.navigate("CreateNotice", { noticeId: n.id })}
                  onSend={() => handleSend(n)}
                  isSending={sendingId === n.id}
                />
              ))}
            </View>
          )}

          {/* Enviados */}
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Enviados ({sentNotices.length})
          </Text>
          {sentNotices.length === 0 ? (
            <Text style={{ color: "#94a3b8", textAlign: "center", paddingVertical: 24 }}>No hay avisos enviados aún</Text>
          ) : (
            sentNotices.map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => navigation.navigate("NoticeDetail", { noticeId: n.id })}
                style={{
                  backgroundColor: n.isActive ? "#ffffff" : "#f8fafc",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: n.isActive ? "#f1f5f9" : "#e2e8f0",
                  opacity: n.isActive ? 1 : 0.6,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <LevelChip level={n.level} />
                  {!n.isActive && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <EyeOff size={12} color="#94a3b8" />
                      <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "600" }}>Desactivado</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 11, color: "#94a3b8" }}>{formatSentDate(n.sentAt)}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: n.isActive ? "#0f172a" : "#64748b" }}>{n.title}</Text>
                <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {n.sender.firstName} {n.sender.lastName}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Member view ──
  const filtered = filterByDate(notices, dateFilter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header + filtros */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: "#0f172a", marginBottom: 12 }}>Avisos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DATE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setDateFilter(f.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 100,
                marginRight: 8,
                backgroundColor: dateFilter === f.id ? "#3AC4BE" : "#f1f5f9",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: dateFilter === f.id ? "#fff" : "#64748b" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
      >
        {filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#334155", marginBottom: 6 }}>Sin avisos</Text>
            <Text style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
              Aquí aparecerán los avisos que envíe el equipo organizador.
            </Text>
          </View>
        ) : (
          filtered.map((n) => (
            <NoticeCard
              key={n.id}
              notice={n}
              onPress={() => navigation.navigate("NoticeDetail", { noticeId: n.id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
