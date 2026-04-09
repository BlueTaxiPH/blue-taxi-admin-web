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
import type { DashboardMetrics } from "@/types/dashboard"

interface MetricCardData {
  title: string
  value: string
  prefix?: string
  context: string
  animationDelay: number
}

function buildMetricCards(metrics: DashboardMetrics): MetricCardData[] {
  const s = (n: number) => (n !== 1 ? "s" : "")

  return [
    {
      title: "Online Drivers",
      value: metrics.onlineDrivers.toLocaleString(),
      context: `of ${metrics.totalDrivers} registered \u00B7 ${metrics.activeTrips} on active trips`,
      animationDelay: 0,
    },
    {
      title: "Active Trips",
      value: metrics.activeTrips.toLocaleString(),
      context:
        metrics.activeTrips === 0
          ? "No trips in progress"
          : `${metrics.pendingBookings} pending + ${metrics.activeTrips} active`,
      animationDelay: 80,
    },
    {
      title: "Pending Bookings",
      value: metrics.pendingBookings.toLocaleString(),
      context:
        metrics.pendingBookings === 0
          ? "No pending bookings"
          : "Waiting for driver assignment",
      animationDelay: 160,
    },
    {
      title: "Completed Today",
      value: metrics.completedToday.toLocaleString(),
      context:
        metrics.completedToday === 0
          ? "No completed trips yet today"
          : "Revenue-generating trips today",
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
      animationDelay: 320,
    },
    {
      title: "Total Drivers",
      value: metrics.totalDrivers.toLocaleString(),
      context:
        metrics.onlineDrivers === 0
          ? "No drivers online"
          : `${metrics.onlineDrivers} online right now`,
      animationDelay: 400,
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

function MetricCard({ title, value, prefix, context, animationDelay, isLive }: MetricCardData & { isLive: boolean }) {
  const config = CARD_CONFIG[title] ?? { accent: "#1A56DB", icon: BarChart3 }
  const Icon = config.icon

  return (
    <div
      className="metric-card-hover dash-animate-in group relative overflow-hidden rounded-xl bg-white p-6 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow:
          "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: config.accent }}
        aria-hidden
      />

      <div className="pl-2">
        {/* Top row: icon + LIVE/IDLE badge */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: `${config.accent}14` }}
          >
            <Icon className="size-5" style={{ color: config.accent }} />
          </div>
          {isLive ? (
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
          ) : (
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "#F9FAFB", color: "#6B7280" }}
            >
              <span
                className="inline-flex size-1.5 rounded-full"
                style={{ background: "#D1D5DB" }}
              />
              Idle
            </span>
          )}
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
  const isLive = metrics.activeTrips > 0 || metrics.onlineDrivers > 0

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
        <div className="space-y-5">
          <DashboardHealthBar tripsByStatus={metrics.tripsByStatus} />
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((card) => (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                context={card.context}
                animationDelay={card.animationDelay}
                isLive={isLive}
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
