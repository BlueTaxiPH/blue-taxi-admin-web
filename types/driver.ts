export type ServiceType = "Basic" | "XL"
export type DriverStatus = "Active" | "Inactive" | "Suspended"
export type DocStatus = "Verified" | "Pending" | "Rejected" | "No Docs"

export interface Driver {
  id: string
  name: string
  phone: string
  city: string
  serviceType: ServiceType
  status: DriverStatus
  docStatus: DocStatus
  rating: number
  supabaseId?: string
}
