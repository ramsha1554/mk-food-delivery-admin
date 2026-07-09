"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/data-table";
import { useDrivers } from "@/hooks/api/use-drivers";
import { Driver } from "@/types/api";
import { cn } from "@/lib/utils";

const SESSION_KEY = "drivers_table_state";

interface TableState {
  search: string;
  driverStatus: string;
  isActive: boolean | undefined;
  isOnline: boolean | undefined;
  pageIndex: number;
}

function loadState(): TableState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { search: "", driverStatus: "", isActive: undefined, isOnline: undefined, pageIndex: 0 };
}

function saveState(state: TableState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

const statusStyles = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export default function DriversPage() {
  const router = useRouter();

  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [driverStatus, setDriverStatus] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    const saved = loadState();
    setSearch(saved.search);
    setDriverStatus(saved.driverStatus);
    setIsActive(saved.isActive);
    setIsOnline(saved.isOnline);
    setPagination((prev) => ({ ...prev, pageIndex: saved.pageIndex }));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveState({ search, driverStatus, isActive, isOnline, pageIndex: pagination.pageIndex });
  }, [search, driverStatus, isActive, isOnline, pagination.pageIndex, initialized]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleStatusChange = (value: string) => {
    setDriverStatus(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleActiveChange = (value: string) => {
    setIsActive(value === "" ? undefined : value === "true");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleOnlineChange = (value: string) => {
    setIsOnline(value === "" ? undefined : value === "true");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleClear = () => {
    setSearch("");
    setDriverStatus("");
    setIsActive(undefined);
    setIsOnline(undefined);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const isFilterActive = !!search.trim() || !!driverStatus || isActive !== undefined || isOnline !== undefined;

  // Only status is a real server-side param per our confirmed API; search/isActive/isOnline are filtered client-side below
  const { data: apiResponse, isLoading } = useDrivers({
    status: driverStatus || undefined,
  });

  const drivers = useMemo(() => {
    let data: Driver[] = apiResponse?.data ?? [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.phone?.toLowerCase().includes(q) ||
          d.vehicleType?.toLowerCase().includes(q)
      );
    }
    if (isActive !== undefined) {
      data = data.filter((d) => d.isActive === isActive);
    }
    if (isOnline !== undefined) {
      data = data.filter((d) => d.isOnline === isOnline);
    }
    return data;
  }, [apiResponse, search, isActive, isOnline]);

  const handleViewDetails = (driver: Driver) => {
    router.push(`/drivers/${driver._id}`);
  };

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Driver Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.phone}</span>
        </div>
      ),
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
      accessorKey: "isOnline",
      header: "Online",
      cell: ({ row }) => (
        <span className={cn("flex items-center gap-1.5 text-xs", row.original.isOnline ? "text-emerald-600" : "text-slate-400")}>
          <span className={cn("w-1.5 h-1.5 rounded-full", row.original.isOnline ? "bg-emerald-500" : "bg-slate-300")} />
          {row.original.isOnline ? "Online" : "Offline"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Join Date",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "driverStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn("font-bold uppercase tracking-wider text-[10px] px-2 py-0.5", statusStyles(row.original.driverStatus))}
        >
          {row.original.driverStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => handleViewDetails(row.original)}>
          <Eye className="w-3.5 h-3.5" />
          view
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
          <p className="text-muted-foreground">Manage and verify your fleet drivers</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-white text-slate-700 border-slate-200">
          Total Drivers: {drivers.length}
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone or vehicle..."
            className="pl-9 bg-slate-50/50 border-slate-100"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 px-3 py-2 rounded-md border border-slate-100 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={driverStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="h-10 px-3 py-2 rounded-md border border-slate-100 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={isActive === undefined ? "" : isActive.toString()}
            onChange={(e) => handleActiveChange(e.target.value)}
          >
            <option value="">Active/Inactive</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <select
            className="h-10 px-3 py-2 rounded-md border border-slate-100 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={isOnline === undefined ? "" : isOnline.toString()}
            onChange={(e) => handleOnlineChange(e.target.value)}
          >
            <option value="">Online/Offline</option>
            <option value="true">Online Now</option>
            <option value="false">Offline</option>
          </select>

          {isFilterActive && (
            <Button variant="ghost" size="sm" className="h-10 text-slate-500 hover:text-slate-700" onClick={handleClear}>
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {!isFilterActive ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="p-4 rounded-full bg-slate-100 mb-4 text-slate-400">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No Filters Selected</h3>
          <p className="text-slate-500 text-center max-w-sm mt-1">
            Please enter a search term or select a filter above to load driver data.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={drivers}
          loading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={false}
        />
      )}
    </div>
  );
}