export type PassengerStatus = "Active" | "Blocked" | "Suspended"
export type FraudRisk = "Low Risk" | "High Risk"

export interface Passenger {
  id: string
  name: string
  email: string
  phone: string
  totalTrips: number
  rating: number | null
  fraudRisk: FraudRisk
  status: PassengerStatus
}

