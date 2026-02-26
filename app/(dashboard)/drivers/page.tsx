import { fetchDrivers } from "@/lib/supabase/queries"
import { DriverManagementPage } from "@/containers/driver-management/DriverManagementPage"

export default async function DriversPage() {
  let drivers = []
  try {
    drivers = await fetchDrivers()
  } catch {
    // Fall through with empty list — page handles it gracefully
  }
  return <DriverManagementPage initialDrivers={drivers} />
}
