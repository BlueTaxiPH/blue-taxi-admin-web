export const dynamic = "force-dynamic"

import { fetchRides } from "@/lib/supabase/queries"
import { TripManagementPage } from "@/containers/trip-management"

export default async function TripManagementPageRoute() {
  let rides: Awaited<ReturnType<typeof fetchRides>> = []
  try {
    rides = await fetchRides()
  } catch (err) {
    console.error("[TripManagement] fetch error:", err)
  }
  return <TripManagementPage rides={rides} />
}
