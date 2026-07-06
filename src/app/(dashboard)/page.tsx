"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bike, Navigation, Store, Package, ClipboardList, Activity } from "lucide-react";
import { useDashboardStats } from "@/hooks/api/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: apiResponse, isLoading, isError } = useDashboardStats();
  const stats = apiResponse?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Activity className="w-12 h-12 text-destructive opacity-50" />
        <h2 className="text-xl font-semibold">Failed to load dashboard data</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please check your connection or try again later.
        </p>
      </div>
    );
  }

  const metricCards = [
    { title: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-blue-600" },
    { title: "Total Drivers", value: stats.totalDrivers, icon: Bike, color: "text-green-600" },
    { title: "Active Drivers", value: stats.activeDrivers, icon: Navigation, color: "text-emerald-600" },
    { title: "Total Restaurants", value: stats.totalRestaurants, icon: Store, color: "text-purple-600" },
    { title: "Active Orders", value: stats.activeOrders, icon: Package, color: "text-orange-600" },
    { title: "Total Orders", value: stats.totalOrders, icon: ClipboardList, color: "text-slate-600" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        {(stats.pendingDriverApprovals > 0 || stats.pendingRestaurantApprovals > 0) && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            {stats.pendingDriverApprovals > 0 && (
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {stats.pendingDriverApprovals} driver approval{stats.pendingDriverApprovals > 1 ? "s" : ""} pending
              </span>
            )}
            {stats.pendingRestaurantApprovals > 0 && (
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {stats.pendingRestaurantApprovals} restaurant approval{stats.pendingRestaurantApprovals > 1 ? "s" : ""} pending
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-slate-100 ${metric.color}`}>
                <metric.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}