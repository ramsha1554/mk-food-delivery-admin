import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders.api";
import { queryKeys } from "@/lib/query-keys";

export const useOrders = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};