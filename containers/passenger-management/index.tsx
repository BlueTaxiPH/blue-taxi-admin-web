import { PassengerManagementPage } from "./PassengerManagementPage"
import type { Passenger } from "@/types/passenger"

interface PassengerManagementSectionProps {
  initialPassengers: Passenger[]
}

export function PassengerManagementSection({ initialPassengers }: PassengerManagementSectionProps) {
  return <PassengerManagementPage initialPassengers={initialPassengers} />
}
