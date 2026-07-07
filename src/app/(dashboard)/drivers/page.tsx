"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { useDrivers } from "@/hooks/api/use-drivers";
import { Driver } from "@/types/api";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function DriversPage() {
  const [status, setStatus] = useState("pending");
  const { data: apiResponse, isLoading } = useDrivers({ status: status || undefined });
  const drivers = apiResponse?.data ?? [];

  const columns: ColumnDef<Driver>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Driver",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "vehicleType",
        header: "Vehicle",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.vehicleType ?? "—"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Applied",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      },
     {
  accessorKey: "driverStatus",
  header: "Status",
  cell: ({ row }) => (
    <Badge variant={statusVariant(row.original.driverStatus) as any} className="capitalize">
      {row.original.driverStatus}
    </Badge>
  ),
},
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button asChild size="sm" variant="outline" className="h-7 text-xs">
              <Link href={`/drivers/${row.original._id}`}>Review</Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
        <p className="text-muted-foreground">Review applications, documents, and manage partners</p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              status === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={drivers} loading={isLoading} />
    </div>
  );
}