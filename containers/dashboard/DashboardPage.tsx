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
  prefix?: string
  context: string
}

function buildMetricCards(metrics: DashboardMetrics): MetricCardData[] {
  return [
    {
      title: "Online Drivers",
      value: metrics.onlineDrivers.toLocaleString(),
      context: `of ${metrics.totalDrivers} registered`,
    },
    {
      title: "Active Trips",
      value: metrics.activeTrips.toLocaleString(),
      context: "currently in progress",
    },
    {
      title: "Pending Bookings",
      value: metrics.pendingBookings.toLocaleString(),
      context: "awaiting driver acceptance",
    },
    {
      title: "Completed Today",
      value: metrics.completedToday.toLocaleString(),
      context: "since midnight",
    },
    {
      title: "Today's Revenue",
      value: metrics.revenueToday.toLocaleString(),
      prefix: "\u20B1",
      context: "platform gross today",
    },
    {
      title: "Total Drivers",
      value: metrics.totalDrivers.toLocaleString(),
      context: "registered in system",
    },
  ]
}

const CARD_CONFIG: Record<
  string,
  {
    accent: string
    icon: React.ComponentType<{
      className?: string
      style?: React.CSSProperties
    }>
  }
> = {
  "Online Drivers": { accent: "#1A56DB", icon: Users },
  "Active Trips": { accent: "#10B981", icon: Car },
  "Pending Bookings": { accent: "#F59E0B", icon: Clock },
  "Completed Today": { accent: "#10B981", icon: CheckCircle },
  "Today's Revenue": { accent: "#8B5CF6", icon: DollarSign },
  "Total Drivers": { accent: "#1A56DB", icon: Users },
}

function MetricCard({ title, value, prefix, context }: MetricCardData) {
  const config = CARD_CONFIG[title] ?? { accent: "#1A56DB", icon: BarChart3 }
  const Icon = config.icon

  return (
    <div
      className="metric-card-hover group relative overflow-hidden rounded-xl bg-white p-6 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow:
          "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: config.accent }}
        aria-hidden
      />

      <div className="pl-2">
        {/* Top row: icon + pulsing LIVE badge */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: `${config.accent}14` }}
          >
            <Icon className="size-5" style={{ color: config.accent }} />
          </div>
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#ECFDF5", color: "#059669" }}
          >
            <span className="relative flex size-1.5 shrink-0">
              <span
                className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
                style={{ background: "#34D399" }}
              />
              <span
                className="relative inline-flex size-1.5 rounded-full"
                style={{ background: "#10B981" }}
              />
            </span>
            Live
          </span>
        </div>

        {/* Label */}
        <p className="mt-4 text-sm font-medium text-[#4A607A]">{title}</p>

        {/* Value — monospace for data */}
        <p className="mt-1 text-[2rem] font-bold leading-none text-[#0D1B2A]">
          {prefix ? <span className="font-sans text-[1.25rem]">{prefix}</span> : null}
          <span className="font-mono">{value}</span>
        </p>

        {/* Context sub-label */}
        <p className="mt-2 text-[11px] text-[#8BACC8]">{context}</p>
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
    <div className="flex min-h-screen flex-col">
      {/* Top accent line */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #1A56DB 0%, #3B82F6 50%, #1A56DB 100%)",
        }}
      />
      <DashboardHeader />
      <div className="grid content-start gap-5 p-7 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((card) => (
            <MetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              prefix={card.prefix}
              context={card.context}
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
