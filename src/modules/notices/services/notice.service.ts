import { api } from "../../../services/api";
import { ApiResponse } from "../../../types/api.types";
import { Notice, CreateNoticeInput, UpdateNoticeInput } from "../../../types/notice.types";

export const noticeService = {
  getByGroup: async (groupId: string): Promise<Notice[]> => {
    const response = await api.get<ApiResponse<Notice[]>>(`/notices/group/${groupId}`);
    return response.data.data;
  },

  getAdminView: async (groupId: string): Promise<Notice[]> => {
    const response = await api.get<ApiResponse<Notice[]>>(`/notices/group/${groupId}/admin`);
    return response.data.data;
  },

  create: async (data: CreateNoticeInput): Promise<Notice> => {
    const response = await api.post<ApiResponse<Notice>>("/notices", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateNoticeInput): Promise<Notice> => {
    const response = await api.patch<ApiResponse<Notice>>(`/notices/${id}`, data);
    return response.data.data;
  },

  send: async (id: string): Promise<Notice> => {
    const response = await api.patch<ApiResponse<Notice>>(`/notices/${id}/send`);
    return response.data.data;
  },

  deactivate: async (id: string): Promise<Notice> => {
    const response = await api.patch<ApiResponse<Notice>>(`/notices/${id}/deactivate`);
    return response.data.data;
  },
};
