"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Phone, Mail, Bike } from "lucide-react";
import { useDrivers, useApproveDriver, useRejectDriver, useDriverDocuments } from "@/hooks/api/use-drivers";
import { DocumentReviewCard } from "@/components/drivers/document-review-card";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();


  const { data: listResponse, isLoading: isLoadingDriver } = useDrivers();
  const driver = useMemo(() => listResponse?.data?.find((d) => d._id === id), [listResponse, id]);

  const { data: docsResponse, isLoading: isLoadingDocs } = useDriverDocuments(id);
  const documents = docsResponse?.data ?? [];

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const approveMutation = useApproveDriver();
  const rejectMutation = useRejectDriver();

  const handleApprove = () => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (!rejectNote.trim()) return;
    rejectMutation.mutate(
      { id, note: rejectNote },
      { onSuccess: () => setRejectDialogOpen(false) }
    );
  };

  if (isLoadingDriver) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">Driver not found.</p>
        <Button variant="outline" onClick={() => router.push("/drivers")}>
          Back to Drivers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => router.push("/drivers")}>
        <ArrowLeft className="w-4 h-4" />
        Back to Drivers
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{driver.name}</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {driver.phone}
              </span>
              {driver.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {driver.email}
                </span>
              )}
              <span className="flex items-center gap-1.5 capitalize">
                <Bike className="w-3.5 h-3.5" />
                {driver.vehicleType ?? "—"}
              </span>
            </div>
          </div>
          <Badge variant={statusVariant(driver.driverStatus) as any} className="capitalize text-sm px-3 py-1">
            {driver.driverStatus}
          </Badge>
        </CardHeader>
        {driver.driverStatus === "pending" && (
          <CardContent className="flex gap-2 pt-0">
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              Approve Driver
            </Button>
            <Button variant="destructive" onClick={() => setRejectDialogOpen(true)}>
              Reject Driver
            </Button>
          </CardContent>
        )}
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Verification Documents</h2>
        {isLoadingDocs ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((doc) => (
              <DocumentReviewCard key={doc._id} document={doc} driver={driver} />
            
            ))}
          </div>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Driver Application</DialogTitle>
            <DialogDescription>{driver.name} will be notified of the rejection reason below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-note">Rejection Reason (required)</Label>
            <Textarea
              id="reject-note"
              placeholder="e.g. Insurance document expired"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending || !rejectNote.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}