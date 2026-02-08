import { create } from "zustand";
import { Activity } from "../types/operations.types";
import { activityService } from "../modules/activity/services/activity.service";
import { assignmentService } from "../modules/activity/services/assignment.service";

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
    description?: string,
    activityPositions?: { positionId: string; quantity: number }[]
  ) => Promise<void>;
  setActiveActivity: (activity: Activity | null) => void;
  getActivityDetails: (id: string) => Promise<void>;
  deleteActivity: (id: string, semesterId: string) => Promise<void>;
  
  // Assignment Actions
  assignMember: (activityId: string, positionId: string, userId: string) => Promise<void>;
  removeAssignment: (assignmentId: string, activityId: string) => Promise<void>;
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

  createActivity: async (semesterId, name, date, location, description, activityPositions) => {
    set({ isLoading: true, error: null });
    try {
      await activityService.create({
        semesterId,
        name,
        date,
        location,
        description,
        activityPositions,
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

  assignMember: async (activityId, positionId, userId) => {
      set({ isLoading: true, error: null });
      try {
          await assignmentService.create({ activityId, positionId, userId });
          // Refresh details to show new assignment
          await get().getActivityDetails(activityId);
      } catch (error: any) {
           set({
            error: error.response?.data?.message || "Error al asignar miembro",
            isLoading: false,
          });
          throw error;
      }
  },

  removeAssignment: async (assignmentId, activityId) => {
      set({ isLoading: true, error: null });
      try {
          await assignmentService.delete(assignmentId);
           // Refresh details
           await get().getActivityDetails(activityId);
      } catch (error: any) {
          set({
            error: error.response?.data?.message || "Error al eliminar asignación",
            isLoading: false,
          });
          throw error;
      }
  }
}));
