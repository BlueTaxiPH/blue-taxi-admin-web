import { DashboardPage } from "./DashboardPage"
import type { DashboardMetrics } from "@/types/dashboard"

interface DashboardSectionProps {
  metrics: DashboardMetrics
}

export function DashboardSection({ metrics }: DashboardSectionProps) {
  return <DashboardPage metrics={metrics} />
}
