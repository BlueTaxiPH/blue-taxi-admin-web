import {
  Users,
  Car,
  Clock,
  CheckCircle,
  DollarSign,
  BarChart3,
} from "lucide-react"
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
    {
      title: "Pending Bookings",
      value: metrics.pendingBookings.toLocaleString(),
    },
    {
      title: "Completed Today",
      value: metrics.completedToday.toLocaleString(),
    },
    {
      title: "Today's Revenue",
      value: `\u20B1${metrics.revenueToday.toLocaleString()}`,
    },
    { title: "Total Drivers", value: metrics.totalDrivers.toLocaleString() },
  ]
}

const CARD_CONFIG: Record<
  string,
  { accent: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
> = {
  "Online Drivers":   { accent: "#1A56DB", icon: Users },
  "Active Trips":     { accent: "#10B981", icon: Car },
  "Pending Bookings": { accent: "#F59E0B", icon: Clock },
  "Completed Today":  { accent: "#10B981", icon: CheckCircle },
  "Today's Revenue":  { accent: "#8B5CF6", icon: DollarSign },
  "Total Drivers":    { accent: "#1A56DB", icon: Users },
}

function MetricCard({ title, value }: { title: string; value: string }) {
  const config = CARD_CONFIG[title] ?? { accent: "#1A56DB", icon: BarChart3 }
  const Icon = config.icon

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white p-5"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow:
          "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: config.accent }}
        aria-hidden
      />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: `${config.accent}18` }}
          >
            <Icon className="size-4" style={{ color: config.accent }} />
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#EBF3FF", color: "#1A56DB" }}
          >
            Live
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-[#4A607A]">{title}</p>
        <p
          className="mt-1 text-3xl font-bold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          {value}
        </p>
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
      <div className="grid gap-5 p-7 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
