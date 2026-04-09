"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { createClient } from "@/lib/supabase/server"
import { success, failure } from "@/lib/actions/result"
import type { ActionResult } from "@/lib/actions/result"

export type RolePermissionRow = {
  admin_role: string
  module: string
  can_access: boolean
  updated_by: string | null
  updated_at: string
}

export async function fetchRolePermissions(): Promise<ActionResult<RolePermissionRow[]>> {
  const authResult = await requireAdmin()
  if ("error" in authResult) return failure(authResult.error)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("role_permissions")
    .select("admin_role, module, can_access, updated_by, updated_at")
    .order("admin_role")

  if (error) return failure(error.message)
  return success(data as RolePermissionRow[])
}
