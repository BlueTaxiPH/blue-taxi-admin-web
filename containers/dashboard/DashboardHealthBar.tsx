interface DashboardHealthBarProps {
  tripsByStatus: Record<string, number>
}

const SEGMENTS = [
  {
    label: "Pending",
    color: "#F59E0B",
    statuses: ["pending"],
  },
  {
    label: "En Route",
    color: "#1A56DB",
    statuses: ["accepted", "navigating_to_pickup", "arrived_at_pickup", "waiting_for_passenger"],
  },
  {
    label: "In Progress",
    color: "#10B981",
    statuses: ["trip_in_progress"],
  },
  {
    label: "Completing",
    color: "#0D9488",
    statuses: ["dropped_off", "input_fare", "fare_confirmed"],
  },
]

export function DashboardHealthBar({ tripsByStatus }: DashboardHealthBarProps) {
  const segments = SEGMENTS.map((s) => ({
    ...s,
    count: s.statuses.reduce((n, k) => n + (tripsByStatus[k] ?? 0), 0),
  }))

  const total = segments.reduce((n, s) => n + s.count, 0)

  return (
    <div
      className="overflow-hidden rounded-xl bg-white p-5"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      <div className="flex items-center justify-between">
        <h2
          className="text-sm font-bold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Platform Activity
        </h2>
        {total > 0 ? (
          <span className="font-mono text-xs font-semibold text-[#4A607A]">
            {total} active
          </span>
        ) : null}
      </div>

      {/* Health bar */}
      <div
        className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: "#EEF3F9" }}
      >
        {total > 0
          ? segments.map((seg) =>
              seg.count > 0 ? (
                <div
                  key={seg.label}
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${(seg.count / total) * 100}%`,
                    background: seg.color,
                  }}
                />
              ) : null,
            )
          : null}
      </div>

      {/* Legend or empty state */}
      {total === 0 ? (
        <p className="mt-2.5 text-xs text-[#8BACC8]">No active trips right now</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {segments.map((seg) =>
            seg.count > 0 ? (
              <span key={seg.label} className="flex items-center gap-1.5 text-xs text-[#4A607A]">
                <span
                  className="size-2 rounded-full"
                  style={{ background: seg.color }}
                  aria-hidden
                />
                {seg.label}
                <span className="font-mono font-semibold text-[#0D1B2A]">{seg.count}</span>
              </span>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
