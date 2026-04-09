"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  User,
  Briefcase,
  Tag,
  CreditCard,
  FileText,
  Settings,
  LogOut,
} from "lucide-react"
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
import { logout } from "@/app/actions/logout"
import type { RolePermissions } from "@/lib/auth/permissions"

const dashboardItem = { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }

const navGroups = [
  {
    label: "OPERATIONS",
    items: [
      { label: "Drivers",              href: "/drivers",              icon: Users,     module: "drivers" },
      { label: "Passengers",           href: "/passengers",           icon: User,      module: "passengers" },
      { label: "Trip Management",      href: "/trip-management",      icon: Briefcase, module: "trips" },
      { label: "Pricing and Services", href: "/pricing-and-services", icon: Tag,       module: "system_config" },
    ],
  },
  {
    label: "BUSINESS",
    items: [
      { label: "Payments",         href: "/payments",         icon: CreditCard, module: "payments" },
      { label: "Insurance Reports", href: "/insurance-reports", icon: FileText,  module: "insurance_reports" },
    ],
  },
]

interface AppSidebarProps {
  adminName?: string
  adminRole?: string
  permissions?: RolePermissions
}

export function AppSidebar({
  adminName = "Admin User",
  adminRole = "Global Admin",
  permissions,
}: AppSidebarProps) {
  const pathname = usePathname()

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !permissions || permissions[item.module] !== false
      ),
    }))
    .filter((group) => group.items.length > 0)

  const showSystemSettings = !permissions || permissions["system_config"] !== false

  return (
    <Sidebar side="left" className="border-white/10">
      <SidebarHeader className="border-b py-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex h-[60px] items-center gap-3 px-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(26,86,219,0.2)", border: "1px solid rgba(26,86,219,0.35)" }}
          >
            <Image src="/icon.png" alt="Blue Taxi" width={28} height={28} className="rounded-lg" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p
              className="text-base font-bold uppercase tracking-widest text-white"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Blue Taxi
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#3A5A7A]">
              Admin Dashboard
            </p>
          </div>
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

        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2E4A6A]">
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
        {showSystemSettings ? (
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
        ) : null}
      </SidebarContent>

      <SidebarFooter style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 px-3 py-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1A56DB 0%, #2563EB 100%)" }}
            aria-hidden
          >
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-[#C8DCF0]">
              {adminName}
            </p>
            <p className="truncate text-[11px] text-[#4A7A9B]">
              {adminRole}
            </p>
          </div>
          <button
            onClick={() => void logout()}
            className="shrink-0 rounded-lg p-1.5 text-[#4A7A9B] transition-colors hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:hidden cursor-pointer"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
