import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driversApi } from "@/api/drivers.api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { restaurantsApi } from "@/api/restaurants.api";



export const useDrivers = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.drivers .list(params),
    queryFn: () => driversApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useApproveRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>     driversApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      toast.success("Driver Approved", { description: "The driver    can now go live on the platform." });
    },
  });
};

export const useRejectDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => driversApi.reject(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      toast.success("Driver Rejected", { description: "The driver has been rejected." });
    },
  });
};