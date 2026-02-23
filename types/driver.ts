export type ServiceType = "Premium" | "Standard" | "Van"
export type DriverStatus = "Active" | "Inactive" | "Suspended"
export type DocStatus = "Verified" | "Pending" | "Expired" | "Expiring Soon"

export interface Driver {
  id: string
  name: string
  phone: string
  city: string
  serviceType: ServiceType
  status: DriverStatus
  docStatus: DocStatus
  rating: number
}
