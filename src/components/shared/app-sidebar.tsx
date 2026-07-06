// "use client";

// import * as React from "react";
// import {
//   LayoutDashboard,
//   ShoppingBag,
//   Store,
//   Bike,
//   Users,
//   Wallet,
//   Settings,
// } from "lucide-react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarGroupContent,
// } from "@/components/ui/sidebar";

// const menuItems = [
//   { title: "Dashboard", url: "/", icon: LayoutDashboard },
//   { title: "Orders", url: "/orders", icon: ShoppingBag },
//   { title: "Restaurants", url: "/restaurants", icon: Store },
//   { title: "Drivers", url: "/drivers", icon: Bike },
//   { title: "Users", url: "/users", icon: Users },
//   { title: "Virtual Ledger", url: "/ledger", icon: Wallet },
//   { title: "Settings", url: "/settings", icon: Settings },
// ];

// export function AppSidebar() {
//   const pathname = usePathname();

//   return (
//     <Sidebar collapsible="icon">
//       <SidebarHeader className="gap-2 p-2 flex-col h-16 flex items-center justify-center border-b group-data-[collapsible=icon]:px-0">
//         <div className="flex items-center gap-3 font-bold text-xl text-primary w-full justify-center">
//           <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm">
//             MK
//           </div>
//           <span className="group-data-[collapsible=icon]:hidden truncate">MK Food Delivery</span>
//         </div>
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {menuItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
//                     <Link href={item.url}>
//                       <item.icon />
//                       <span>{item.title}</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// }


"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Bike,
  Users,
  Wallet,
  Settings,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/api/use-auth";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Orders", url: "/orders", icon: ShoppingBag },
  { title: "Restaurants", url: "/restaurants", icon: Store },
  { title: "Drivers", url: "/drivers", icon: Bike },
  { title: "Users", url: "/users", icon: Users },
  { title: "Virtual Ledger", url: "/ledger", icon: Wallet },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2 p-2 flex-col h-16 flex items-center justify-center border-b group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-3 font-bold text-xl text-primary w-full justify-center">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm">
            MK
          </div>
          <span className="group-data-[collapsible=icon]:hidden truncate">MK Food Delivery</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="h-7 w-7 rounded-md">
                    <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{user?.name ?? "Admin"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.phone ?? ""}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}