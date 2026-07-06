export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    statusCode?: number;
}


export interface DashboardStats {
  counters: {
    totalUsers: { value: number; change: string; trend: "up" | "down" };
    activeDrivers: { value: number; change: string; trend: "up" | "down" };
    activeOrders: { value: number; change: string; trend: "up" | "down" };
    totalRevenue: { value: number; change: string; trend: "up" | "down" };
    onlineDriversCount: number;
  };
  orderVolumeChart?: { _id: string; total: number }[];
  recentActivity?: {
    _id: string;
    customer?: { name: string };
    restaurant?: { name: string };
    total: number;
    status: string;
    createdAt: string;
  }[];
}