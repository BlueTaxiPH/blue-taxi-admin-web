"use client"

import { useState, useMemo } from "react"
import { Search, Route } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { rideStatusBadge } from "@/lib/badge-utils"
import { Badge } from "@/components/ui/badge"
import type { PassengerRide } from "./types"

interface PassengerTripHistoryProps {
  rides: PassengerRide[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  navigating_to_pickup: "En Route",
  arrived_at_pickup: "At Pickup",
  waiting_for_passenger: "Waiting",
  trip_in_progress: "In Progress",
  dropped_off: "Dropped Off",
  input_fare: "Entering Fare",
  fare_confirmed: "Fare Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function PassengerTripHistory({ rides }: PassengerTripHistoryProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return rides
    const q = search.toLowerCase()
    return rides.filter((ride) => {
      const driver = Array.isArray(ride.driver) ? ride.driver[0] : ride.driver
      const driverName = driver
        ? [driver.first_name, driver.last_name].filter(Boolean).join(" ").toLowerCase()
        : ""
      const rideId = ride.id.slice(0, 8).toLowerCase()
      const pickup = (ride.pickup_address ?? "").toLowerCase()
      const dropoff = (ride.dropoff_address ?? "").toLowerCase()
      return rideId.includes(q) || driverName.includes(q) || pickup.includes(q) || dropoff.includes(q)
    })
  }, [rides, search])

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div
        className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "#EEF3F9" }}
      >
        <div>
          <h2 className="text-sm font-semibold text-[#0D1B2A]">Trip History</h2>
          <p className="text-xs text-[#8BACC8]">Recent rides and transactions</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8BACC8]" />
          <Input
            type="search"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="uppercase text-muted-foreground">Trip ID</TableHead>
            <TableHead className="uppercase text-muted-foreground">Date</TableHead>
            <TableHead className="uppercase text-muted-foreground">Route</TableHead>
            <TableHead className="uppercase text-muted-foreground">Driver</TableHead>
            <TableHead className="uppercase text-muted-foreground">Status</TableHead>
            <TableHead className="text-right uppercase text-muted-foreground">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
                    <Route className="size-7 text-[#8BACC8]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0D1B2A]">No trips found</p>
                    {search ? (
                      <p className="mt-0.5 text-xs text-[#8BACC8]">Try adjusting your search</p>
                    ) : null}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((ride) => {
              const driver = Array.isArray(ride.driver) ? ride.driver[0] : ride.driver
              const driverName = driver
                ? [driver.first_name, driver.last_name].filter(Boolean).join(" ")
                : "Unassigned"

              const rideDate = new Date(ride.created_at)
              const dateStr = rideDate.toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
              })
              const timeStr = rideDate.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
              })

              const fare = ride.final_fare != null
                ? `₱${Number(ride.final_fare).toFixed(0)}`
                : "—"

              return (
                <TableRow key={ride.id} className="hover:bg-[#F4F8FF]">
                  <TableCell className="font-mono text-xs font-semibold text-[#1A56DB]">
                    #{ride.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-[#0D1B2A]">{dateStr}</span>
                      <span className="ml-1 font-mono text-xs text-[#8BACC8]">{timeStr}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[180px]">
                      <p className="truncate text-xs text-[#0D1B2A]" title={ride.pickup_address ?? ""}>
                        {ride.pickup_address ?? "—"}
                      </p>
                      <p className="truncate text-xs text-[#8BACC8]" title={ride.dropoff_address ?? ""}>
                        {ride.dropoff_address ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{driverName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={rideStatusBadge(ride.status)}>
                      {STATUS_LABELS[ride.status] ?? ride.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {fare}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <div
        className="border-t px-5 py-3 text-xs text-[#8BACC8]"
        style={{ borderColor: "#EEF3F9" }}
      >
        Showing {filtered.length} of {rides.length} trips
      </div>
    </div>
  )
}
