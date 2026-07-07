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



export interface Restaurant {
  _id: string;
  name: string;
  owner ?:{



  _id: string; name: string; phone: string } ;


address?: {
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
};
  cuisineType: string;
  status : "pending" | "approved" | "rejected";

  isOpen : boolean;
 
  updatedAt: string;
  deliveryFee ?: number;
  minimumOrderValue ?: number;


   createdAt: string;
}



export interface Driver {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  driverStatus: "pending" | "approved" | "rejected";
  isOnline: boolean;
  vehicleType?: "bicycle" | "car" | "motorcycle" | "van";
  createdAt: string;
}

export interface DriverDocument {
  _id: string;
  type: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  uploadedAt: string;
}
  

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
}