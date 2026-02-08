import { api } from "../../../services/api";
import { Assignment } from "../../../types/operations.types";
import { ApiResponse } from "../../../types/api.types";

export const assignmentService = {
  // Create a new assignment
  create: async (data: {
    activityId: string;
    positionId: string;
    userId: string;
    notes?: string;
  }): Promise<Assignment> => {
    const response = await api.post<ApiResponse<Assignment>>("/assignment", data);
    return response.data.data;
  },

  // Delete an assignment
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/assignment/${id}`);
  },
};
