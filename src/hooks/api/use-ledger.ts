import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ledgerApi } from "@/api/ledger.api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useLedger = (params?: { restaurantId?: string; isPaidOut?: boolean; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.ledger.list(params),
    queryFn: () => ledgerApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useMarkPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: "restaurant" | "driver" }) => ledgerApi.markPaid(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      toast.success("Payout Marked", { description: "The settlement has been recorded as paid." });
    },
  });
};