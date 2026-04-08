"use client"

import { ACTIVE_STATUSES } from "@/lib/trip-status"
import type { fetchRides } from "@/lib/supabase/queries"

type RideRow = Awaited<ReturnType<typeof fetchRides>>[number]

interface TripSummaryStatsProps {
  rides: RideRow[]
}

export function TripSummaryStats({ rides }: TripSummaryStatsProps) {
  const total     = rides.length
  const active    = rides.filter((r) => ACTIVE_STATUSES.has(r.status)).length
  const pending   = rides.filter((r) => r.status === "pending").length
  const completed = rides.filter((r) => r.status === "completed").length
  const cancelled = rides.filter((r) => r.status === "cancelled").length

  const stats = [
    { label: "Total Rides",  value: total,     accent: "#1A56DB" },
    { label: "Active",       value: active,    accent: "#1A56DB" },
    { label: "Completed",    value: completed, accent: "#059669" },
    { label: "Cancelled",    value: cancelled, accent: "#EF4444" },
  ]

  const segments = total > 0
    ? [
        { pct: (completed / total) * 100, color: "#059669" },
        { pct: (active    / total) * 100, color: "#1A56DB" },
        { pct: (pending   / total) * 100, color: "#F59E0B" },
        { pct: (cancelled / total) * 100, color: "#EF4444" },
      ].filter((s) => s.pct > 0)
    : []

  const legendItems = [
    { label: "Completed", count: completed, color: "#059669" },
    { label: "Active",    count: active,    color: "#1A56DB" },
    { label: "Pending",   count: pending,   color: "#F59E0B" },
    { label: "Cancelled", count: cancelled, color: "#EF4444" },
  ].filter((s) => s.count > 0)

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      {/* Stat cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ borderBottom: "1px solid #EEF3F9" }}
      >
        {stats.map(({ label, value, accent }, i) => (
          <div
            key={label}
            className="relative px-5 py-4"
            style={{
              borderRight: i < stats.length - 1 ? "1px solid #EEF3F9" : undefined,
            }}
          >
            <div
              className="absolute left-0 top-0 h-full w-[3px] rounded-tl-xl rounded-bl-xl"
              style={{ background: accent }}
              aria-hidden
            />
            <p className="pl-2 text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              {label}
            </p>
            <p className="pl-2 font-mono text-2xl font-bold text-[#0D1B2A]">{value}</p>
          </div>
        ))}
      </div>

      {/* Platform Health Bar */}
      {total > 0 ? (
        <div className="px-5 py-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
            Platform Health
          </p>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#EEF3F9]">
            {segments.map((seg, i) => (
              <div
                key={i}
                className="h-full transition-all duration-700"
                style={{ width: `${seg.pct}%`, background: seg.color }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
            {legendItems.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: s.color }}
                  aria-hidden
                />
                <span className="text-[11px] text-[#4A607A]">
                  <span className="font-mono font-semibold text-[#0D1B2A]">{s.count}</span>{" "}
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 py-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
            Platform Health
          </p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EEF3F9]" />
          <p className="mt-2 text-[11px] text-[#8BACC8]">No rides yet</p>
        </div>
      )}
    </div>
  )
}
