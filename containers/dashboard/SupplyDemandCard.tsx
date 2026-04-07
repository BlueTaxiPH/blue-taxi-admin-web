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

export function SupplyDemandCard({
  onlineDrivers,
  activeTrips,
}: SupplyDemandCardProps) {
  const ratio =
    activeTrips > 0
      ? Math.round((onlineDrivers / activeTrips) * 10) / 10
      : onlineDrivers > 0
        ? onlineDrivers
        : 0

  const coveragePercent =
    activeTrips > 0
      ? Math.min(Math.round((onlineDrivers / activeTrips) * 100), 100)
      : onlineDrivers > 0
        ? 100
        : 0

  return (
    <section
      className="rounded-xl bg-white p-5"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow:
          "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-bold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Supply vs Demand
        </h2>
        <Info className="size-4 text-[#4A607A]" aria-hidden />
      </div>

      <div className="flex justify-center">
        <div className="relative h-74 w-74">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
            aria-hidden
          >
            <path
              d="M15 54 A35 35 0 0 1 85 54"
              fill="none"
              stroke="#DCE6F1"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M15 54 A35 35 0 0 1 85 54"
              fill="none"
              stroke="#1A56DB"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={computeArcDash(ratio)}
            />
          </svg>
          <div className="absolute inset-1 flex flex-col items-center justify-center">
            <p
              className="text-5xl font-bold text-[#0D1B2A]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              {ratio}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#4A607A]">
              Ratio
            </p>
          </div>
        </div>
      </div>

      <div className="-mt-8 grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-sm text-[#4A607A]">Online Drivers</p>
          <p
            className="mt-1 text-2xl font-bold text-[#0D1B2A]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            {onlineDrivers.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#4A607A]">Active Trips</p>
          <p
            className="mt-1 text-2xl font-bold text-[#0D1B2A]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            {activeTrips.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div
          className="h-2 w-full rounded-full"
          style={{ background: "#EEF3F9" }}
        >
          <div
            className="h-2 rounded-full"
            style={{
              background: "#1A56DB",
              width: `${coveragePercent}%`,
            }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-[#4A607A]">
          {coveragePercent}% Coverage
        </p>
      </div>
    </section>
  )
}
