import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// 


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminAccessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function subscribeToRefresh(cb: (token: string) => void) {
  refreshQueue.push(cb);
}

function resolveRefreshQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("adminRefreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
    { refreshToken },
    { headers: { "ngrok-skip-browser-warning": "true" } }
  );

  const newAccessToken = response.data?.data?.accessToken;
  if (!newAccessToken) throw new Error("Refresh response missing accessToken");

  localStorage.setItem("adminAccessToken", newAccessToken);
  return newAccessToken;
}

function forceLogout() {
  localStorage.removeItem("adminAccessToken");
  localStorage.removeItem("adminRefreshToken");
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}
//

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeToRefresh((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        resolveRefreshQueue(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        refreshQueue = [];
        forceLogout();
        return Promise.reject(error);
      }
    }

    const message = error.response?.data?.message || error.message || "An unexpected error occurred."; //fallback message if none is provided
    const method = error.config?.method?.toUpperCase() ?? "GET";

    if (method === "GET") {
      toast.error("Request Failed", { description: message, id: `api-err-${error.config?.url ?? "unknown"}` });
    } else {
      toast.error("Request Failed", { description: message });
    }

    return Promise.reject(error);
  }
);

export default api;