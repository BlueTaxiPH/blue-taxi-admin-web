import { PassengerPageHeader } from "./PassengerPageHeader"
import { PassengerDetailsCard } from "./PassengerDetailsCard"
import { PassengerSavedPlaces } from "./PassengerSavedPlaces"
import { PassengerInternalNotes } from "./PassengerInternalNotes"
import { PassengerTripHistory } from "./PassengerTripHistory"

export function PassengerProfilePage() {
  return (
    <div className="p-6 space-y-6">
      <PassengerPageHeader />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px),minmax(0,1fr)]">
        <section className="space-y-6">
          <PassengerDetailsCard />

          <PassengerSavedPlaces />

          <PassengerInternalNotes />
        </section>

        <PassengerTripHistory />
      </div>
    </div>
  )
}
