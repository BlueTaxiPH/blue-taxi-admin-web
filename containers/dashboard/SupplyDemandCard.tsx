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

function getSupplyStatus(ratio: number): {
  label: string
  color: string
  arcColor: string
  bg: string
} {
  if (ratio === 0)
    return {
      label: "Inactive",
      color: "#6B7280",
      arcColor: "#9CA3AF",
      bg: "#F9FAFB",
    }
  if (ratio < 0.8)
    return {
      label: "Undersupplied",
      color: "#DC2626",
      arcColor: "#EF4444",
      bg: "#FEF2F2",
    }
  if (ratio < 2.0)
    return {
      label: "Balanced",
      color: "#D97706",
      arcColor: "#F59E0B",
      bg: "#FFFBEB",
    }
  return {
    label: "Oversupplied",
    color: "#059669",
    arcColor: "#10B981",
    bg: "#ECFDF5",
  }
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

  const status = getSupplyStatus(ratio)

  return (
    <section
      className="flex flex-col rounded-xl bg-white p-5"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow:
          "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-base font-bold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Supply vs Demand
        </h2>
        <Info className="size-4 text-[#8BACC8]" aria-hidden />
      </div>

      {/* Status badge */}
      <div className="mt-3">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {/* Arc gauge */}
      <div className="flex justify-center">
        <div className="relative h-48 w-48">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
            aria-hidden
          >
            <path
              d="M15 54 A35 35 0 0 1 85 54"
              fill="none"
              stroke="#EEF3F9"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M15 54 A35 35 0 0 1 85 54"
              fill="none"
              stroke={status.arcColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={computeArcDash(ratio)}
              style={{
                transition:
                  "stroke-dasharray 0.6s ease, stroke 0.3s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono text-5xl font-bold leading-none text-[#0D1B2A]">
              {ratio}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8BACC8]">
              Ratio
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-2 gap-4 border-t pt-4"
        style={{ borderColor: "#EEF3F9" }}
      >
        <div className="text-center">
          <p className="text-xs text-[#8BACC8]">Online Drivers</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#0D1B2A]">
            {onlineDrivers.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#8BACC8]">Active Trips</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#0D1B2A]">
            {activeTrips.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="mt-4">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: "#EEF3F9" }}
        >
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{
              background: status.arcColor,
              width: `${coveragePercent}%`,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-[#8BACC8]">Driver Coverage</p>
          <p
            className="text-[11px] font-bold"
            style={{ color: status.color }}
          >
            {coveragePercent}%
          </p>
        </div>
      </div>
    </section>
  )
}
