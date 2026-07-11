"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Phone, Mail, Bike, User, Files, Shield, Calendar } from "lucide-react";
import { useDrivers, useApproveDriver, useRejectDriver, useDriverDocuments } from "@/hooks/api/use-drivers";
import { useUpdateUserStatus } from "@/hooks/api/use-users";
import { DocumentReviewCard } from "@/components/drivers/document-review-card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDynamicBreadcrumb } from "@/components/shared/breadcrumb-context";

type TabType = "overview" | "documents";

const statusStyles = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-muted text-foreground border-border";
  }
};

const InfoRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | React.ReactNode;
  icon?: any;
}) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
    {Icon && (
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        <Icon className="w-5 h-5" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  </div>
);

export default function DriverDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const { data: listResponse, isLoading: isLoadingDriver } = useDrivers({});
  const driver = useMemo(() => listResponse?.data?.find((d) => d._id === id), [listResponse, id]);

  useDynamicBreadcrumb(driver?.name);

  const { data: docsResponse, isLoading: isLoadingDocs } = useDriverDocuments(id);
  const documents = docsResponse?.data ?? [];

  const approveMutation = useApproveDriver();
  const rejectMutation = useRejectDriver();
  const statusMutation = useUpdateUserStatus();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const handleApprove = () => approveMutation.mutate(id);

  const handleReject = () => {
    if (!rejectNote.trim()) return;
    rejectMutation.mutate({ id, note: rejectNote }, { onSuccess: () => setRejectDialogOpen(false) });
  };

  const handleToggleSuspend = () => {
    if (!driver) return;
    statusMutation.mutate({ id, isActive: !driver.isActive });
  };

  if (isLoadingDriver) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
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

  const TABS: { key: TabType; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "documents", label: "Identity & Docs", icon: Files },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => router.push("/drivers")}>
        <ArrowLeft className="w-4 h-4" />
        Back to Drivers
      </Button>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              {driver.name?.charAt(0) ?? "?"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{driver.name}</h1>
                <Badge
                  variant="outline"
                  className={cn("font-bold uppercase tracking-wider text-[10px]", statusStyles(driver.driverStatus))}
                >
                  {driver.driverStatus}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
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
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className={driver.isActive ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                {driver.isActive ? "Active" : "Suspended"}
              </span>
              <Switch checked={driver.isActive} onCheckedChange={handleToggleSuspend} disabled={statusMutation.isPending} />
            </div>
            {driver.driverStatus === "pending" && (
              <>
                <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                  Approve Application
                </Button>
                <Button variant="destructive" onClick={() => setRejectDialogOpen(true)}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="px-4 pt-4 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personal Details</h3>
            </div>
            <InfoRow label="Full Name" value={driver.name} icon={User} />
            <InfoRow label="Phone Number" value={driver.phone} icon={Phone} />
            <InfoRow label="Email Address" value={driver.email ?? "Not provided"} icon={Mail} />
            <InfoRow label="Vehicle Type" value={<span className="capitalize">{driver.vehicleType ?? "—"}</span>} icon={Bike} />
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="px-4 pt-4 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Status</h3>
            </div>
            <InfoRow
              label="Verification"
              value={
                <Badge variant="outline" className={cn("font-bold uppercase text-[10px]", statusStyles(driver.driverStatus))}>
                  {driver.driverStatus}
                </Badge>
              }
              icon={Shield}
            />
            <InfoRow label="Online Status" value={driver.isOnline ? "Online now" : "Offline"} icon={Bike} />
            <InfoRow
              label="Joined"
              value={new Date(driver.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              icon={Calendar}
            />
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div>
          {isLoadingDocs ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
              <Files className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => (
                <DocumentReviewCard key={doc._id} document={doc} driverId={id} />
              ))}
            </div>
          )}
        </div>
      )}

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