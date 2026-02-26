import { fetchRides } from "@/lib/supabase/queries"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "active":
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function TripManagementPage() {
  let rides: Awaited<ReturnType<typeof fetchRides>> = []
  try {
    rides = await fetchRides()
  } catch {
    // render with empty state
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Trip Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage all rides in the system.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ride ID</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Dropoff</TableHead>
              <TableHead>Fare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No rides found.
                </TableCell>
              </TableRow>
            ) : (
              rides.map((ride: any) => {
                const passenger = ride.passenger
                const passengerName = passenger
                  ? [passenger.first_name, passenger.last_name].filter(Boolean).join(" ")
                  : "—"
                const driver = ride.driver
                const driverName = driver
                  ? [driver.first_name, driver.last_name].filter(Boolean).join(" ")
                  : "—"
                const fare =
                  ride.final_fare != null
                    ? `₱${Number(ride.final_fare).toFixed(0)}`
                    : ride.estimated_fare != null
                      ? `₱${Number(ride.estimated_fare).toFixed(0)}`
                      : "—"

                return (
                  <TableRow key={ride.id}>
                    <TableCell className="font-mono text-xs">
                      {ride.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>{passengerName}</TableCell>
                    <TableCell>{driverName}</TableCell>
                    <TableCell className="max-w-40 truncate text-xs">
                      {ride.pickup_address ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-xs">
                      {ride.dropoff_address ?? "—"}
                    </TableCell>
                    <TableCell>{fare}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusBadgeClass(ride.status)}
                      >
                        {ride.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(ride.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
