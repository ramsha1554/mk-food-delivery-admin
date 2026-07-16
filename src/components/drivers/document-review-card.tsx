"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Check, X } from "lucide-react";
import { useReviewDocument } from "@/hooks/api/use-drivers";
import { DriverDocument } from "@/types/api";

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

const documentTypeLabels: Record<string, string> = {
  driving_licence: "Driving Licence",
  insurance: "Insurance Certificate",
  vehicle_details: "Vehicle Details",
  profile_photo: "Profile Photo",
};


const formatDocType = (type: string) => documentTypeLabels[type] ?? type.replace(/_/g, " ");

export function DocumentReviewCard({ document, driverId }: { document: DriverDocument; driverId: string }) {
  const [note, setNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const { mutate, isPending } = useReviewDocument();


  const staticBase = process.env.NEXT_PUBLIC_STATIC_BASE_URL || "";
const fallbackBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");
const baseUrl = staticBase || fallbackBase;

const constructUrl = (path: string | undefined) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

  const handleApprove = () => {
    mutate({ docId: document._id, approved: true, driverId });
  };

  const handleReject = () => {
    if (!note.trim()) return;
    mutate(
      { docId: document._id, approved: false, note, driverId },
      { onSuccess: () => setShowRejectForm(false) }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
  <FileText className="w-4 h-4 text-muted-foreground" />
  {formatDocType(document.type)}
</CardTitle>
        <Badge variant={statusVariant(document.status) as any} className="capitalize">
          {document.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <a
          // href={document.fileUrl}
          // target="_blank"
          href={constructUrl(document.fileUrl)}
  target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-primary underline underline-offset-2"
        >
          View document
        </a>

        {document.note && <p className="text-xs text-muted-foreground italic">Note: {document.note}</p>}

        {document.status === "pending" && !showRejectForm && (
          <div className="flex gap-2">
            <Button size="sm" className="h-8 text-xs flex-1" onClick={handleApprove} disabled={isPending}>
              <Check className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs flex-1"
              onClick={() => setShowRejectForm(true)}
              disabled={isPending}
            >
              <X className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {showRejectForm && (
          <div className="space-y-2">
            <Textarea
              placeholder="Reason for rejection..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs flex-1" onClick={() => setShowRejectForm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs flex-1"
                onClick={handleReject}
                disabled={isPending || !note.trim()}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
