import { PassengerPageHeader } from "./PassengerPageHeader"
import { PassengerDetailsCard } from "./PassengerDetailsCard"
import { PassengerTripHistory } from "./PassengerTripHistory"
import type { PassengerUser, PassengerRide } from "./types"

interface PassengerProfilePageProps {
  user: PassengerUser
  rides: PassengerRide[]
}

export function PassengerProfilePage({ user, rides }: PassengerProfilePageProps) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed"
  const isActive = (user as any).is_active !== false

  return (
    <div>
      <PassengerPageHeader name={fullName} userId={user.id} isActive={isActive} />

      <div className="grid gap-6 p-6 lg:grid-cols-[340px_1fr]">
        <PassengerDetailsCard user={user} />
        <PassengerTripHistory rides={rides} />
      </div>
    </div>
  )
}
