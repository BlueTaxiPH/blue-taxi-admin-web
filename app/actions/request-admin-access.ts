"use server"

import { createAdminClient } from "@/lib/supabase/admin-client"
import { failure, success } from "@/lib/actions/result"
import type { ActionResult } from "@/lib/actions/result"

interface RequestAdminAccessInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export async function requestAdminAccess(
  input: RequestAdminAccessInput
): Promise<ActionResult<void>> {
  const { firstName, lastName, email, phone, password, confirmPassword } = input

  if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
    return failure("All fields are required.")
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return failure("Please enter a valid email address.")
  }

  if (password.length < 8) {
    return failure("Password must be at least 8 characters.")
  }

  if (password !== confirmPassword) {
    return failure("Passwords do not match.")
  }

  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { role: "admin" },
  })

  if (authError || !authData.user) {
    return failure(authError?.message ?? "Failed to create account.")
  }

  const { error: insertError } = await adminClient.from("users").upsert({
    id: authData.user.id,
    role: "admin",
    admin_status: "pending",
    admin_role: null,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    is_active: false,
  })

  if (insertError) {
    // Roll back the auth user so we don't leave orphaned records
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return failure("Failed to save your request. Please try again.")
  }

  return success()
}
