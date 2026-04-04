import { Info } from "lucide-react"

interface SupplyDemandCardProps {
  onlineDrivers: number
  activeTrips: number
}

const ARC_TOTAL_LENGTH = 110
const MIN_DASH = 8

function computeArcDash(ratio: number): string {
  const clamped = Math.min(ratio, 3)
  const fraction = Math.min(clamped / 3, 1)
  const dash = Math.max(fraction * ARC_TOTAL_LENGTH, MIN_DASH)
  return `${dash} ${ARC_TOTAL_LENGTH}`
}

export function SupplyDemandCard({ onlineDrivers, activeTrips }: SupplyDemandCardProps) {
  const ratio = activeTrips > 0
    ? Math.round((onlineDrivers / activeTrips) * 10) / 10
    : onlineDrivers > 0
      ? onlineDrivers
      : 0

  const coveragePercent = activeTrips > 0
    ? Math.min(Math.round((onlineDrivers / activeTrips) * 100), 100)
    : onlineDrivers > 0
      ? 100
      : 0

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Supply vs Demand
        </h2>
        <Info className="size-4" aria-hidden />
      </div>

      <div className="flex justify-center">
        <div className="relative h-74 w-74">
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
            <path
              d="M15 54 A35 35 0 0 1 85 54"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M15 54 A35 35 0 0 1 85 54"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={computeArcDash(ratio)}
            />
          </svg>
          <div className="absolute inset-1 flex flex-col items-center justify-center">
            <p className="text-5xl font-semibold text-foreground">{ratio}</p>
            <p className="mt-1 text-xs font-semibold tracking-wider text-muted-foreground">
              RATIO
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center -mt-8">
        <div>
          <p className="text-sm text-muted-foreground">Online Drivers</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {onlineDrivers.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Active Trips</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {activeTrips.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-[#1A56DB]"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {coveragePercent}% Coverage
        </p>
      </div>
    </section>
  )
}
