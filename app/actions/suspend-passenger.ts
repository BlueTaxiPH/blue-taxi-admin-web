"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { createAdminClient } from "@/lib/supabase/admin-client"
import { success, failure } from "@/lib/actions/result"
import { revalidatePath } from "next/cache"

export async function suspendPassenger(userId: string) {
  await requireAdmin()
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
  await requireAdmin()
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
