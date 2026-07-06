import api from "@/lib/api";
import { Order, PaginatedResponse } from "@/types/api";

export const ordersApi = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Order>>("/admin/orders", { params });
    return response.data;
  },
};