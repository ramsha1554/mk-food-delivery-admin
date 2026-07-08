"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { useRestaurants } from "@/hooks/api/use-restaurants";
import { ApprovalDialog } from "@/components/restaurants/approval-dialog";
import { Restaurant } from "@/types/api";
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

export default function RestaurantsPage() {
  const [status, setStatus] = useState("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject">("approve");
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const { data: apiResponse, isLoading } = useRestaurants({ status: status || undefined });
  const restaurants = apiResponse?.data ?? [];

  const openDialog = (restaurant: Restaurant, mode: "approve" | "reject") => {
    setSelected(restaurant);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const columns: ColumnDef<Restaurant>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Restaurant",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.cuisineType ?? "—"}</span>
          </div>
        ),
      },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <div className="flex flex-col text-sm">
            <span>{row.original.owner?.name ?? "Unknown"}</span>
            <span className="text-xs text-muted-foreground">{row.original.owner?.phone ?? ""}</span>
          </div>
        ),
      },
      {
        // accessorKey: "address",
        // header: "Address",
        // cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.address ?? "—"}</span>,

       
  // accessorKey: "address",
  // header: "Address",
  // cell: ({ row }) => {
  //   const addr = row.original.address;
  //   const formatted = addr ? [addr.street, addr.city, addr.postcode].filter(Boolean).join(", ") : "—";
  //   return <span className="text-sm text-muted-foreground">{formatted}</span>;
  // },

  
  accessorKey: "name",
  header: "Restaurant",
  cell: ({ row }) => (
    <div className="flex flex-col">
      <span className="font-medium">{row.original.name}</span>
      <span className="text-xs text-muted-foreground">
        {row.original.cuisineType?.join(", ") ?? "—"}
      </span>
    </div>
  ),


      },
      {
        accessorKey: "createdAt",
        header: "Applied",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status) as any} className="capitalize">
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {row.original.status === "pending" && (
              <>
                <Button size="sm" className="h-7 text-xs" onClick={() => openDialog(row.original, "approve")}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={() => openDialog(row.original, "reject")}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-muted-foreground">Review applications and manage active partners</p>
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

      <DataTable columns={columns} data={restaurants} loading={isLoading} />

      {selected && (
        <ApprovalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          restaurantId={selected._id}
          restaurantName={selected.name}
          mode={dialogMode}
        />
      )}
    </div>
  );
}