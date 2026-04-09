export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin-client"
import { createClient } from "@/lib/supabase/server"
import { fetchCitiesWithCoords } from "@/lib/supabase/queries"
import { SystemSettingsPage } from "@/containers/system-settings"
import type { AdminUser } from "@/types/admin-user"

export default async function SystemSettingsRoutePage() {
  const adminClient = createAdminClient()
  const supabase = await createClient()

  let adminUsers: AdminUser[] = []
  let cities: Awaited<ReturnType<typeof fetchCitiesWithCoords>> = []
  let isSuperAdmin = false

  try {
    const { data } = await adminClient
      .from("users")
      .select(
        "id, first_name, last_name, email, phone, admin_status, admin_role, is_active, created_at"
      )
      .eq("role", "admin")
      .order("created_at", { ascending: false })
    adminUsers = (data ?? []) as AdminUser[]
  } catch {
    // fail silently — empty array rendered
  }

  try {
    cities = await fetchCitiesWithCoords()
  } catch {
    // fail silently — empty array rendered
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("admin_role")
        .eq("id", user.id)
        .single()
      isSuperAdmin = profile?.admin_role === "superadmin"
    }
  } catch {
    // fail silently — defaults to read-only
  }

  return (
    <SystemSettingsPage
      adminUsers={adminUsers}
      cities={cities}
      isSuperAdmin={isSuperAdmin}
    />
  )
}
