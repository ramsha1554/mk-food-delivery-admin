

import api from "@/lib/api";
import { ApiResponse, PlatformConfig } from "@/types/api";

export const configApi = {
  get: async () => {
    const response = await api.get<ApiResponse<PlatformConfig>>("/admin/config");
    return response.data;
  },
};