"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  Users,
  User,
  Briefcase,
  Tag,
  CreditCard,
  FileText,
  Settings,
  LogOut,
} from "lucide-react"
import { TaxiIcon } from "@/components/icons/taxi-icon"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const dashboardItem = { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }

const navGroups = [
  {
    label: "OPERATIONS",
    items: [
      { label: "Live Fleet Map", href: "/live-fleet-map", icon: MapPin },
      { label: "Drivers", href: "/drivers", icon: Users },
      { label: "Passengers", href: "/passengers", icon: User },
      { label: "Trip Management", href: "/trip-management", icon: Briefcase },
      { label: "Pricing and Services", href: "/pricing-and-services", icon: Tag },
    ],
  },
  {
    label: "BUSINESS",
    items: [
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Insurance Reports", href: "/insurance-reports", icon: FileText },
    ],
  },
] as const

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="none" side="left" className="border-white/10">
      <SidebarHeader className="border-b border-white/10 py-1.5">
        <div className="flex h-12 items-center gap-3 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            <TaxiIcon className="size-5 text-white" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            BLUE TAXI
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === dashboardItem.href} className="h-10">
                  <Link href={dashboardItem.href}>
                    <dashboardItem.icon className="size-5 shrink-0" />
                    <span>{dashboardItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider text-white/50">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} className="h-10">
                      <Link href={item.href}>
                        <item.icon className="size-5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <div className="min-h-0 flex-1" aria-hidden />
        <SidebarGroup className="pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/system-settings"} className="h-10">
                  <Link href="/system-settings">
                    <Settings className="size-5 shrink-0" />
                    <span>System Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10">
        <div className="flex h-12 items-center gap-3 rounded-md px-2 py-2">
          <div
            className="size-9 shrink-0 rounded-full bg-white"
            aria-hidden
          />
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              Admin User
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              Global Admin
            </p>
          </div>
          <Link
            href="/login"
            className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
            aria-label="Log out"
          >
            <LogOut className="size-5" />
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
