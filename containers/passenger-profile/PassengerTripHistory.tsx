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

const trips = [
  {
    id: "#TR-9281",
    type: "Standard",
    date: "Oct 24, 2023",
    time: "08:45 AM",
    route: "SFO Terminal 2",
    driver: "Michael J.",
    status: "Completed",
    amount: "$42.80",
  },
  {
    id: "#TR-8821",
    type: "Premium",
    date: "Oct 22, 2023",
    time: "06:30 PM",
    route: "SFO Terminal 2",
    driver: "David K.",
    status: "Completed",
    amount: "$58.20",
  },
  {
    id: "#TR-8190",
    type: "Standard",
    date: "Oct 20, 2023",
    time: "02:15 PM",
    route: "Union Square → Golden Gate Park",
    driver: "Alex S.",
    status: "Cancelled",
    amount: "$0.00",
  },
  {
    id: "#TR-8188",
    type: "Standard",
    date: "Oct 18, 2023",
    time: "11:05 AM",
    route: "Mission District → SOMA",
    driver: "Kelly R.",
    status: "Completed",
    amount: "$17.40",
  },
]

export function PassengerTripHistory() {
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
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {trip.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {trip.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{trip.date}</span>
                    <span className="text-xs text-muted-foreground">
                      {trip.time}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs text-sm">{trip.route}</TableCell>
                <TableCell className="text-sm">{trip.driver}</TableCell>
                <TableCell>
                  <StatusPill status={trip.status} />
                </TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {trip.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      
      <div className="mt-auto flex w-full flex-wrap pt-4 justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center">
          <p>Showing 4 of 42 trips</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            Prev
          </Button>
          <Button>Next</Button>
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

  const variant = config[status] ?? config.Completed

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${variant.badge}`}
    >
      <span className={`size-1.5 rounded-full ${variant.dot}`} />
      <span className={variant.label}>{status}</span>
    </span>
  )
}

