import { useQuery  ,  useQueryClient , useMutation } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders.api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

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

export const useAssignDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      ordersApi.assignDriver(orderId, driverId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      toast.success("Driver Assigned", { description: "The order has been assigned to the selected driver." });
    },
  });
};

