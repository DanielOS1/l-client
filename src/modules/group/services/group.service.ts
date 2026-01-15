import { api } from "../../../services/api";
import { Group, UserGroup } from "../../../types/group.types";

export const groupService = {
  // Get all groups (superuser or test)
  getAll: async (): Promise<Group[]> => {
    const response = await api.get<Group[]>("/groups");
    return response.data;
  },

  // Get groups for a specific user
  getUserGroups: async (userId: string): Promise<Group[]> => {
    const response = await api.get<Group[]>(`/groups/user/${userId}`);
    return response.data;
  },

  // Create a new group
  create: async (data: {
    name: string;
    description?: string;
    createdById: string;
  }): Promise<Group> => {
    const response = await api.post<Group>("/groups", data);
    return response.data;
  },

  // Get group details by ID
  getById: async (id: string): Promise<Group> => {
    const response = await api.get<Group>(`/groups/${id}`);
    return response.data;
  },

  // Create a new role for a group
  createRole: async (data: {
    groupId: string;
    name: string;
    description?: string;
  }): Promise<any> => {
    const response = await api.post("/group-roles", data);
    return response.data;
  },

  // Search user by email
  searchUserByEmail: async (email: string): Promise<any> => {
    const response = await api.get(`/users/search?email=${email}`);
    return response.data;
  },

  // Add member to group
  addMember: async (
    groupId: string,
    userId: string,
    assignedByUserId: string
  ): Promise<any> => {
    const response = await api.post(`/groups/${groupId}/add-member`, {
      userId,
      assignedByUserId,
    });
    return response.data;
  },
};
