import { notFound } from "next/navigation"
import { fetchDriverById, fetchDriverDocuments, fetchCities } from "@/lib/supabase/queries"
import { DriverProfilePage } from "@/containers/driver-detail"

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let data
  try {
    data = await fetchDriverById(id)
  } catch {
    notFound()
  }

  const { driver, raw, avgRating, recentRides } = data

  let documents: Awaited<ReturnType<typeof fetchDriverDocuments>> = []
  let cities: Awaited<ReturnType<typeof fetchCities>> = []
  try {
    documents = await fetchDriverDocuments(id)
  } catch {}
  try {
    cities = await fetchCities()
  } catch {}

  const primaryVehicle = raw.vehicles?.[0] ?? null
  const driverFormData = {
    driverProfileId: raw.id,
    userId: raw.user_id,
    firstName: raw.users?.first_name ?? "",
    lastName: raw.users?.last_name ?? "",
    email: raw.users?.email ?? "",
    phone: raw.users?.phone ?? "",
    cityId: raw.city_id,
    cityName: raw.cities?.name ?? "",
    vehicleId: primaryVehicle ? (primaryVehicle as Record<string, unknown>).id as string ?? null : null,
    vehicleMake: primaryVehicle?.make ?? "",
    vehicleModel: primaryVehicle?.model ?? "",
    vehiclePlateNumber: primaryVehicle?.plate_number ?? "",
    vehicleColor: ((primaryVehicle as Record<string, unknown>)?.color as string) ?? "",
    vehicleType: (primaryVehicle?.type === "xl" ? "xl" : "basic") as "basic" | "xl",
    verificationStatus: raw.verification_status,
  }

  return (
    <DriverProfilePage
      driverId={raw.id}
      userId={raw.user_id}
      driver={driver}
      raw={raw}
      avgRating={avgRating}
      recentRides={recentRides}
      documents={documents}
      cities={cities}
      driverFormData={driverFormData}
      primaryVehicle={primaryVehicle}
    />
  )
}
