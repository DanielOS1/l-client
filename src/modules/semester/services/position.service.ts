import { api } from "../../../services/api";
import { Position } from "../../../types/operations.types";
import { ApiResponse } from "../../../types/api.types";

export const positionService = {
  // Get all positions for a semester
  getBySemesterId: async (semesterId: string): Promise<Position[]> => {
    // Assuming backend endpoint is /position?semesterId=... or similar
    // Need to verify backend route. Usually generic CRUD or specific.
    // Based on backend structure, Position controller likely exists.
    const response = await api.get<ApiResponse<Position[]>>(
      `/position?semesterId=${semesterId}`
    );
    return response.data.data;
  },

  // Create a new position
  create: async (data: {
    semesterId: string;
    name: string;
    description?: string;
  }): Promise<Position> => {
    const response = await api.post<ApiResponse<Position>>("/position", data);
    return response.data.data;
  },

  // Update a position
  update: async (id: string, data: Partial<Position>): Promise<Position> => {
    const response = await api.patch<ApiResponse<Position>>(`/position/${id}`, data);
    return response.data.data;
  },

  // Delete a position
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/position/${id}`);
  },
};
