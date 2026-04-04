export type PassengerStatus = "Active" | "Blocked" | "Suspended"

export interface Passenger {
  id: string
  supabaseId: string
  name: string
  email: string
  phone: string
  totalTrips: number
  rating: number | null
  status: PassengerStatus
  memberSince: string
}

