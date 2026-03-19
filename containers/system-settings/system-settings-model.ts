export const MODULES = [
  { id: "trips", label: "Trips" },
  { id: "drivers", label: "Drivers" },
  { id: "payments", label: "Payments" },
  { id: "system_config", label: "System Config" },
  { id: "analytics", label: "Analytics" },
] as const

export type ModuleId = (typeof MODULES)[number]["id"]

export type Role = {
  id: string
  name: string
}

export type PermissionsState = Record<ModuleId, Record<string, boolean>>

export const INITIAL_ROLES: Role[] = [
  { id: "super_admin", name: "Super Admin" },
  { id: "ops", name: "Ops" },
  { id: "finance", name: "Finance" },
  { id: "support", name: "Support" },
  { id: "compliance", name: "Compliance" },
]

export const INITIAL_PERMISSIONS: PermissionsState = {
  trips: {
    super_admin: true,
    ops: true,
    finance: false,
    support: true,
    compliance: true,
  },
  drivers: {
    super_admin: true,
    ops: true,
    finance: false,
    support: true,
    compliance: true,
  },
  payments: {
    super_admin: true,
    ops: false,
    finance: true,
    support: false,
    compliance: false,
  },
  system_config: {
    super_admin: true,
    ops: false,
    finance: false,
    support: false,
    compliance: false,
  },
  analytics: {
    super_admin: true,
    ops: true,
    finance: true,
    support: false,
    compliance: true,
  },
}

export function normalizeRoleId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

