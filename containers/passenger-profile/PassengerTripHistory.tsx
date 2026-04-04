import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PassengerRide } from "./types"

interface PassengerTripHistoryProps {
  rides: PassengerRide[]
}

export function PassengerTripHistory({ rides }: PassengerTripHistoryProps) {
  return (
    <section className="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Trip History
          </h2>
          <p className="text-xs text-muted-foreground">
            Recent rides and transactions
          </p>
        </div>
        <div className="flex flex-row items-center gap-2 text-xs">
          <Input
            type="search"
            placeholder="Search trips..."
            className="text-xs"
          />
          <Button variant="outline">
            Filter
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip ID</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No trips found
                </TableCell>
              </TableRow>
            ) : null}
            {rides.map((ride) => {
              const driver = Array.isArray(ride.driver)
                ? ride.driver[0]
                : ride.driver
              const driverName = driver
                ? [driver.first_name, driver.last_name].filter(Boolean).join(" ")
                : "Unassigned"

              const route = [ride.pickup_address, ride.dropoff_address]
                .filter(Boolean)
                .join(" -> ")

              const rideDate = new Date(ride.created_at)
              const dateStr = rideDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              const timeStr = rideDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })

              const displayStatus = ride.status
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())

              const fare = ride.final_fare != null
                ? `P${ride.final_fare.toFixed(2)}`
                : "P0.00"

              return (
                <TableRow key={ride.id}>
                  <TableCell>
                    <span className="font-medium text-foreground">
                      #{ride.id.slice(0, 8).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{dateStr}</span>
                      <span className="text-xs text-muted-foreground">
                        {timeStr}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {route || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">{driverName}</TableCell>
                  <TableCell>
                    <StatusPill status={displayStatus} />
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {fare}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-auto flex w-full flex-wrap pt-4 justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center">
          <p>Showing {rides.length} trips</p>
        </div>
      </div>
    </section>
  )
}

function StatusPill({ status }: { status: string }) {
  const config: Record<
    string,
    { dot: string; label: string; badge: string }
  > = {
    Completed: {
      dot: "bg-emerald-500",
      label: "text-emerald-800 dark:text-emerald-300",
      badge:
        "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    Cancelled: {
      dot: "bg-red-500",
      label: "text-red-800 dark:text-red-300",
      badge:
        "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
  }

  const variant = config[status] ?? {
    dot: "bg-blue-500",
    label: "text-blue-800 dark:text-blue-300",
    badge: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${variant.badge}`}
    >
      <span className={`size-1.5 rounded-full ${variant.dot}`} />
      <span className={variant.label}>{status}</span>
    </span>
  )
}
