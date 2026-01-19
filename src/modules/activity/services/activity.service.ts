import { api } from "../../../services/api";
import { Activity } from "../../../types/operations.types";

export const activityService = {
  // Get activities for a semester
  getBySemesterId: async (semesterId: string): Promise<Activity[]> => {
    const response = await api.get<Activity[]>(
      `/activity?semesterId=${semesterId}`
    );
    return response.data;
  },

  // Create a new activity
  create: async (data: {
    semesterId: string;
    name: string;
    date: string;
    location: string;
    description?: string;
  }): Promise<Activity> => {
    const response = await api.post<Activity>("/activity", data);
    return response.data;
  },

  // Get activity details
  getById: async (id: string): Promise<Activity> => {
    const response = await api.get<Activity>(`/activity/${id}`);
    return response.data;
  },

  // Delete activity
  delete: async (id: string): Promise<void> => {
    await api.delete(`/activity/${id}`);
  },
};
