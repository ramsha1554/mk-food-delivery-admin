import api from "@/lib/api";
import { ApiResponse, DashboardStats } from "@/types/api";

export const statsApi = {
  getDashboardStats: async () => {
    const response = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
    return response.data;
  },
};