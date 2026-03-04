import type { Driver } from "@/types/driver"
import { fetchDriversForAdmin } from "@/lib/supabase/queries"
import { DriverManagementPage } from "@/containers/driver-management/DriverManagementPage"

export const dynamic = "force-dynamic"

export default async function DriversPage() {
  let drivers: Driver[] = []
  let fetchError: string | null = null
  try {
    drivers = await fetchDriversForAdmin()
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load drivers"
  }
  return (
    <DriverManagementPage
      initialDrivers={drivers}
      fetchError={fetchError}
    />
  )
}
