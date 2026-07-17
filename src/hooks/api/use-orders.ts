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


export const useOrder = (id: string) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
}; // so that the query does not run if id is falsy or undefined



