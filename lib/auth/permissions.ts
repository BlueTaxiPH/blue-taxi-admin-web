import { createClient } from "@/lib/supabase/server"

export type RolePermissions = Record<string, boolean>

export const MODULE_ROUTES: Record<string, string[]> = {
  trips:             ["/trip-management"],
  drivers:           ["/drivers"],
  passengers:        ["/passengers"],
  payments:          ["/payments"],
  system_config:     ["/system-settings", "/pricing-and-services"],
  analytics:         [],
  insurance_reports: ["/insurance-reports"],
}

const ALL_MODULES = [
  "trips", "drivers", "passengers", "payments",
  "system_config", "analytics", "insurance_reports",
]

const SUPERADMIN_PERMISSIONS: RolePermissions =
  Object.fromEntries(ALL_MODULES.map((m) => [m, true]))

const DENY_ALL: RolePermissions =
  Object.fromEntries(ALL_MODULES.map((m) => [m, false]))

// Fetch permissions from DB. Superadmin always gets full access without a DB call.
// On any query failure returns DENY_ALL (safe lockdown).
export async function fetchAdminPermissions(adminRole: string | null): Promise<RolePermissions> {
  if (adminRole === "superadmin") return { ...SUPERADMIN_PERMISSIONS }
  if (!adminRole) return { ...DENY_ALL }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("role_permissions")
      .select("module, can_access")
      .eq("admin_role", adminRole)
    if (error || !data) return { ...DENY_ALL }
    return data.reduce<RolePermissions>((acc, row) => {
      acc[row.module] = row.can_access
      return acc
    }, { ...DENY_ALL })
  } catch {
    return { ...DENY_ALL }
  }
}

// Map a Next.js pathname to its module name. Returns null for routes always accessible.
export function getModuleForPath(pathname: string): string | null {
  for (const [module, routes] of Object.entries(MODULE_ROUTES)) {
    if (routes.some((r) => r && (pathname === r || pathname.startsWith(r + "/")))) {
      return module
    }
  }
  return null
}

// Use in server actions after requireAdmin(). Returns { error } if denied, null if allowed.
export async function requirePermission(
  userId: string,
  module: string,
): Promise<{ error: string } | null> {
  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("users")
      .select("admin_role")
      .eq("id", userId)
      .single()
    const adminRole = profile?.admin_role as string | null
    if (adminRole === "superadmin") return null
    const permissions = await fetchAdminPermissions(adminRole)
    if (!permissions[module]) {
      return { error: `Access denied: insufficient permissions for ${module}` }
    }
    return null
  } catch {
    return { error: "Permission check failed" }
  }
}
