"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/api/use-auth";
import { usePlatformConfig } from "@/hooks/api/use-config";
import { cn } from "@/lib/utils";
import { User, Percent, MapPin, Wallet } from "lucide-react";

const TABS = [
  { label: "Profile", value: "profile" },
  { label: "Platform Config", value: "config" },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [tab, setTab] = useState("profile");
  const { user, isLoadingUser } = useAuth();
  const { data: configResponse, isLoading: isLoadingConfig, isError: isConfigError } = usePlatformConfig();
  const config = configResponse?.data;

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and view platform configuration</p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Admin Profile
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingUser ? (
              <>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-32" />
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-sm font-medium">{user?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm font-medium">{user?.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <Badge variant="outline" className="capitalize">
                    {user?.role ?? "—"}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "config" && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>
             
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingConfig ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : isConfigError || !config ? (
              <p className="text-sm text-muted-foreground">Could not load platform configuration.</p>
            ) : (
              <>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Percent className="w-4 h-4" />
                    Commission Rate
                  </span>
                  <span className="text-sm font-medium">{config.commissionRate ?? "—"}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Delivery Radius
                  </span>
                  <span className="text-sm font-medium">{config.deliveryRadius ?? "—"} km</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    Minimum Order Value
                  </span>
                  <span className="text-sm font-medium">£{config.minimumOrderValue ?? "—"}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}