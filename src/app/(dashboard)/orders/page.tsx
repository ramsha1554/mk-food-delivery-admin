


"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, XCircle, ShoppingBag, ClipboardList, Bike } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { useOrders } from "@/hooks/api/use-orders";
import { useDashboardStats } from "@/hooks/api/use-stats";
import { Order } from "@/types/api";
import { cn } from "@/lib/utils";

const SESSION_KEY = "orders_table_state";

interface TableState {
  search: string;
  status: string;
  pageIndex: number;
}

function loadState(): TableState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { search: "", status: "", pageIndex: 0 };
}

function saveState(state: TableState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

const PAGE_SIZE = 20;

const statusVariant = (status: string) => {
  switch (status) {
    case "delivered":
      return "default";
    case "cancelled":
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function OrdersPage() {
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  

  useEffect(() => {
    const saved = loadState();
    setSearch(saved.search);
    setStatus(saved.status);
    setPageIndex(saved.pageIndex);
    setInitialized(true);
  
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveState({ search, status, pageIndex });
  }, [search, status, pageIndex, initialized]);

  const isFilterActive = !!search.trim() || !!status;

  const { data: statsResponse } = useDashboardStats();
  const stats = statsResponse?.data;

  const { data: apiResponse, isLoading } = useOrders({
    status: status || undefined,
    page: pageIndex + 1,
    limit: PAGE_SIZE,
  });

  const orders = useMemo(() => {
    let data: Order[] = apiResponse?.data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.restaurant?.name?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [apiResponse, search]);

  const totalPages = apiResponse?.pagination?.pages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPageIndex(0);
  };
  const handleClear = () => {
    setSearch("");
    setStatus("");
    setPageIndex(0);
  };

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "Order ID",
        cell: ({ row }) => <span className="font-mono text-xs">#{row.original._id.slice(-6)}</span>,
      },
  

 
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => row.original.customer?.name ?? "Unknown",
      },
      {
        accessorKey: "restaurant",
        header: "Restaurant",
        cell: ({ row }) => row.original.restaurant?.name ?? "Unknown",
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => `£${row.original.total.toFixed(2)}`,
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] uppercase">
            {row.original.paymentMethod}
          </Badge>
        ),
      },
    

      {
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => (
    <Badge variant={statusVariant(row.original.status) as any} className="text-[10px] capitalize">
      {row.original.status.replace("_", " ")}
    </Badge>
  ),
},


      {
        accessorKey: "createdAt",
        header: "Placed",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
      },

      


      
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Monitoring</h1>
        <p className="text-muted-foreground">Monitor real-time and historical order activity</p>
      </div>

    <div className="flex items-stretch bg-card border border-border rounded-2xl shadow-sm divide-x divide-border">
  {[
    { label: "Active Orders", value: stats?.activeOrders, icon: ShoppingBag },
    { label: "Total Orders", value: stats?.totalOrders, icon: ClipboardList },
    { label: "Active Drivers", value: stats?.activeDrivers, icon: Bike },
  ].map((metric) => (
    <div key={metric.label} className="flex-1 flex items-center gap-3 px-6 py-4">
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        <metric.icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{metric.label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{metric.value ?? "—"}</p>
      </div>
    </div>
  ))}
</div>









      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, customer or restaurant..."
            className="pl-9 bg-muted/30 border-border"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 px-3 py-2 rounded-md border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="picked_up">Pickup</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          {isFilterActive && (
            <Button variant="ghost" size="sm" className="h-10 text-muted-foreground hover:text-foreground" onClick={handleClear}>
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {!isFilterActive ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
          <div className="p-4 rounded-full bg-slate-100 mb-4 text-muted-foreground">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Filters Selected</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-1">
            Please enter an Order ID or select a status filter above to load order data.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          manualPagination
          pageCount={totalPages}
          pagination={{ pageIndex, pageSize: PAGE_SIZE }}
          onPaginationChange={(updater) => {
            const next = typeof updater === "function" ? updater({ pageIndex, pageSize: PAGE_SIZE }) : updater;
            setPageIndex(next.pageIndex);
          }}
        />
      )}
    </div>
  );
}