"use client"

import { useState } from "react"
import { Route, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Ride {
  id: string
  status: string
  final_fare: number | null
  estimated_fare: number | null
  created_at: string
  trip_completed_at: string | null
  pickup_address: string | null
  dropoff_address: string | null
}

interface DriverRidesCardProps {
  rides: Ride[]
}

const PAGE_SIZE = 5

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  completed: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  cancelled: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
}

const DEFAULT_COLOR = { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" }

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function DriverRidesCard({ rides }: DriverRidesCardProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(rides.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const pageRides = rides.slice(start, start + PAGE_SIZE)

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "#EEF3F9" }}
      >
        <h3
          className="font-semibold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Recent Rides
        </h3>
      </div>

      {rides.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
          <div
            className="flex size-12 items-center justify-center rounded-full"
            style={{ background: "#EEF3F9" }}
          >
            <Route className="size-5 text-[#8BACC8]" aria-hidden />
          </div>
          <p className="text-sm text-[#8BACC8]">No rides yet</p>
        </div>
      ) : (
        <>
          <div className="divide-y" style={{ borderColor: "#EEF3F9" }}>
            {pageRides.map((ride) => {
              const colors = STATUS_COLORS[ride.status] ?? DEFAULT_COLOR
              const fare =
                ride.final_fare != null
                  ? `₱${Number(ride.final_fare).toFixed(0)}`
                  : ride.estimated_fare != null
                    ? `₱${Number(ride.estimated_fare).toFixed(0)}`
                    : "—"
              const dateStr = formatRelativeDate(
                ride.trip_completed_at ?? ride.created_at
              )

              return (
                <div
                  key={ride.id}
                  className="grid items-center gap-3 px-6 py-3"
                  style={{ gridTemplateColumns: "4px 1fr 80px 100px" }}
                >
                  <div
                    className="w-1 self-stretch rounded-full"
                    style={{ background: colors.text }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0D1B2A]">
                      {ride.pickup_address ?? "Pickup"} → {ride.dropoff_address ?? "Dropoff"}
                    </p>
                    <p className="text-xs text-[#8BACC8]">{dateStr}</p>
                  </div>
                  <p className="text-center font-mono text-sm font-semibold text-[#0D1B2A]">
                    {fare}
                  </p>
                  <div className="flex justify-end">
                    <span
                      className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {ride.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between border-t px-6 py-3"
            style={{ borderColor: "#EEF3F9" }}
          >
            <p className="text-sm text-[#8BACC8]">
              {start + 1}–{Math.min(start + PAGE_SIZE, rides.length)} of{" "}
              {rides.length} rides
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-2 font-mono text-sm text-[#4A607A]">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
