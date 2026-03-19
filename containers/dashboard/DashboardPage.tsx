import { DashboardHeader } from "./DashboardHeader"
import { SupplyDemandCard } from "./SupplyDemandCard"

const metricCards = [
  { title: "Online Drivers", value: "1,240", delta: "+12%", deltaTone: "up" },
  { title: "Active Trips", value: "843", delta: "+5%", deltaTone: "up" },
  { title: "Pending Bookings", value: "45", delta: "-2%", deltaTone: "down" },
  { title: "Avg Match Time", value: "2m 14s", delta: "-8s", deltaTone: "up" },
  { title: "Cancellation Rate", value: "4.2%", delta: "+0.5%", deltaTone: "down" },
  { title: "Today's Revenue", value: "$42,390", delta: "+8%", deltaTone: "up" },
] as const

function TrendLine({ tone }: { tone: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 80 24"
      className="mt-3 h-6 w-20"
      fill="none"
      aria-hidden
    >
      <path
        d={
          tone === "up"
            ? "M2 18 L16 16 L28 9 L39 12 L50 6 L62 8 L77 3"
            : "M2 5 L16 8 L28 7 L39 13 L50 11 L62 16 L77 18"
        }
        stroke={tone === "up" ? "#3b82f6" : "#f43f5e"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricCard({
  title,
  value,
  delta,
  deltaTone,
}: {
  title: string
  value: string
  delta: string
  deltaTone: "up" | "down"
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
          All Cities
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        <span
          className={
            deltaTone === "up"
              ? "rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700"
              : "rounded bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-700"
          }
        >
          {delta}
        </span>
      </div>
      <TrendLine tone={deltaTone} />
    </div>
  )
}

export function DashboardPage() {
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
              delta={card.delta}
              deltaTone={card.deltaTone}
            />
          ))}
        </section>
        <SupplyDemandCard />
      </div>
    </div>
  )
}
