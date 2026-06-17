import React, { useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Bell, Briefcase, Megaphone } from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useNotificationStore, AppNotification } from "../../../store/useNotificationStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: es });
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function NotificationItem({ item }: { item: AppNotification }) {
  const isAssignment = item.type === "assignment";

  return (
    <View
      style={{
        backgroundColor: item.isRead ? "#ffffff" : "#f0fdfb",
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1,
        borderColor: item.isRead ? "#f1f5f9" : "#3AC4BE30",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {/* Ícono */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          backgroundColor: isAssignment ? "#e0f7f6" : "#FFF8E1",
        }}
      >
        {isAssignment ? (
          <Briefcase size={18} color="#3AC4BE" />
        ) : (
          <Megaphone size={18} color="#FFC200" />
        )}
      </View>

      {/* Contenido */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              color: item.isRead ? "#64748b" : "#0f172a",
              flex: 1,
              marginRight: 8,
            }}
          >
            {item.title}
          </Text>
          {!item.isRead && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#ef4444",
                marginTop: 3,
              }}
            />
          )}
        </View>

        <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 19, marginBottom: 6 }}>
          {item.body}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 100,
              backgroundColor: isAssignment ? "#e0f7f6" : "#FFF8E1",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: isAssignment ? "#0f766e" : "#92400e",
              }}
            >
              {isAssignment ? "Asignación" : "Aviso"}
            </Text>
          </View>
          {item.groupName && (
            <Text style={{ fontSize: 11, color: "#94a3b8" }}>• {item.groupName}</Text>
          )}
          <Text style={{ fontSize: 11, color: "#94a3b8" }}>{relativeTime(item.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Bell size={36} color="#cbd5e1" />
      </View>
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
        Sin notificaciones
      </Text>
      <Text style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", paddingHorizontal: 40, lineHeight: 20 }}>
        Cuando te asignen a una actividad, aparecerá aquí.
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NotificationsScreen() {
  const { notifications, unreadCount, markAllRead } = useNotificationStore();

  useFocusEffect(
    useCallback(() => {
      markAllRead();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#0f172a" }}>Avisos</Text>
          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: "#ef4444",
                borderRadius: 100,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                {unreadCount} nuevo{unreadCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
          Tus asignaciones y avisos del grupo
        </Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
}
