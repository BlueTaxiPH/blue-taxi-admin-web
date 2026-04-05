import type { Driver } from "@/types/driver"
import { fetchDriversForAdmin, fetchCities } from "@/lib/supabase/queries"
import { DriverManagementPage } from "@/containers/driver-management/DriverManagementPage"

export const dynamic = "force-dynamic"

export default async function DriversPage() {
  let drivers: Driver[] = []
  let cities: Array<{ id: string; name: string; is_active: boolean }> = []
  let fetchError: string | null = null
  try {
    ;[drivers, cities] = await Promise.all([
      fetchDriversForAdmin(),
      fetchCities(),
    ])
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load drivers"
  }
  return (
    <DriverManagementPage
      initialDrivers={drivers}
      cities={cities}
      fetchError={fetchError}
    />
  )
}
