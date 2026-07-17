import api from "@/lib/api";
import { ApiResponse, Order, PaginatedResponse } from "@/types/api";

export const ordersApi = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Order>>("/admin/orders", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },
};

