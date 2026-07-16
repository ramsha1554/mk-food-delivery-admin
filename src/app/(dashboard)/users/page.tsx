"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Phone, Search, Filter, XCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { useUsers } from "@/hooks/api/use-users";
import { SuspendDialog } from "@/components/users/suspend-dialog";
import { User } from "@/types/api";

const SESSION_KEY = "users_table_state";

interface TableState {
  search: string;
  isActive: string;
  pageIndex: number;
}

function loadState(): TableState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { search: "", isActive: "", pageIndex: 0 };
}

function saveState(state: TableState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

function UsersPageContent() {
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const saved = loadState();
    setSearch(urlSearch ?? saved.search);
    setIsActive(saved.isActive);
    setPagination((prev) => ({ ...prev, pageIndex: saved.pageIndex }));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveState({ search, isActive, pageIndex: pagination.pageIndex });
  }, [search, isActive, pagination.pageIndex, initialized]);

  const isFilterActive = !!search.trim() || !!isActive;

  const { data: apiResponse, isLoading } = useUsers({
    role: "customer",
    search: search.trim() || undefined,
  });

  const users = useMemo(() => {
    let data: User[] = (apiResponse?.data ?? []).filter((u) => u.role === "customer");

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((u) => u.name?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q));
    }
    if (isActive !== "") {
      data = data.filter((u) => u.isActive === (isActive === "true"));
    }
    return data;
  }, [apiResponse, search, isActive]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleActiveChange = (value: string) => {
    setIsActive(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleClear = () => {
    setSearch("");
    setIsActive("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "User Details",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{row.original.name?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{row.original.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{row.original._id.slice(-6)}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Contact Info",
        cell: ({ row }) => (
          <div className="flex flex-col text-sm">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-muted-foreground" />
              {row.original.phone}
            </div>
            {row.original.email && <span className="text-xs text-muted-foreground">{row.original.email}</span>}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Join Date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "destructive"} className="font-normal h-5">
            {row.original.isActive ? "Active" : "Blocked"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setSelectedUser(row.original);
                setDialogOpen(true);
              }}
            >
              {row.original.isActive ? "Suspend" : "Reactivate"}
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
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage customer accounts</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9 bg-muted/30 border-border"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 px-3 py-2 rounded-md border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            value={isActive}
            onChange={(e) => handleActiveChange(e.target.value)}
          >
            <option value="">Active/Blocked</option>
            <option value="true">Active Only</option>
            <option value="false">Blocked Only</option>
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
          <div className="p-4 rounded-full bg-muted mb-4 text-muted-foreground">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Filters Selected</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-1">
            Please enter a search term or select a status filter above to load user data.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={false}
        />
      )}

      {selectedUser && (
        <SuspendDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={selectedUser._id}
          userName={selectedUser.name}
          isCurrentlyActive={selectedUser.isActive}
        />
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}>
      <UsersPageContent />
    </Suspense>
  );
}