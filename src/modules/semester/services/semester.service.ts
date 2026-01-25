import { api } from "../../../services/api";
import { Semester } from "../../../types/operations.types";
import { ApiResponse } from "../../../types/api.types";

export const semesterService = {
  // Get semesters for a group
  getByGroupId: async (groupId: string): Promise<Semester[]> => {
    const response = await api.get<ApiResponse<Semester[]>>(
      `/semester?groupId=${groupId}`,
    );
    return response.data.data;
  },

  // Create a new semester
  create: async (data: {
    groupId: string;
    name: string;
    startDate: string;
    endDate: string;
  }): Promise<Semester> => {
    const response = await api.post<ApiResponse<Semester>>("/semester", data);
    return response.data.data;
  },

  // Get semester details
  getById: async (id: string): Promise<Semester> => {
    const response = await api.get<ApiResponse<Semester>>(`/semester/${id}`);
    return response.data.data;
  },

  // Delete semester
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/semester/${id}`);
  },
};
