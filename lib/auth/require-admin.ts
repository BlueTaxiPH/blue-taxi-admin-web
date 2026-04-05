import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type AdminResult =
  | { user: User }
  | { error: string };

export async function requireAdmin(): Promise<AdminResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in to perform this action." };
  }

  const { data: caller } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!caller || caller.role !== "admin") {
    return { error: "Only admins can perform this action." };
  }

  return { user };
}
