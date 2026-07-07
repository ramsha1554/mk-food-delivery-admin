import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users.api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useUsers = (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive, reason }: { id: string; isActive: boolean; reason?: string }) =>
      usersApi.updateStatus(id, isActive, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      toast.success(variables.isActive ? "User Reactivated" : "User Suspended", {
        description: `Account has been ${variables.isActive ? "reactivated" : "suspended"} successfully.`,
      });
    },
  });
};