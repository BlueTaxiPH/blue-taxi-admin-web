import { fetchPassengers } from "@/lib/supabase/queries"
import { PassengerManagementSection } from "@/containers/passenger-management"
import type { Passenger } from "@/types/passenger"

export const dynamic = "force-dynamic"

export default async function PassengersPage() {
  const rows = await fetchPassengers()

  const passengers: Passenger[] = rows.map((row, index) => {
    const profile = Array.isArray(row.passenger_profiles)
      ? row.passenger_profiles[0]
      : row.passenger_profiles

    return {
      id: `PA-${String(index + 1).padStart(4, "0")}`,
      supabaseId: row.id,
      name: [row.first_name, row.last_name].filter(Boolean).join(" ") || "Unnamed",
      email: row.email ?? "",
      phone: row.phone ?? "",
      totalTrips: profile?.total_rides ?? 0,
      rating: profile?.avg_rating ?? null,
      status: "Active" as const,
      memberSince: row.created_at,
    }
  })

  return <PassengerManagementSection initialPassengers={passengers} />
}
