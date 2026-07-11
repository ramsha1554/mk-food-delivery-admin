import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { BreadcrumbProvider } from "@/components/shared/breadcrumb-context";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumbs />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  );
}