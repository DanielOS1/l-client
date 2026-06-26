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
import { useAuthStore } from "../../../store/useAuthStore";
import { groupService } from "../services/group.service";
import { useGroupStore } from "../../../store/useGroupStore";
import { ChevronLeft, UserPlus, Search, Mail, Check } from "lucide-react-native";
import Toast from "react-native-toast-message";

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();
}

export function AddMemberScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const { user } = useAuthStore();
  const { getGroupDetails } = useGroupStore();

  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setIsSearching(true);
    setFoundUser(null);
    try {
      const result = await groupService.searchUserByEmail(email.toLowerCase().trim());
      setFoundUser(result);
    } catch {
      Toast.show({
        type: "error",
        text1: "No encontrado",
        text2: "No existe un usuario con ese correo electrónico.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser || !user) return;
    setIsAdding(true);
    try {
      await groupService.addMember(groupId, foundUser.id, user.id);
      Toast.show({
        type: "success",
        text1: "Miembro agregado",
        text2: `${foundUser.firstName} se unió al grupo.`,
      });
      await getGroupDetails(groupId);
      navigation.goBack();
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e.response?.data?.message || "No se pudo agregar al miembro.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Agregar Miembro</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <UserPlus size={30} color="#3AC4BE" />
          </View>
          <Text style={s.heroTitle}>Invitar al grupo</Text>
          <Text style={s.heroSub}>
            Busca a la persona por su correo electrónico y agrégala al grupo.
          </Text>
        </View>

        {/* Search card */}
        <View style={s.card}>
          <Text style={s.fieldLabel}>Correo electrónico</Text>
          <View style={s.inputRow}>
            <View style={s.inputWrap}>
              <Mail size={16} color="#94a3b8" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="usuario@ejemplo.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(t) => { setEmail(t); setFoundUser(null); }}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              style={[s.searchBtn, (isSearching || !email.trim()) && { opacity: 0.5 }]}
              onPress={handleSearch}
              disabled={isSearching || !email.trim()}
              activeOpacity={0.8}
            >
              <Search size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Result card */}
        {foundUser && (
          <View style={s.resultCard}>
            <View style={s.resultHeader}>
              <View style={s.resultAvatar}>
                <Text style={s.resultAvatarText}>
                  {getInitials(foundUser.firstName, foundUser.lastName)}
                </Text>
              </View>
              <View style={s.resultInfo}>
                <Text style={s.resultName}>
                  {foundUser.firstName} {foundUser.lastName}
                </Text>
                <Text style={s.resultEmail}>{foundUser.email}</Text>
                {foundUser.rut && (
                  <Text style={s.resultRut}>RUT: {foundUser.rut}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[s.addBtn, isAdding && { opacity: 0.6 }]}
              onPress={handleAddMember}
              disabled={isAdding}
              activeOpacity={0.85}
            >
              {isAdding ? (
                <Text style={s.addBtnText}>Agregando...</Text>
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <Text style={s.addBtnText}>Agregar al Grupo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 10 },
  inputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  inputWrap: { flex: 1, position: "relative", justifyContent: "center" },
  inputIcon: { position: "absolute", left: 14, zIndex: 1 },
  input: {
    backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1.5, borderColor: "#e2e8f0",
    paddingLeft: 42, paddingRight: 14, paddingVertical: 13,
    fontSize: 15, color: "#0f172a",
  },
  searchBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#3AC4BE", alignItems: "center", justifyContent: "center",
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },

  resultCard: {
    backgroundColor: "#ffffff", borderRadius: 20, padding: 20,
    borderWidth: 1.5, borderColor: "#3AC4BE40",
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  resultHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  resultAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#e0f7f6", alignItems: "center", justifyContent: "center",
    marginRight: 14, borderWidth: 2, borderColor: "#3AC4BE40",
  },
  resultAvatarText: { fontSize: 18, fontWeight: "800", color: "#3AC4BE" },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 2 },
  resultEmail: { fontSize: 13, color: "#64748b" },
  resultRut: { fontSize: 11, color: "#94a3b8", marginTop: 2 },

  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#3AC4BE", borderRadius: 14, paddingVertical: 14,
    shadowColor: "#3AC4BE", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
