"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { useUsers } from "@/hooks/api/use-users";
import { SuspendDialog } from "@/components/users/suspend-dialog";
import { User } from "@/types/api";

export default function UsersPage() {
  const { data: apiResponse, isLoading } = useUsers({ role: "customer" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // const users = useMemo(() => apiResponse?.data ?? [], [apiResponse]);

  const users = useMemo(
  () => (apiResponse?.data ?? []).filter((u) => u.role === "customer"),
  [apiResponse]
);


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
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.role}
          </Badge>
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
        <p className="text-muted-foreground">Manage customer and driver accounts</p>
      </div>

      <DataTable columns={columns} data={users} searchKey="name" loading={isLoading} />

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

