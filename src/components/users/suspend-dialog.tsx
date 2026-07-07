"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateUserStatus } from "@/hooks/api/use-users";

interface SuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  isCurrentlyActive: boolean;
}

export function SuspendDialog({ open, onOpenChange, userId, userName, isCurrentlyActive }: SuspendDialogProps) {
  const [reason, setReason] = useState("");
  const { mutate, isPending } = useUpdateUserStatus();

  const handleConfirm = () => {
    mutate(
      { id: userId, isActive: !isCurrentlyActive, reason: reason || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCurrentlyActive ? "Suspend" : "Reactivate"} Account</DialogTitle>
          <DialogDescription>
            {isCurrentlyActive
              ? `${userName} will lose access to the platform immediately.`
              : `${userName} will regain full access to the platform.`}
          </DialogDescription>
        </DialogHeader>

        {isCurrentlyActive && (
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Violated community guidelines"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant={isCurrentlyActive ? "destructive" : "default"} onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Saving..." : isCurrentlyActive ? "Suspend" : "Reactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}