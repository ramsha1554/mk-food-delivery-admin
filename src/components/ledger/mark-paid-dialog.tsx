"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMarkPayout } from "@/hooks/api/use-ledger";
import { LedgerEntry } from "@/types/api";

interface MarkPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: LedgerEntry;
}

export function MarkPaidDialog({ open, onOpenChange, entry }: MarkPaidDialogProps) {
  const { mutate, isPending } = useMarkPayout();

  const recipientName = entry.type === "restaurant" ? entry.restaurant?.name : entry.driver?.name;

  const handleConfirm = () => {
    mutate({ id: entry._id, type: entry.type }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Payout as Paid</DialogTitle>
          <DialogDescription>
            Confirm that £{entry.amount.toFixed(2)} has been manually transferred to {recipientName ?? "this " + entry.type}.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Saving..." : "Confirm Paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}