import { api } from "../../../services/api";
import { Activity } from "../../../types/operations.types";
import { ApiResponse } from "../../../types/api.types";

export const activityService = {
  // Get activities for a semester
  getBySemesterId: async (semesterId: string): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>(
      `/activity?semesterId=${semesterId}`,
    );
    return response.data.data;
  },

  // Create a new activity
  create: async (data: {
    semesterId: string;
    name: string;
    date: string;
    location: string;
    description?: string;
    activityPositions?: { positionId: string; quantity: number }[];
  }): Promise<Activity> => {
    const response = await api.post<ApiResponse<Activity>>("/activity", data);
    return response.data.data;
  },

  // Get activity details
  getById: async (id: string): Promise<Activity> => {
    const response = await api.get<ApiResponse<Activity>>(`/activity/${id}`);
    return response.data.data;
  },

  // Delete activity
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/activity/${id}`);
  },
};
