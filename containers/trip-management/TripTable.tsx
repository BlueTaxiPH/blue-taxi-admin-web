"use client"

import { Route } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { rideStatusBadge } from "@/lib/badge-utils"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/trip-status"
import type { fetchRides } from "@/lib/supabase/queries"

type RideRow = Awaited<ReturnType<typeof fetchRides>>[number]

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function Initials({
  name,
  className,
}: {
  name: string
  className: string
}) {
  const parts = name.trim().split(" ")
  const init =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.[0] ?? "?").toUpperCase()
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        className
      )}
      aria-hidden
    >
      {init}
    </div>
  )
}

interface TripTableProps {
  rides: RideRow[]
}

export function TripTable({ rides }: TripTableProps) {
  if (rides.length === 0) {
    return (
      <div
        className="rounded-xl bg-white"
        style={{
          border: "1px solid #DCE6F1",
          boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
        }}
      >
        <Table>
          <TableHeader>
            <TripTableHeaders />
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
                    <Route className="size-7 text-[#8BACC8]" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-[#0D1B2A]">No trips found</p>
                  <p className="text-xs text-[#8BACC8]">Try adjusting your search or filters</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      <Table>
        <TableHeader>
          <TripTableHeaders />
        </TableHeader>
        <TableBody>
          {rides.map((ride) => {
            const passenger = ride.passenger as { first_name?: string | null; last_name?: string | null } | null
            const driver = ride.driver as { first_name?: string | null; last_name?: string | null } | null

            const passengerName = passenger
              ? [passenger.first_name, passenger.last_name].filter(Boolean).join(" ")
              : ""
            const driverName = driver
              ? [driver.first_name, driver.last_name].filter(Boolean).join(" ")
              : ""

            const fare =
              ride.final_fare != null
                ? `₱${Number(ride.final_fare).toFixed(0)}`
                : ride.estimated_fare != null
                  ? `₱${Number(ride.estimated_fare).toFixed(0)}`
                  : null

            const stripColor = STATUS_COLORS[ride.status] ?? "#9CA3AF"
            const fullDate = new Date(ride.created_at).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Manila",
            })

            return (
              <TableRow
                key={ride.id}
                className="group transition-colors hover:bg-[#F4F8FF]"
              >
                {/* Status strip */}
                <TableCell className="w-1 p-0 pl-0 pr-2">
                  <div
                    className="min-h-[52px] w-1 rounded-r-sm transition-all duration-300"
                    style={{ background: stripColor }}
                    aria-hidden
                  />
                </TableCell>

                {/* Ride ID */}
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-[#0D1B2A]">
                    #{ride.id.slice(0, 8).toUpperCase()}
                  </span>
                </TableCell>

                {/* Passenger */}
                <TableCell>
                  {passengerName ? (
                    <div className="flex items-center gap-2">
                      <Initials
                        name={passengerName}
                        className="size-7 bg-blue-50 text-blue-700"
                      />
                      <span className="text-sm text-[#0D1B2A]">{passengerName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#8BACC8]">—</span>
                  )}
                </TableCell>

                {/* Driver */}
                <TableCell>
                  {driverName ? (
                    <div className="flex items-center gap-2">
                      <Initials
                        name={driverName}
                        className="size-7 bg-slate-100 text-slate-600"
                      />
                      <span className="text-sm text-[#0D1B2A]">{driverName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#8BACC8]">—</span>
                  )}
                </TableCell>

                {/* Route */}
                <TableCell className="max-w-52">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="truncate text-xs text-[#0D1B2A]"
                      title={ride.pickup_address ?? undefined}
                    >
                      {ride.pickup_address ?? "—"}
                    </span>
                    <span
                      className="truncate text-xs text-[#4A607A]"
                      title={ride.dropoff_address ?? undefined}
                    >
                      {ride.dropoff_address ?? "—"}
                    </span>
                  </div>
                </TableCell>

                {/* Fare */}
                <TableCell>
                  {fare != null ? (
                    <span className="font-mono text-sm font-semibold text-[#0D1B2A]">
                      {fare}
                    </span>
                  ) : (
                    <span className="text-sm text-[#8BACC8]">—</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("text-[11px] font-medium", rideStatusBadge(ride.status))}
                  >
                    {STATUS_LABELS[ride.status] ?? ride.status}
                  </Badge>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <span
                    className="text-xs text-[#4A607A]"
                    title={fullDate}
                  >
                    {relativeTime(ride.created_at)}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function TripTableHeaders() {
  return (
    <TableRow style={{ borderColor: "#EEF3F9" }}>
      <TableHead className="w-1 p-0" />
      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
        Ride ID
      </TableHead>
      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
        Passenger
      </TableHead>
      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
        Driver
      </TableHead>
      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
        Route
      </TableHead>
      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
        Fare
      </TableHead>
      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
        Status
      </TableHead>
      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
        Date
      </TableHead>
    </TableRow>
  )
}
