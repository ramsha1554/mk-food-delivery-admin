"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDrivers } from "@/hooks/api/use-drivers";
import { useAssignDriver } from "@/hooks/api/use-orders";

interface AssignDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export function AssignDriverDialog({
  open,
  onOpenChange,
  orderId,
}: AssignDriverDialogProps) {
  const [driverId, setDriverId] = useState<string>("");

  const { data: driversResponse, isLoading: isLoadingDrivers } = useDrivers({
    status: "approved",
    limit: 100,
  });

  const { mutate, isPending } = useAssignDriver();

  const drivers = (driversResponse?.data ?? []).filter(
    (driver) => driver.isActive && driver.isOnline
  );

  const handleConfirm = () => {
    if (!driverId) return;

    mutate(
      { orderId, driverId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setDriverId("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Manually assign an approved driver to this order. Use this if automatic assignment failed or no driver accepted the broadcast.
          </DialogDescription>
        </DialogHeader>

        <Select
          value={driverId}
          onValueChange={setDriverId}
          disabled={isLoadingDrivers}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isLoadingDrivers ? "Loading drivers..." : "Select a driver"
              }
            />
          </SelectTrigger>

     <SelectContent className="max-h-72">
  {drivers.map((driver) => (
    <SelectItem key={driver._id} value={driver._id} className="py-2.5 pl-3">
      <div className="flex items-center gap-2.5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">{driver.name}</span>
          {driver.vehicleType && (
            <span className="text-xs text-muted-foreground capitalize leading-tight">{driver.vehicleType}</span>
          )}
        </div>
      </div>
    </SelectItem>
  ))}
  {!isLoadingDrivers && drivers.length === 0 && (
    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
      No online, active approved drivers available right now.
    </div>
  )}
</SelectContent>
        </Select>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button onClick={handleConfirm} disabled={isPending || !driverId}>
            {isPending ? "Assigning..." : "Assign Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}