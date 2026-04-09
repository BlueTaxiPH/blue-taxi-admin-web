import type { DriverRow } from "@/lib/supabase/queries"
import type { Driver } from "@/types/driver"
import { DriverPageHeader } from "./DriverPageHeader"
import { DriverSummaryCard } from "./DriverSummaryCard"
import { EditDriverForm } from "./EditDriverForm"
import { DriverDocumentsSection } from "./DriverDocumentsSection"
import { DriverRidesCard } from "./DriverRidesCard"

interface DriverFormData {
  driverProfileId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  cityId: string | null
  cityName: string
  vehicleId: string | null
  vehicleMake: string
  vehicleModel: string
  vehiclePlateNumber: string
  vehicleColor: string
  vehicleType: "basic" | "xl"
  verificationStatus: string
}

interface City {
  id: string
  name: string
  is_active: boolean
}

interface DriverDocument {
  id: string
  document_type: string
  file_url: string | null
  is_verified: boolean
  rejection_reason: string | null
  created_at: string
}

interface Ride {
  id: string
  status: string
  final_fare: number | null
  estimated_fare: number | null
  created_at: string
  trip_completed_at: string | null
  pickup_address: string | null
  dropoff_address: string | null
}

interface DriverProfilePageProps {
  driverId: string
  userId: string
  driver: Driver
  raw: DriverRow
  avgRating: number
  recentRides: Ride[]
  documents: DriverDocument[]
  cities: City[]
  driverFormData: DriverFormData
  primaryVehicle: {
    id?: string
    make: string | null
    model: string | null
    plate_number: string | null
    color?: string | null
    type: string | null
  } | null
}

export function DriverProfilePage({
  driverId,
  userId,
  driver,
  raw,
  avgRating,
  recentRides,
  documents,
  cities,
  driverFormData,
  primaryVehicle,
}: DriverProfilePageProps) {
  const verificationStatus = raw.verification_status as string

  return (
    <div style={{ background: "#F4F6FB", minHeight: "100vh" }}>
      <DriverPageHeader
        driverId={driverId}
        driverName={driver.name}
        shortId={driver.id}
        verificationStatus={verificationStatus}
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Left: Summary Card */}
          <DriverSummaryCard
            driverId={driverId}
            userId={userId}
            driverName={driver.name}
            email={raw.users?.email ?? null}
            phone={raw.users?.phone ?? null}
            photoUrl={raw.users?.photo_url ?? null}
            isOnline={raw.is_online}
            avgRating={avgRating}
            totalRides={raw.total_rides ?? 0}
            createdAt={raw.created_at}
            verificationStatus={verificationStatus}
            vehicle={primaryVehicle}
            city={raw.cities?.name ?? "—"}
          />

          {/* Right: Stacked Cards */}
          <div className="space-y-6">
            <EditDriverForm driver={driverFormData} cities={cities} />
            <DriverDocumentsSection driverId={driverId} documents={documents} />
          </div>
        </div>

        {/* Full-width: Recent Rides */}
        <DriverRidesCard rides={recentRides} />
      </div>
    </div>
  )
}
