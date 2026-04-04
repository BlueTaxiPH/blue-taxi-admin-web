import { PassengerPageHeader } from "./PassengerPageHeader"
import { PassengerDetailsCard } from "./PassengerDetailsCard"
import { PassengerSavedPlaces } from "./PassengerSavedPlaces"
import { PassengerInternalNotes } from "./PassengerInternalNotes"
import { PassengerTripHistory } from "./PassengerTripHistory"
import type { PassengerUser, PassengerRide } from "./types"

interface PassengerProfilePageProps {
  user: PassengerUser
  rides: PassengerRide[]
}

export function PassengerProfilePage({ user, rides }: PassengerProfilePageProps) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed"

  return (
    <div>
      <PassengerPageHeader name={fullName} userId={user.id} />

      <div className="grid p-6 gap-6 xl:grid-cols-[minmax(0,340px),minmax(0,1fr)]">
        <section className="space-y-6">
          <PassengerDetailsCard user={user} />

          <div className="grid grid-cols-[320px_1fr] gap-6">
            <div className="space-y-6">
              <PassengerSavedPlaces />
              <PassengerInternalNotes />
            </div>
            <PassengerTripHistory rides={rides} />
          </div>
        </section>
      </div>
    </div>
  );
}
