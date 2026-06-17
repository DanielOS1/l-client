import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { assignmentService } from "../modules/activity/services/assignment.service";
import { Assignment } from "../types/operations.types";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type NotificationType = "assignment" | "notice";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  groupName?: string;
  assignmentId?: string;
  activityName?: string;
  positionName?: string;
  createdAt: number;
  isRead: boolean;
}

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  isChecking: boolean;
  checkForNewAssignments: (userId: string, prefetched?: Assignment[]) => Promise<void>;
  markAllRead: () => void;
  clearAll: () => void;
  addNotice: (notice: Pick<AppNotification, "title" | "body" | "groupName">) => void;
}

// ─── SecureStore helpers ──────────────────────────────────────────────────────

const STORE_KEY = "seen_asgn_ids";
const MAX_IDS = 200;
const ID_LEN = 8;

function short(id: string) {
  return id.slice(0, ID_LEN);
}

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function saveSeenIds(ids: Set<string>) {
  try {
    const arr = Array.from(ids).slice(-MAX_IDS);
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(arr));
  } catch {
    // SecureStore fallo silenciosamente
  }
}

function localId() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isChecking: false,

  checkForNewAssignments: async (userId, prefetched) => {
    if (!userId || get().isChecking) return;
    set({ isChecking: true });

    try {
      const assignments = prefetched ?? await assignmentService.getByUser(userId);
      const seenIds = await loadSeenIds();

      const newOnes = assignments.filter((a) => !seenIds.has(short(a.id)));

      // Marcar todos como vistos (nuevos + existentes)
      assignments.forEach((a) => seenIds.add(short(a.id)));
      await saveSeenIds(seenIds);

      if (newOnes.length === 0) return;

      // Crear notificaciones en el store
      const created: AppNotification[] = newOnes.map((a) => ({
        id: localId(),
        type: "assignment",
        title: "Nueva asignación",
        body: `Fuiste asignado como ${a.position?.name ?? "colaborador"} en "${a.activity?.name ?? "una actividad"}"`,
        assignmentId: a.id,
        activityName: a.activity?.name,
        positionName: a.position?.name,
        createdAt: Date.now(),
        isRead: false,
      }));

      set((state) => {
        const all = [...created, ...state.notifications];
        return {
          notifications: all,
          unreadCount: all.filter((n) => !n.isRead).length,
        };
      });

      // Toast resumen
      if (newOnes.length === 1) {
        const a = newOnes[0];
        Toast.show({
          type: "success",
          text1: "Nueva asignación",
          text2: `${a.position?.name} en "${a.activity?.name}"`,
          visibilityTime: 4500,
        });
      } else {
        Toast.show({
          type: "success",
          text1: `${newOnes.length} nuevas asignaciones`,
          text2: "Revisa la sección Avisos",
          visibilityTime: 4500,
        });
      }
    } finally {
      set({ isChecking: false });
    }
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
    SecureStore.deleteItemAsync(STORE_KEY).catch(() => {});
  },

  addNotice: (notice) => {
    const n: AppNotification = {
      id: localId(),
      type: "notice",
      title: notice.title,
      body: notice.body,
      groupName: notice.groupName,
      createdAt: Date.now(),
      isRead: false,
    };
    set((state) => {
      const all = [n, ...state.notifications];
      return { notifications: all, unreadCount: all.filter((x) => !x.isRead).length };
    });
  },
}));
