import api from "@/lib/api";
import { LedgerEntry, PaginatedResponse } from "@/types/api";

export const ledgerApi = {
  getAll: async (params?: { restaurantId?: string; isPaidOut?: boolean; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<LedgerEntry>>("/admin/ledger", { params });
    return response.data;
  },


  
  markPaid: async (id: string, type: "restaurant" | "driver") => {
    const response = await api.patch(`/admin/ledger/${id}/payout`, { type });
    return response.data;
  },
};