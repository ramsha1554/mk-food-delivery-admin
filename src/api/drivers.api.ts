import api from "@/lib/api";
import { Driver, DriverDocument, PaginatedResponse, ApiResponse } from "@/types/api";

export const driversApi = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<Driver>>("/admin/drivers", { params });
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch(`/admin/drivers/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, note: string) => {
    const response = await api.patch(`/admin/drivers/${id}/reject`, { note });
    return response.data;
  },

  getDocuments: async (id: string) => {
    const response = await api.get<ApiResponse<DriverDocument[]>>(`/admin/drivers/${id}/documents`);
    return response.data;
  },

  reviewDocument: async (docId: string, approved: boolean, note?: string) => {
    const response = await api.patch(`/admin/documents/${docId}/review`, { approved, note });
    return response.data;
  },
};