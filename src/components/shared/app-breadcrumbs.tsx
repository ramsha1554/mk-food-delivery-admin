"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbContext } from "./breadcrumb-context";

const LABELS: Record<string, string> = {
  orders: "Orders",
  restaurants: "Restaurants",
  drivers: "Drivers",
  users: "Users",
  ledger: "Virtual Ledger",
  settings: "Settings",
};

// Matches a MongoDB ObjectId (24 hex chars) — used to detect dynamic [id] segments
const isObjectId = (segment: string) => /^[a-f0-9]{24}$/i.test(segment);

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const { dynamicLabel } = useBreadcrumbContext();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    let label: string;
    if (isObjectId(segment)) {
      label = isLast && dynamicLabel ? dynamicLabel : "Details";
    } else {
      label = LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    return { href, label, isLast };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}