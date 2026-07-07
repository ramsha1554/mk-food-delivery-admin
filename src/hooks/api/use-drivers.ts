import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driversApi } from "@/api/drivers.api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useDrivers = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.drivers.list(params),
    queryFn: () => driversApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useApproveDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driversApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      toast.success("Driver Approved", { description: "The driver can now go online and accept deliveries." });
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
      toast.success("Driver Rejected", { description: "The applicant has been notified." });
    },
  });
};

export const useDriverDocuments = (driverId: string) => {
  return useQuery({
    queryKey: queryKeys.drivers.detail(driverId),
    queryFn: () => driversApi.getDocuments(driverId),
    enabled: !!driverId,
  });
};

export const useReviewDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, approved, note, driverId }: { docId: string; approved: boolean; note?: string; driverId: string }) =>
      driversApi.reviewDocument(docId, approved, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.detail(variables.driverId) });
      toast.success(variables.approved ? "Document Approved" : "Document Rejected");
    },
  });
};