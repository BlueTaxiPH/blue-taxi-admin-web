"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { createAdminClient } from "@/lib/supabase/admin-client"
import { success, failure } from "@/lib/actions/result"
import { revalidatePath } from "next/cache"
import { requirePermission } from "@/lib/auth/permissions"

export async function suspendPassenger(userId: string) {
  const authResult = await requireAdmin()
  if ("error" in authResult) return failure(authResult.error)

  const permCheck = await requirePermission(authResult.user.id, "passengers")
  if (permCheck) return failure(permCheck.error)

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("users")
    .update({ is_active: false })
    .eq("id", userId)
    .eq("role", "passenger")
  if (error) return failure(error.message)
  revalidatePath("/passengers")
  revalidatePath(`/passengers/${userId}`)
  return success(null)
}

export async function reactivatePassenger(userId: string) {
  const authResult = await requireAdmin()
  if ("error" in authResult) return failure(authResult.error)

  const permCheck = await requirePermission(authResult.user.id, "passengers")
  if (permCheck) return failure(permCheck.error)

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("users")
    .update({ is_active: true })
    .eq("id", userId)
    .eq("role", "passenger")
  if (error) return failure(error.message)
  revalidatePath("/passengers")
  revalidatePath(`/passengers/${userId}`)
  return success(null)
}
