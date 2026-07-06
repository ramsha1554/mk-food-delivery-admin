import api from "@/lib/api";
import { ApiResponse } from "@/types/api";

export interface User {
  _id: string;
  name: string;
  phone: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  requestOtp: async (phone: string) => {
    const response = await api.post<ApiResponse<void>>("/auth/request-otp", { phone, role: "admin" });
    return response.data;
  },

  verifyOtp: async (phone: string, code: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/verify-otp", { phone, code });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh-token", { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<void>>("/auth/logout");
    return response.data;
  },

  me: async () => {
    const response = await api.get<ApiResponse<User>>("/users/me");
    return response.data;
  },
};