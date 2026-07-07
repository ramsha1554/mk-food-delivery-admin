import api from "@/lib/api";
import { User, PaginatedResponse } from "@/types/api";

export const usersApi = {
  getAll: async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<User>>("/admin/users", { params });
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean, reason?: string) => {
    const response = await api.patch(`/admin/${id}/status`, { isActive, reason });
    return response.data;
  },
};