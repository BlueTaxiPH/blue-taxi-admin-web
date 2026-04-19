import {
  Users,
  Car,
  Clock,
  CheckCircle,
  DollarSign,
  BarChart3,
} from "lucide-react"
import { DashboardHeader } from "./DashboardHeader"
import { DashboardHealthBar } from "./DashboardHealthBar"
import { SupplyDemandCard } from "./SupplyDemandCard"
import { MetricCard } from "@/components/metric-card"
import type { DashboardMetrics } from "@/types/dashboard"

type MetricIcon = React.ComponentType<{
  className?: string
  style?: React.CSSProperties
}>

interface MetricCardData {
  title: string
  value: string
  prefix?: string
  context: string
  icon: MetricIcon
  animationDelay: number
}

const LIVE_TOOLTIP = "Updated from Supabase on each page refresh — data reflects current online drivers and active rides."
const IDLE_TOOLTIP = "No drivers online and no active rides right now."

function buildMetricCards(metrics: DashboardMetrics): MetricCardData[] {
  const s = (n: number) => (n !== 1 ? "s" : "")

  return [
    {
      title: "Online Drivers",
      value: metrics.onlineDrivers.toLocaleString(),
      context: `of ${metrics.totalDrivers} registered \u00B7 ${metrics.activeTrips} on active trips`,
      icon: Users,
      animationDelay: 0,
    },
    {
      title: "Active Trips",
      value: metrics.activeTrips.toLocaleString(),
      context:
        metrics.activeTrips === 0
          ? "No trips in progress"
          : `${metrics.pendingBookings} pending + ${metrics.activeTrips} active`,
      icon: Car,
      animationDelay: 80,
    },
    {
      title: "Pending Bookings",
      value: metrics.pendingBookings.toLocaleString(),
      context:
        metrics.pendingBookings === 0
          ? "No pending bookings"
          : "Waiting for driver assignment",
      icon: Clock,
      animationDelay: 160,
    },
    {
      title: "Completed Today",
      value: metrics.completedToday.toLocaleString(),
      context:
        metrics.completedToday === 0
          ? "No completed trips yet today"
          : "Revenue-generating trips today",
      icon: CheckCircle,
      animationDelay: 240,
    },
    {
      title: "Today's Revenue",
      value: new Intl.NumberFormat("en-PH").format(Math.round(metrics.revenueToday)),
      prefix: "\u20B1",
      context:
        metrics.revenueToday === 0
          ? "No revenue yet today"
          : `From ${metrics.completedToday} completed trip${s(metrics.completedToday)}`,
      icon: DollarSign,
      animationDelay: 320,
    },
    {
      title: "Total Drivers",
      value: metrics.totalDrivers.toLocaleString(),
      context:
        metrics.onlineDrivers === 0
          ? "No drivers online"
          : `${metrics.onlineDrivers} online right now`,
      icon: BarChart3,
      animationDelay: 400,
    },
  ]
}

interface DashboardPageProps {
  metrics: DashboardMetrics
}

export function DashboardPage({ metrics }: DashboardPageProps) {
  const metricCards = buildMetricCards(metrics)
  const isLive = metrics.activeTrips > 0 || metrics.onlineDrivers > 0

  return (
    <div className="flex min-h-screen flex-col">
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #1A56DB 0%, #3B82F6 50%, #1A56DB 100%)",
        }}
      />
      <DashboardHeader />
      <div className="grid content-start gap-5 p-7 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <DashboardHealthBar tripsByStatus={metrics.tripsByStatus} />
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((card) => (
              <MetricCard
                key={card.title}
                label={card.title}
                value={card.value}
                prefix={card.prefix}
                context={card.context}
                icon={card.icon}
                animationDelay={card.animationDelay}
                badge={
                  isLive
                    ? { label: "Live", tone: "live", tooltip: LIVE_TOOLTIP }
                    : { label: "Idle", tone: "idle", tooltip: IDLE_TOOLTIP }
                }
              />
            ))}
          </section>
        </div>
        <SupplyDemandCard
          onlineDrivers={metrics.onlineDrivers}
          activeTrips={metrics.activeTrips}
        />
      </div>
    </div>
  )
}
