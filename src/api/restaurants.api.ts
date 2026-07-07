import api from "@/lib/api";
import { Restaurant, PaginatedResponse } from "@/types/api";

export const restaurantsApi = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Restaurant>>("/admin/restaurants", { params });
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch(`/admin/restaurants/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, note: string) => {
    const response = await api.patch(`/admin/restaurants/${id}/reject`, { note });
    return response.data;
  },
};
