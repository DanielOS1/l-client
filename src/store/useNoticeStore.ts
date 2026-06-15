import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { Notice, CreateNoticeInput, UpdateNoticeInput } from "../types/notice.types";
import { noticeService } from "../modules/notices/services/notice.service";
import { useNotificationStore } from "./useNotificationStore";

// ─── SecureStore helpers ──────────────────────────────────────────────────────

const SEEN_KEY = "seen_notice_ids";
const MAX_SEEN = 200;
const ID_LEN = 8;

function short(id: string) {
  return id.slice(0, ID_LEN);
}

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await SecureStore.getItemAsync(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function saveSeenIds(ids: Set<string>) {
  try {
    const arr = Array.from(ids).slice(-MAX_SEEN);
    await SecureStore.setItemAsync(SEEN_KEY, JSON.stringify(arr));
  } catch {}
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface NoticeStore {
  notices: Notice[];
  allNotices: Notice[];
  drafts: Notice[];
  unreadCount: number;
  isLoading: boolean;
  isChecking: boolean;

  fetchForGroup: (groupId: string) => Promise<Notice[]>;
  fetchAdminView: (groupId: string) => Promise<Notice[]>;
  createNotice: (data: CreateNoticeInput) => Promise<Notice>;
  updateDraft: (id: string, data: UpdateNoticeInput) => Promise<void>;
  sendNotice: (id: string, groupId: string) => Promise<void>;
  deactivateNotice: (id: string, groupId: string) => Promise<void>;
  checkForNewNotices: (groupId: string, prefetched?: Notice[]) => Promise<void>;
  markRead: () => void;
  clearAll: () => void;
}

export const useNoticeStore = create<NoticeStore>((set, get) => ({
  notices: [],
  allNotices: [],
  drafts: [],
  unreadCount: 0,
  isLoading: false,
  isChecking: false,

  fetchForGroup: async (groupId) => {
    set({ isLoading: true });
    try {
      const data = await noticeService.getByGroup(groupId);
      set({ notices: data, isLoading: false });
      return data;
    } catch {
      set({ isLoading: false });
      return [];
    }
  },

  fetchAdminView: async (groupId) => {
    set({ isLoading: true });
    try {
      const data = await noticeService.getAdminView(groupId);
      const drafts = data.filter((n) => !n.isSent);
      set({ allNotices: data, drafts, isLoading: false });
      return data;
    } catch {
      set({ isLoading: false });
      return [];
    }
  },

  createNotice: async (data) => {
    const notice = await noticeService.create(data);
    // Refresh the admin view si tiene groupId
    const { allNotices, drafts } = get();
    const updated = [notice, ...allNotices];
    set({
      allNotices: updated,
      drafts: notice.isSent ? drafts : [notice, ...drafts],
    });
    return notice;
  },

  updateDraft: async (id, data) => {
    const updated = await noticeService.update(id, data);
    set((state) => ({
      allNotices: state.allNotices.map((n) => (n.id === id ? updated : n)),
      drafts: state.drafts.map((n) => (n.id === id ? updated : n)),
    }));
  },

  sendNotice: async (id, groupId) => {
    await noticeService.send(id);
    // Refresh admin view after sending
    await get().fetchAdminView(groupId);
  },

  deactivateNotice: async (id, groupId) => {
    await noticeService.deactivate(id);
    await get().fetchAdminView(groupId);
  },

  checkForNewNotices: async (groupId, prefetched) => {
    if (!groupId || get().isChecking) return;
    set({ isChecking: true });

    try {
      const notices = prefetched ?? await noticeService.getByGroup(groupId);
      const seenIds = await loadSeenIds();

      const newOnes = notices.filter((n) => !seenIds.has(short(n.id)));

      // Marcar todos como vistos (nuevos + existentes)
      notices.forEach((n) => seenIds.add(short(n.id)));
      await saveSeenIds(seenIds);

      if (newOnes.length === 0) return;

      // Incrementar badge
      set((state) => ({ unreadCount: state.unreadCount + newOnes.length }));

      // Agregar al feed local de notificaciones
      const { addNotice } = useNotificationStore.getState();
      newOnes.forEach((n) => {
        addNotice({ title: n.title, body: n.description });
      });

      // Toast resumen
      if (newOnes.length === 1) {
        Toast.show({
          type: "info",
          text1: `📢 ${newOnes[0].title}`,
          text2: newOnes[0].description.slice(0, 80),
          visibilityTime: 5000,
        });
      } else {
        Toast.show({
          type: "info",
          text1: `${newOnes.length} nuevos avisos`,
          text2: "Revisa la sección Avisos",
          visibilityTime: 4000,
        });
      }
    } finally {
      set({ isChecking: false });
    }
  },

  markRead: () => set({ unreadCount: 0 }),

  clearAll: () => {
    set({ notices: [], allNotices: [], drafts: [], unreadCount: 0 });
    SecureStore.deleteItemAsync(SEEN_KEY).catch(() => {});
  },
}));
