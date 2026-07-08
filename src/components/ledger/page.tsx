"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { useLedger } from "@/hooks/api/use-ledger";
import { MarkPaidDialog } from "@/components/ledger/mark-paid-dialog";
import { LedgerEntry } from "@/types/api";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Unpaid", value: "false" },
  { label: "Paid", value: "true" },
  { label: "All", value: "" },
];

export default function LedgerPage() {
  const [isPaidOut, setIsPaidOut] = useState("false");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<LedgerEntry | null>(null);

  const { data: apiResponse, isLoading } = useLedger({
    isPaidOut: isPaidOut === "" ? undefined : isPaidOut === "true",
  });
  const entries = apiResponse?.data ?? [];

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

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setIsPaidOut(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              isPaidOut === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={entries} loading={isLoading} />

      {selected && <MarkPaidDialog open={dialogOpen} onOpenChange={setDialogOpen} entry={selected} />}
    </div>
  );
}