"use server"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin-client"
import { requireAdmin } from "@/lib/auth/require-admin"
import { failure, success } from "@/lib/actions/result"
import type { ActionResult } from "@/lib/actions/result"
import type { AdminRole } from "@/types/admin-user"

async function assertSuperAdmin(): Promise<{ userId: string } | { error: string }> {
  const result = await requireAdmin()
  if ("error" in result) return result

  const adminClient = createAdminClient()
  const { data: caller } = await adminClient
    .from("users")
    .select("admin_role")
    .eq("id", result.user.id)
    .single()

  if (!caller || caller.admin_role !== "superadmin") {
    return { error: "Only superadmins can manage admin users." }
  }

  return { userId: result.user.id }
}

export async function approveAdminUser(
  userId: string,
  role: AdminRole
): Promise<ActionResult<void>> {
  const check = await assertSuperAdmin()
  if ("error" in check) return failure(check.error)

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("users")
    .update({ admin_status: "active", admin_role: role, is_active: true })
    .eq("id", userId)

  if (error) return failure(error.message)

  revalidatePath("/system-settings")
  return success()
}

export async function rejectAdminUser(userId: string): Promise<ActionResult<void>> {
  const check = await assertSuperAdmin()
  if ("error" in check) return failure(check.error)

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("users")
    .update({ admin_status: "rejected", is_active: false })
    .eq("id", userId)

  if (error) return failure(error.message)

  revalidatePath("/system-settings")
  return success()
}

export async function changeAdminRole(
  userId: string,
  role: AdminRole
): Promise<ActionResult<void>> {
  const check = await assertSuperAdmin()
  if ("error" in check) return failure(check.error)

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("users")
    .update({ admin_role: role })
    .eq("id", userId)

  if (error) return failure(error.message)

  revalidatePath("/system-settings")
  return success()
}

export async function deactivateAdminUser(userId: string): Promise<ActionResult<void>> {
  const check = await assertSuperAdmin()
  if ("error" in check) return failure(check.error)

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("users")
    .update({ is_active: false })
    .eq("id", userId)

  if (error) return failure(error.message)

  revalidatePath("/system-settings")
  return success()
}

export async function reactivateAdminUser(userId: string): Promise<ActionResult<void>> {
  const check = await assertSuperAdmin()
  if ("error" in check) return failure(check.error)

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("users")
    .update({ is_active: true })
    .eq("id", userId)

  if (error) return failure(error.message)

  revalidatePath("/system-settings")
  return success()
}
