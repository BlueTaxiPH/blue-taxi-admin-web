import { DashboardHeader } from "./DashboardHeader"
import { SupplyDemandCard } from "./SupplyDemandCard"
import type { DashboardMetrics } from "@/types/dashboard"

interface MetricCardData {
  title: string
  value: string
}

function buildMetricCards(metrics: DashboardMetrics): MetricCardData[] {
  return [
    { title: "Online Drivers", value: metrics.onlineDrivers.toLocaleString() },
    { title: "Active Trips", value: metrics.activeTrips.toLocaleString() },
    { title: "Pending Bookings", value: metrics.pendingBookings.toLocaleString() },
    { title: "Completed Today", value: metrics.completedToday.toLocaleString() },
    { title: "Today's Revenue", value: `₱${metrics.revenueToday.toLocaleString()}` },
    { title: "Total Drivers", value: metrics.totalDrivers.toLocaleString() },
  ]
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
          Live
        </span>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  )
}

interface DashboardPageProps {
  metrics: DashboardMetrics
}

export function DashboardPage({ metrics }: DashboardPageProps) {
  const metricCards = buildMetricCards(metrics)

  return (
    <div>
      <DashboardHeader />
      <div className="p-6 grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((card) => (
            <MetricCard
              key={card.title}
              title={card.title}
              value={card.value}
            />
          ))}
        </section>
        <SupplyDemandCard
          onlineDrivers={metrics.onlineDrivers}
          activeTrips={metrics.activeTrips}
        />
      </div>
    </div>
  )
}
