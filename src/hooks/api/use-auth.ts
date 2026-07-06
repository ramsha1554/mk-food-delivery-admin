import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => authApi.requestOtp(phone),
    onSuccess: () => {
      toast.success("OTP Sent", { description: "A one-time password has been sent to your phone." });
    },
  });

const verifyOtpMutation = useMutation({
  mutationFn: ({ phone, otp }: { phone: string; otp: string }) => authApi.verifyOtp(phone, otp),
  onSuccess: (response) => {
    if (response.success && response.data) {
      localStorage.setItem("adminAccessToken", response.data.accessToken);
      localStorage.setItem("adminRefreshToken", response.data.refreshToken);
      document.cookie = `adminAccessToken=${response.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      queryClient.setQueryData(queryKeys.auth.me, { success: true, data: response.data.user });
      toast.success("Logged In", { description: "Welcome back! Redirecting to dashboard…" });
      setTimeout(() => router.push("/"), 1200);
    }
  },
});

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      localStorage.removeItem("adminAccessToken");
      document.cookie = "adminAccessToken=; path=/; max-age=0; samesite=lax";
      localStorage.removeItem("adminRefreshToken");
      queryClient.clear();
      router.push("/login");
    },
  });

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("adminAccessToken"),
  });

  return {
    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    logout: logoutMutation.mutate,
    user: meQuery.data?.data,
    isLoadingUser: meQuery.isLoading,
  };
};