import { fetchDashboardMetrics } from "@/lib/supabase/queries"
import { DashboardSection } from "@/containers/dashboard"
import type { DashboardMetrics } from "@/types/dashboard"

export const dynamic = "force-dynamic"

const fallbackMetrics: DashboardMetrics = {
  onlineDrivers: 0,
  activeTrips: 0,
  pendingBookings: 0,
  completedToday: 0,
  revenueToday: 0,
  totalDrivers: 0,
  tripsByStatus: {},
}

export default async function DashboardPage() {
  const metrics = await fetchDashboardMetrics().catch(() => fallbackMetrics)
  return <DashboardSection metrics={metrics} />
}
