"use client";
import { useState } from "react";
import { AssignDriverDialog } from "@/components/orders/assign-driver-dialog";

import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  Store,
  Bike,
  MapPin,
  CreditCard,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useOrder } from "@/hooks/api/use-orders";
import { cn } from "@/lib/utils";
import { useDynamicBreadcrumb } from "@/components/shared/breadcrumb-context";


const statusStyles = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "placed":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

const formatStatus = (status: string) => status.replace(/_/g, " ");

export default function OrderDetailPage() {



  const [assignDriverOpen, setAssignDriverOpen] = useState(false);

  const { id } = useParams<{ id: string }>();
  const router = useRouter();

const { data: response, isLoading } = useOrder(id);
const order = response?.data;

  useDynamicBreadcrumb(order?.orderNumber);

  if (isLoading) {
    return (

   
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => router.push("/orders")}>
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Button>

   
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
              <Badge variant="outline" className={cn("font-bold uppercase tracking-wider text-[10px]", statusStyles(order.status))}>
                {formatStatus(order.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Placed {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="text-3xl font-bold tabular-nums">£{order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
     
        <div className="md:col-span-2 space-y-4">
       
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</p>
                <p className="text-sm font-semibold">{order.customer?.name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{order.customer?.phone ?? ""}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Restaurant</p>
                <p className="text-sm font-semibold">{order.restaurant?.name ?? "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 justify-between">
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
      <Bike className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Driver</p>
      <p className="text-sm font-semibold">{order.driver?.name ?? "Not yet assigned"}</p>
    </div>
  </div>
  {!order.driver && !["delivered", "cancelled", "rejected"].includes(order.status) && (
    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setAssignDriverOpen(true)}>
      Assign Driver
    </Button>
  )}
</div>
          </div>

          {/* Items and their count */}
          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Items</h3>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground"> × {item.quantity}</span>
                  </div>
                  <span className="tabular-nums">£{item.itemTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">£{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span className="tabular-nums">£{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee</span>
                <span className="tabular-nums">£{order.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-1.5 border-t border-border">
                <span>Total</span>
                <span className="tabular-nums">£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* timeline for the whole order cycle */}
          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status Timeline</h3>
            </div>
            <div className="px-4 pb-4">
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex gap-3 py-2">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-2.5 h-2.5 rounded-full mt-1", i === order.statusHistory.length - 1 ? "bg-primary" : "bg-muted-foreground/30")} />
                    {i < order.statusHistory.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium capitalize">{formatStatus(entry.status)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    {entry.note && <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*  Delivery , Address of customer , payment notes */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivery Address</h3>
            </div>
            <p className="text-sm font-medium">{order.deliveryAddress?.label ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{order.deliveryAddress?.fullAddress ?? "Not available"}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment</h3>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <Badge variant="outline" className="uppercase text-[10px]">{order.paymentMethod}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"} className="capitalize text-[10px]">
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {(order.specialInstructions || order.rejectionReason || order.cancellationReason) && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</h3>
              </div>
              {order.specialInstructions && (
                <p className="text-sm mb-2">
                  <span className="text-muted-foreground">Instructions: </span>
                  {order.specialInstructions}
                </p>
              )}
              {order.rejectionReason && (
                <p className="text-sm text-rose-600">
                  <span className="font-medium">Rejected: </span>
                  {order.rejectionReason}
                </p>
              )}
              {order.cancellationReason && (
                <p className="text-sm text-rose-600">
                  <span className="font-medium">Cancelled: </span>
                  {order.cancellationReason}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <AssignDriverDialog open={assignDriverOpen} onOpenChange={setAssignDriverOpen} orderId={order._id} />
    </div>
  );
}