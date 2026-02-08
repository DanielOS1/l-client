import { api } from "../../../services/api";
import { Group } from "../../../types/group.types";
import { ApiResponse } from "../../../types/api.types";

export const groupService = {
  // Get all groups (superuser or test)
  getAll: async (): Promise<Group[]> => {
    const response = await api.get<ApiResponse<Group[]>>("/groups");
    return response.data.data;
  },

  // Get groups for a specific user
  getUserGroups: async (userId: string): Promise<Group[]> => {
    const response = await api.get<ApiResponse<Group[]>>(
      `/groups/user/${userId}`,
    );
    return response.data.data;
  },

  // Create a new group
  create: async (data: {
    name: string;
    description?: string;
    createdById: string;
  }): Promise<Group> => {
    const response = await api.post<ApiResponse<Group>>("/groups", data);
    return response.data.data;
  },

  // Get group details by ID
  getById: async (id: string): Promise<Group> => {
    const response = await api.get<ApiResponse<Group>>(`/groups/${id}`);
    return response.data.data;
  },

  // Create a new role for a group
  createRole: async (data: {
    groupId: string;
    name: string;
    description?: string;
    level: number;
  }): Promise<any> => {
    const response = await api.post<ApiResponse<any>>("/group-roles", data);
    return response.data.data;
  },

  // Search user by email
  searchUserByEmail: async (email: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(
      `/users/search?email=${email}`,
    );
    return response.data.data;
  },

  // Add member to group
  addMember: async (
    groupId: string,
    userId: string,
    assignedByUserId: string,
  ): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(
      `/groups/${groupId}/add-member`,
      {
        userId,
        assignedByUserId,
      },
    );
    return response.data.data;
  },
};
