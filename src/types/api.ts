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

export interface Order {
  _id: string;
  customer?: { _id: string; name: string; phone: string };
  restaurant?: { _id: string; name: string };
  driver?: { _id: string; name: string } | null;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "placed" | "confirmed" | "preparing" | "ready" | "pickup" | "delivered" | "cancelled" | "rejected";
  paymentMethod: "card" | "cod";
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: "customer" | "driver" | "admin";
  isActive: boolean;
  createdAt: string;
  restaurant?: { _id: string; name: string } | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}