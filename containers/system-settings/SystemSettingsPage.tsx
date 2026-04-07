import { createAdminClient } from "@/lib/supabase/admin-client"
import type { AdminUser } from "@/types/admin-user"

import { SystemSettingsClient } from "./SystemSettingsClient"
import { AdminUsersCard } from "./AdminUsersCard"

export async function SystemSettingsPage() {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from("users")
    .select("id, first_name, last_name, email, phone, admin_status, admin_role, is_active, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false })

  const adminUsers = (data ?? []) as AdminUser[]

  return (
    <div>
      <SystemSettingsClient />
      <div className="px-6 pb-6">
        <AdminUsersCard users={adminUsers} />
      </div>
    </div>
  )
}
