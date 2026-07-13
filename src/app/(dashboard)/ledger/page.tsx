
"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, XCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { useLedger } from "@/hooks/api/use-ledger";
import { MarkPaidDialog } from "@/components/ledger/mark-paid-dialog";
import { LedgerEntry } from "@/types/api";

const SESSION_KEY = "ledger_table_state";

interface TableState {
  search: string;
  isPaidOut: string;
  pageIndex: number;
}

function loadState(): TableState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { search: "", isPaidOut: "", pageIndex: 0 };
}

function saveState(state: TableState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

export default function LedgerPage() {
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [isPaidOut, setIsPaidOut] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<LedgerEntry | null>(null);

  useEffect(() => {
    const saved = loadState();
    setSearch(saved.search);
    setIsPaidOut(saved.isPaidOut);
    setPagination((prev) => ({ ...prev, pageIndex: saved.pageIndex }));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveState({ search, isPaidOut, pageIndex: pagination.pageIndex });
  }, [search, isPaidOut, pagination.pageIndex, initialized]);

  const isFilterActive = !!search.trim() || !!isPaidOut;

  const { data: apiResponse, isLoading } = useLedger({
    isPaidOut: isPaidOut === "" ? undefined : isPaidOut === "true",
  });

  const entries = useMemo(() => {
    let data: LedgerEntry[] = apiResponse?.data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (e) =>
          e.restaurant?.name?.toLowerCase().includes(q) ||
          e.driver?.name?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [apiResponse, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleFilterChange = (value: string) => {
    setIsPaidOut(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleClear = () => {
    setSearch("");
    setIsPaidOut("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns: ColumnDef<LedgerEntry>[] = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.type}
          </Badge>
        ),
      },
      {
        id: "recipient",
        header: "Recipient",
        cell: ({ row }) => {
          const name =
            row.original.type === "restaurant" ? row.original.restaurant?.name : row.original.driver?.name;
          return <span className="font-medium">{name ?? "Unknown"}</span>;
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="font-medium">£{row.original.amount.toFixed(2)}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      },
      {
        accessorKey: "isPaidOut",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isPaidOut ? "default" : "secondary"}>
            {row.original.isPaidOut ? "Paid" : "Unpaid"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            {!row.original.isPaidOut && (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setSelected(row.original);
                  setDialogOpen(true);
                }}
              >
                Mark Paid
              </Button>
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
        <h1 className="text-3xl font-bold tracking-tight">Virtual Ledger</h1>
        <p className="text-muted-foreground">Track and settle payouts to restaurants and drivers</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by restaurant or driver name..."
            className="pl-9 bg-muted/30 border-border"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 px-3 py-2 rounded-md border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={isPaidOut}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="false">Unpaid</option>
            <option value="true">Paid</option>
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
            Please enter a search term or select a payout status filter above to load ledger data.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={entries}
          loading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={false}
        />
      )}

      {selected && <MarkPaidDialog open={dialogOpen} onOpenChange={setDialogOpen} entry={selected} />}
    </div>
  );
}