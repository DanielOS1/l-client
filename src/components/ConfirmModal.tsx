import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { AlertTriangle, Trash2, LogOut, Info } from "lucide-react-native";

type Variant = "danger" | "warning" | "info";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  onConfirm: () => void;
  onCancel: () => void;
};

const icons: Record<Variant, React.ReactNode> = {
  danger:  <Trash2 size={28} color="#ef4444" />,
  warning: <AlertTriangle size={28} color="#f59e0b" />,
  info:    <Info size={28} color="#3AC4BE" />,
};

const colors: Record<Variant, { icon: string; confirm: string; text: string }> = {
  danger:  { icon: "#FEF2F2", confirm: "#ef4444", text: "#fff" },
  warning: { icon: "#FFFBEB", confirm: "#f59e0b", text: "#fff" },
  info:    { icon: "#e0f7f6", confirm: "#3AC4BE", text: "#fff" },
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const c = colors[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={s.overlay} onPress={onCancel}>
        <Pressable style={s.card} onPress={(e) => e.stopPropagation()}>
          {/* Icon */}
          <View style={[s.iconWrap, { backgroundColor: c.icon }]}>
            {icons[variant]}
          </View>

          {/* Text */}
          <Text style={s.title}>{title}</Text>
          {message ? <Text style={s.message}>{message}</Text> : null}

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={s.cancelLabel}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.confirmBtn, { backgroundColor: c.confirm }]}
              onPress={() => { onConfirm(); }}
              activeOpacity={0.8}
            >
              <Text style={[s.confirmLabel, { color: c.text }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748b",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: "800",
  },
});
