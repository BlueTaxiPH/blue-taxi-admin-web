import type { Passenger } from "@/types/passenger"

const SEED_PASSENGERS: Passenger[] = [
  {
    id: "PA-1001",
    name: "Sarah Miller",
    email: "sarah.m@example.com",
    phone: "+1 (555) 123-4567",
    totalTrips: 42,
    rating: 4.9,
    fraudRisk: "Low Risk",
    status: "Active",
  },
  {
    id: "PA-1002",
    name: "James Chen",
    email: "james.chen88@example.com",
    phone: "+1 (555) 987-6543",
    totalTrips: 8,
    rating: 4.2,
    fraudRisk: "High Risk",
    status: "Blocked",
  },
  {
    id: "PA-1003",
    name: "Elena Rodriguez",
    email: "elena.rod@example.com",
    phone: "+1 (555) 234-5678",
    totalTrips: 156,
    rating: 5.0,
    fraudRisk: "Low Risk",
    status: "Active",
  },
  {
    id: "PA-1004",
    name: "Michael Torres",
    email: "m.torres@example.com",
    phone: "+1 (555) 876-5432",
    totalTrips: 12,
    rating: 4.7,
    fraudRisk: "Low Risk",
    status: "Active",
  },
  {
    id: "PA-1005",
    name: "David Kim",
    email: "david.k@example.com",
    phone: "+1 (555) 432-1098",
    totalTrips: 5,
    rating: null,
    fraudRisk: "High Risk",
    status: "Suspended",
  },
  {
    id: "PA-1006",
    name: "Linda Waters",
    email: "linda.w@example.com",
    phone: "+1 (555) 345-6789",
    totalTrips: 89,
    rating: 4.8,
    fraudRisk: "Low Risk",
    status: "Active",
  },
]

// Expand for pagination demo
export const MOCK_PASSENGERS: Passenger[] = Array.from(
  { length: 48 },
  (_, i) => {
    const p = SEED_PASSENGERS[i % SEED_PASSENGERS.length]
    return { ...p, id: `PA-${String(1000 + i).padStart(4, "0")}` }
  }
)

