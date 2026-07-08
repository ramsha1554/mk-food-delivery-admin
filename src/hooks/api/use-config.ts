import { useQuery } from "@tanstack/react-query";
import { configApi } from "@/api/config.api";
import { queryKeys } from "@/lib/query-keys";

export const usePlatformConfig = () => {
  return useQuery({
    queryKey: queryKeys.config.all,
    queryFn: configApi.get,
  });
};