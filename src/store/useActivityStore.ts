import { create } from "zustand";
import { Activity } from "../types/operations.types";
import { activityService } from "../modules/activity/services/activity.service";

interface ActivityState {
  activities: Activity[];
  activeActivity: Activity | null;
  isLoading: boolean;
  error: string | null;

  fetchSemesterActivities: (semesterId: string) => Promise<void>;
  createActivity: (
    semesterId: string,
    name: string,
    date: string,
    location: string,
    description?: string
  ) => Promise<void>;
  setActiveActivity: (activity: Activity | null) => void;
  getActivityDetails: (id: string) => Promise<void>;
  deleteActivity: (id: string, semesterId: string) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  activeActivity: null,
  isLoading: false,
  error: null,

  fetchSemesterActivities: async (semesterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const activities = await activityService.getBySemesterId(semesterId);
      set({ activities, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al obtener actividades",
        isLoading: false,
      });
    }
  },

  createActivity: async (semesterId, name, date, location, description) => {
    set({ isLoading: true, error: null });
    try {
      await activityService.create({
        semesterId,
        name,
        date,
        location,
        description,
      });
      // Refresh list
      await get().fetchSemesterActivities(semesterId);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al crear actividad",
        isLoading: false,
      });
      throw error;
    }
  },

  setActiveActivity: (activity) => {
    set({ activeActivity: activity });
  },

  getActivityDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const activity = await activityService.getById(id);
      set({ activeActivity: activity, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          "Error al obtener detalles de la actividad",
        isLoading: false,
      });
    }
  },

  deleteActivity: async (id: string, semesterId: string) => {
    set({ isLoading: true, error: null });
    try {
      await activityService.delete(id);
      await get().fetchSemesterActivities(semesterId);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al eliminar actividad",
        isLoading: false,
      });
      throw error;
    }
  },
}));
