export const MODULES = [
  { id: "trips",             label: "Trips" },
  { id: "drivers",           label: "Drivers" },
  { id: "passengers",        label: "Passengers" },
  { id: "payments",          label: "Payments" },
  { id: "system_config",     label: "System Config" },
  { id: "analytics",         label: "Analytics" },
  { id: "insurance_reports", label: "Insurance Reports" },
] as const

export type ModuleId = (typeof MODULES)[number]["id"]

export type Role = {
  id: string
  name: string
}

export type PermissionsState = Record<ModuleId, Record<string, boolean>>

export const INITIAL_ROLES: Role[] = [
  { id: "superadmin",      name: "Superadmin" },
  { id: "blue_taxi_admin", name: "Blue Taxi Admin" },
  { id: "insurance_admin", name: "Insurance Admin" },
]

export const INITIAL_PERMISSIONS: PermissionsState = {
  trips:             { superadmin: true,  blue_taxi_admin: true,  insurance_admin: false },
  drivers:           { superadmin: true,  blue_taxi_admin: true,  insurance_admin: false },
  passengers:        { superadmin: true,  blue_taxi_admin: true,  insurance_admin: false },
  payments:          { superadmin: true,  blue_taxi_admin: true,  insurance_admin: false },
  system_config:     { superadmin: true,  blue_taxi_admin: false, insurance_admin: false },
  analytics:         { superadmin: true,  blue_taxi_admin: true,  insurance_admin: false },
  insurance_reports: { superadmin: true,  blue_taxi_admin: false, insurance_admin: true  },
}

export function normalizeRoleId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
