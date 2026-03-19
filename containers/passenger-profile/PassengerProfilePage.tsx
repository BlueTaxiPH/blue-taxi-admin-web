import { PassengerPageHeader } from "./PassengerPageHeader"
import { PassengerDetailsCard } from "./PassengerDetailsCard"
import { PassengerSavedPlaces } from "./PassengerSavedPlaces"
import { PassengerInternalNotes } from "./PassengerInternalNotes"
import { PassengerTripHistory } from "./PassengerTripHistory"

export function PassengerProfilePage() {
  return (
    <div>
      <PassengerPageHeader />

      <div className="grid p-6 gap-6 xl:grid-cols-[minmax(0,340px),minmax(0,1fr)]">
        <section className="space-y-6">
          <PassengerDetailsCard />

          <div className="grid grid-cols-[320px_1fr] gap-6">
            <div className="space-y-6">
              <PassengerSavedPlaces />
              <PassengerInternalNotes />  
            </div>
            <PassengerTripHistory />
          </div>
        </section>
      </div>
    </div>
  );
}
