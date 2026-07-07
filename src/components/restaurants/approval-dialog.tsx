"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApproveRestaurant, useRejectRestaurant } from "@/hooks/api/use-restaurants";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  restaurantName: string;
  mode: "approve" | "reject";
}

export function ApprovalDialog({ open, onOpenChange, restaurantId, restaurantName, mode }: ApprovalDialogProps) {
  const [note, setNote] = useState("");
  const approveMutation = useApproveRestaurant();
  const rejectMutation = useRejectRestaurant();

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const handleConfirm = () => {
    if (mode === "approve") {
      approveMutation.mutate(restaurantId, { onSuccess: () => onOpenChange(false) });
    } else {
      if (!note.trim()) return;
      rejectMutation.mutate(
        { id: restaurantId, note },
        {
          onSuccess: () => {
            onOpenChange(false);
            setNote("");
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "approve" ? "Approve" : "Reject"} Restaurant Application</DialogTitle>
          <DialogDescription>
            {mode === "approve"
              ? `${restaurantName} will be able to go live and start receiving orders.`
              : `${restaurantName} will be notified of the rejection reason below.`}
          </DialogDescription>
        </DialogHeader>

        {mode === "reject" && (
          <div className="space-y-2">
            <Label htmlFor="note">Rejection Reason (required)</Label>
            <Textarea
              id="note"
              placeholder="e.g. Missing local council hygiene rating certification document"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={mode === "reject" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending || (mode === "reject" && !note.trim())}
          >
            {isPending ? "Saving..." : mode === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}