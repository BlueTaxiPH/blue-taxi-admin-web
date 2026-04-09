import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { fetchAdminPermissions, getModuleForPath } from "@/lib/auth/permissions"
import type { AdminRole } from "@/types/admin-user"

const roleLabels: Record<AdminRole, string> = {
  superadmin: "Superadmin",
  blue_taxi_admin: "Blue Taxi Admin",
  insurance_admin: "Insurance Admin",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let adminName = "Admin User"
  let adminRole = "Admin"

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("first_name, last_name, role, admin_status, admin_role, is_active")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") redirect("/login")
    if (profile.admin_status === "pending")  redirect("/login?status=pending")
    if (profile.admin_status === "rejected") redirect("/login?status=rejected")
    if (!profile.is_active)                  redirect("/login?status=inactive")

    adminName =
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Admin User"

    adminRole = profile.admin_role
      ? roleLabels[profile.admin_role as AdminRole] ?? "Admin"
      : "Admin"

    // Enforce RBAC: redirect to /dashboard if the current route is blocked
    const permissions = await fetchAdminPermissions(profile.admin_role as string | null)
    const headersList = await headers()
    const pathname = headersList.get("x-pathname") ?? ""
    const currentModule = getModuleForPath(pathname)
    if (currentModule && !permissions[currentModule]) {
      redirect("/dashboard")
    }

    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar adminName={adminName} adminRole={adminRole} permissions={permissions} />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar adminName={adminName} adminRole={adminRole} />
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
