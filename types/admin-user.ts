export type AdminStatus = "pending" | "active" | "rejected"
export type AdminRole = "superadmin" | "blue_taxi_admin" | "insurance_admin"

export interface AdminUser {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  admin_status: AdminStatus
  admin_role: AdminRole | null
  is_active: boolean
  created_at: string
}
