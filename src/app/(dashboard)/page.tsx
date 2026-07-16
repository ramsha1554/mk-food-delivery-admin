
"use client";

import Link from "next/link";
import {
  Users,
  Bike,
  Navigation,
  Store,
  Package,
  ClipboardList,
  Activity,
  ArrowUpRight,
  ClipboardCheck,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/api/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: apiResponse, isLoading, isError } = useDashboardStats();
  const stats = apiResponse?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Activity className="w-12 h-12 text-slate-300" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load dashboard data</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please check your connection or try again later.
        </p>
      </div>
    );
  }

  const kpis = [
    { label: "Customers", value: stats.totalCustomers, icon: Users },
    { label: "Total Drivers", value: stats.totalDrivers, icon: Bike },
    { label: "Active Drivers", value: stats.activeDrivers, icon: Navigation },
    { label: "Restaurants", value: stats.totalRestaurants, icon: Store },
    { label: "Active Orders", value: stats.activeOrders, icon: Package },
    { label: "Total Orders", value: stats.totalOrders, icon: ClipboardList },
  ];

  const pendingItems = [
    stats.pendingDriverApprovals > 0
      ? { label: "Driver application", count: stats.pendingDriverApprovals, href: "/drivers?status=pending" }
      : null,
    stats.pendingRestaurantApprovals > 0
      ? { label: "Restaurant application", count: stats.pendingRestaurantApprovals, href: "/restaurants?status=pending" }
      : null,
  ].filter((item): item is { label: string; count: number; href: string } => item !== null);

  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Platform activity at a glance</p>
      </div>

      
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl shadow-sm p-4">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground mb-3">
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">{kpi.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Two-panel body */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Approvals */}
        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-500" />
              Pending Approvals
            </h3>
            {pendingItems.length > 0 && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {pendingItems.reduce((sum, i) => sum + i.count, 0)} total
              </span>
            )}
          </div>
          {pendingItems.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nothing pending — you're all caught up.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-muted transition-colors"
                >
                  <span className="text-foreground">
                    <span className="font-semibold text-foreground">{item.count}</span> {item.label}
                    {item.count > 1 ? "s" : ""} awaiting review
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}