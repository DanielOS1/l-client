import { api } from "../../../services/api";

export interface Goal {
  id: string;
  name: string;
  description?: string;
  purpose?: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const goalService = {
  // Get active goal for a group
  getActiveGoal: async (groupId: string): Promise<Goal | null> => {
    try {
      const response = await api.get<any>(`/goal/active?groupId=${groupId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
