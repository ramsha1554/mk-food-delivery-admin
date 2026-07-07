import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantsApi } from "@/api/restaurants.api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useRestaurants = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.restaurants.list(params),
    queryFn: () => restaurantsApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useApproveRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restaurantsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      toast.success("Restaurant Approved", { description: "The restaurant can now go live on the platform." });
    },
  });
};

export const useRejectRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => restaurantsApi.reject(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      toast.success("Restaurant Rejected", { description: "The restaurant has been rejected." });
    },
  });
};