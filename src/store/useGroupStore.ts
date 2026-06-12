import { create } from "zustand";
import { Group } from "../types/group.types";
import { groupService } from "../modules/group/services/group.service";

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  isLoading: boolean;
  error: string | null;

  fetchUserGroups: (userId: string) => Promise<void>;
  createGroup: (name: string, description: string, userId: string) => Promise<void>;
  setActiveGroup: (group: Group | null) => void;
  getGroupDetails: (groupId: string) => Promise<void>;
  assignRole: (groupId: string, userId: string, roleId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  isLoading: false,
  error: null,

  fetchUserGroups: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const groups = await groupService.getUserGroups(userId);
      set({ groups, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al obtener grupos",
        isLoading: false,
      });
      console.error("Fetch Groups Error:", error);
    }
  },

  createGroup: async (name, description, userId) => {
    set({ isLoading: true, error: null });
    try {
      const newGroup = await groupService.create({
        name,
        description,
        createdById: userId,
      });
      // Update list
      const currentGroups = get().groups;
      set({ groups: [...currentGroups, newGroup], isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al crear grupo",
        isLoading: false,
      });
      throw error;
    }
  },

  setActiveGroup: (group) => {
    set({ activeGroup: group });
  },

  getGroupDetails: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const group = await groupService.getById(groupId);
      set({ activeGroup: group, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al obtener detalles del grupo",
        isLoading: false,
      });
    }
  },

  assignRole: async (groupId: string, userId: string, roleId: string) => {
    set({ isLoading: true, error: null });
    try {
      const group = await groupService.assignRole(groupId, userId, roleId);
      set({ activeGroup: group, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al asignar rol",
        isLoading: false,
      });
      throw error;
    }
  },

  removeMember: async (groupId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.removeMember(groupId, userId);
      const group = await groupService.getById(groupId);
      set({ activeGroup: group, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al remover miembro",
        isLoading: false,
      });
      throw error;
    }
  },
}));
