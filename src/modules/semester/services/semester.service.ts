import { api } from "../../../services/api";
import { Semester } from "../../../types/operations.types";

export const semesterService = {
  // Get semesters for a group
  getByGroupId: async (groupId: string): Promise<Semester[]> => {
    const response = await api.get<Semester[]>(`/semester?groupId=${groupId}`);
    return response.data;
  },

  // Create a new semester
  create: async (data: {
    groupId: string;
    name: string;
    startDate: string;
    endDate: string;
  }): Promise<Semester> => {
    const response = await api.post<Semester>("/semester", data);
    return response.data;
  },

  // Get semester details
  getById: async (id: string): Promise<Semester> => {
    const response = await api.get<Semester>(`/semester/${id}`);
    return response.data;
  },

  // Delete semester
  delete: async (id: string): Promise<void> => {
    await api.delete(`/semester/${id}`);
  },
};
