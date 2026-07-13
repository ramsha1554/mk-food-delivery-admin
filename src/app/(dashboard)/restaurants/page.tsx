"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, XCircle, Store, Clock } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { useRestaurants } from "@/hooks/api/use-restaurants";
import { useDashboardStats } from "@/hooks/api/use-stats";
import { ApprovalDialog } from "@/components/restaurants/approval-dialog";
import { Restaurant } from "@/types/api";
import { cn } from "@/lib/utils";

const SESSION_KEY = "restaurants_table_state";

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
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject">("approve");
  const [selected, setSelected] = useState<Restaurant | null>(null);

  useEffect(() => {
    const saved = loadState();
    setSearch(saved.search);
    setStatus(saved.status);
    setPagination((prev) => ({ ...prev, pageIndex: saved.pageIndex }));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveState({ search, status, pageIndex: pagination.pageIndex });
  }, [search, status, pagination.pageIndex, initialized]);

  const isFilterActive = !!search.trim() || !!status;

  const { data: statsResponse } = useDashboardStats();
  const stats = statsResponse?.data;

  const { data: apiResponse, isLoading } = useRestaurants({ status: status || undefined });

  const restaurants = useMemo(() => {
    let data: Restaurant[] = apiResponse?.data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.owner?.name?.toLowerCase().includes(q) ||
          r.owner?.phone?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [apiResponse, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleClear = () => {
    setSearch("");
    setStatus("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

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
            <span className="text-xs text-muted-foreground">
              {row.original.cuisineType?.join(", ") ?? "—"}
            </span>
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
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => {
          const addr = row.original.address;
          const formatted = addr ? [addr.street, addr.city, addr.postcode].filter(Boolean).join(", ") : "—";
          return <span className="text-sm text-muted-foreground">{formatted}</span>;
        },
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

      <div className="flex items-stretch bg-card border border-border rounded-2xl shadow-sm divide-x divide-border">
        {[
          { label: "Total Restaurants", value: stats?.totalRestaurants, icon: Store },
          { label: "Pending Approvals", value: stats?.pendingRestaurantApprovals, icon: Clock },
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
            placeholder="Search by restaurant, owner name or phone..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
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
            Please enter a search term or select a status filter above to load restaurant data.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={restaurants}
          loading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={false}
        />
      )}

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