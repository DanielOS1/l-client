import { create } from "zustand";
import { Semester } from "../types/operations.types";
import { semesterService } from "../modules/semester/services/semester.service";

interface SemesterState {
  semesters: Semester[];
  activeSemester: Semester | null;
  isLoading: boolean;
  error: string | null;

  fetchGroupSemesters: (groupId: string) => Promise<void>;
  createSemester: (
    groupId: string,
    name: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  setActiveSemester: (semester: Semester | null) => void;
  getSemesterDetails: (id: string) => Promise<void>;
  deleteSemester: (id: string, groupId: string) => Promise<void>;
}

export const useSemesterStore = create<SemesterState>((set, get) => ({
  semesters: [],
  activeSemester: null,
  isLoading: false,
  error: null,

  fetchGroupSemesters: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const semesters = await semesterService.getByGroupId(groupId);
      set({ semesters, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al obtener semestres",
        isLoading: false,
      });
    }
  },

  createSemester: async (groupId, name, startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      await semesterService.create({ groupId, name, startDate, endDate });
      // Refresh list
      await get().fetchGroupSemesters(groupId);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al crear semestre",
        isLoading: false,
      });
      throw error;
    }
  },

  setActiveSemester: (semester) => {
    set({ activeSemester: semester });
  },

  getSemesterDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const semester = await semesterService.getById(id);
      set({ activeSemester: semester, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          "Error al obtener detalles del semestre",
        isLoading: false,
      });
    }
  },

  deleteSemester: async (id: string, groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      await semesterService.delete(id);
      await get().fetchGroupSemesters(groupId);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al eliminar semestre",
        isLoading: false,
      });
      throw error;
    }
  },
}));
