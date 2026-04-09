"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/require-admin"
import { createClient } from "@/lib/supabase/server"
import { success, failure } from "@/lib/actions/result"
import type { ActionResult } from "@/lib/actions/result"

async function assertSuperAdmin(): Promise<{ userId: string } | { error: string }> {
  const result = await requireAdmin()
  if ("error" in result) return result

  const supabase = await createClient()
  const { data: caller } = await supabase
    .from("users")
    .select("admin_role")
    .eq("id", result.user.id)
    .single()

  if (!caller || caller.admin_role !== "superadmin") {
    return { error: "Only superadmins can modify role permissions." }
  }

  return { userId: result.user.id }
}

export async function updateRolePermission(
  adminRole: string,
  module: string,
  canAccess: boolean,
): Promise<ActionResult<void>> {
  const check = await assertSuperAdmin()
  if ("error" in check) return failure(check.error)

  const supabase = await createClient()
  const { error } = await supabase
    .from("role_permissions")
    .update({
      can_access: canAccess,
      updated_by: check.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("admin_role", adminRole)
    .eq("module", module)

  if (error) return failure(error.message)
  revalidatePath("/system-settings")
  return success()
}
