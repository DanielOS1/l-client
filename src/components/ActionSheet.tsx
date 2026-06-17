import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";

export type ActionSheetOption = {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onPress: () => void;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: ActionSheetOption[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, subtitle, options, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={s.handle} />

          {/* Title */}
          <View style={s.titleBlock}>
            <Text style={s.title}>{title}</Text>
            {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
          </View>

          {/* Actions */}
          <View style={s.actionsWrap}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.option,
                  opt.variant === "destructive" && s.optionDestructive,
                  i < options.length - 1 && s.optionBorder,
                ]}
                onPress={() => { opt.onPress(); onClose(); }}
                activeOpacity={0.7}
              >
                {opt.icon && <View style={s.optionIcon}>{opt.icon}</View>}
                <Text
                  style={[
                    s.optionLabel,
                    opt.variant === "destructive" && s.optionLabelDestructive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel */}
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelLabel}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  titleBlock: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 3,
  },
  actionsWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fafafa",
  },
  optionDestructive: {
    backgroundColor: "#fff5f5",
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionIcon: {
    marginRight: 14,
    width: 24,
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  optionLabelDestructive: {
    color: "#ef4444",
  },
  cancelBtn: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
  },
});
