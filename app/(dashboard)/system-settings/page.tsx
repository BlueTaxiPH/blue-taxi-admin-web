export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin-client"
import { fetchCitiesWithCoords } from "@/lib/supabase/queries"
import { SystemSettingsPage } from "@/containers/system-settings"
import type { AdminUser } from "@/types/admin-user"

export default async function SystemSettingsRoutePage() {
  const adminClient = createAdminClient()

  let adminUsers: AdminUser[] = []
  let cities: Awaited<ReturnType<typeof fetchCitiesWithCoords>> = []

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

  return <SystemSettingsPage adminUsers={adminUsers} cities={cities} />
}
