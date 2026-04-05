import { PassengerProfilePage } from "./PassengerProfilePage"
import type { PassengerUser, PassengerRide } from "./types"

interface PassengerProfileSectionProps {
  user: PassengerUser
  rides: PassengerRide[]
}

export { PassengerProfileSection }
export type { PassengerUser, PassengerRide }

function PassengerProfileSection({ user, rides }: PassengerProfileSectionProps) {
  return <PassengerProfilePage user={user} rides={rides} />
}
