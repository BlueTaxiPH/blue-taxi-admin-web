import { fetchDashboardMetrics } from "@/lib/supabase/queries"
import { DashboardSection } from "@/containers/dashboard"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const metrics = await fetchDashboardMetrics()
  return <DashboardSection metrics={metrics} />
}
