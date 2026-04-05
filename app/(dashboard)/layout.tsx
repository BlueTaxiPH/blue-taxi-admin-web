import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

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
  let adminRole = "Global Admin"

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("first_name, last_name, role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      redirect("/login")
    }

    adminName =
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Admin User"
    adminRole = "Global Admin"
  }

  return (
    <SidebarProvider>
      <div data-sidebar-theme="blue-taxi" className="flex min-h-screen w-full">
        <AppSidebar adminName={adminName} adminRole={adminRole} />
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
