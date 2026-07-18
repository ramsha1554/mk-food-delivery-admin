import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/api/stats.api";

import { queryKeys } from "@/lib/query-keys";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.stats.dashboard,

    queryFn: statsApi.getDashboardStats,
  });
};
