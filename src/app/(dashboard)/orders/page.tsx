"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { useOrders } from "@/hooks/api/use-orders";
import { Order } from "@/types/api";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

const statusColor = (status: string) => {
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
  const [status, setStatus] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const { data: apiResponse, isLoading } = useOrders({
    status: status || undefined,
    page: pageIndex + 1,
    limit: PAGE_SIZE,
  });

  const orders = apiResponse?.data ?? [];
 const totalPages = apiResponse?.pagination?.pages ?? 1;

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
          <Badge variant={statusColor(row.original.status) as any} className="text-[10px] capitalize">
            {row.original.status}
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
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Live and historical order monitoring</p>
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-col md:flex-row gap-4">
          <select
            className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPageIndex(0);
            }}
          >
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="pickup">Pickup</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          {status && (
            <Button variant="ghost" size="sm" className="h-10 text-slate-500" onClick={() => setStatus("")}>
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}