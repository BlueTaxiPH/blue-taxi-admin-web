"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    id: "TR-89201",
    passenger: "Juan P.",
    driver: "R. Santos",
    pickup: "Ayala Triangle, Makati",
    dropoff: "BGC High Street",
    insurance: "Covered",
    timestamp: "10:42:15 AM",
  },
  {
    id: "TR-89202",
    passenger: "Maria L.",
    driver: "D. Cruz",
    pickup: "NAIA Terminal 3",
    dropoff: "Okada Manila",
    insurance: "Covered",
    timestamp: "10:41:02 AM",
  },
  {
    id: "TR-89203",
    passenger: "Rico A.",
    driver: "B. Reyes",
    pickup: "SM Megamall",
    dropoff: "Ortigas Center",
    insurance: "Covered",
    timestamp: "10:38:55 AM",
  },
  {
    id: "TR-89204",
    passenger: "Sarah T.",
    driver: "M. Garcia",
    pickup: "Greenbelt 5",
    dropoff: "Rockwell Center",
    insurance: "Covered",
    timestamp: "10:35:12 AM",
  },
  {
    id: "TR-89205",
    passenger: "Kevin D.",
    driver: "L. Torres",
    pickup: "Eastwood City",
    dropoff: "Quezon Memorial",
    insurance: "Covered",
    timestamp: "10:33:04 AM",
  },
  {
    id: "TR-89206",
    passenger: "Ana M.",
    driver: "J. Lim",
    pickup: "Robinson's Place",
    dropoff: "Intramuros",
    insurance: "Covered",
    timestamp: "10:30:45 AM",
  },
]

export function InsuredTripManifestCard() {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Insured Trip Manifest</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by Trip ID, Driver..." className="pl-9" />
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5">Trip ID</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Dropoff</TableHead>
              <TableHead>Insurance (P)</TableHead>
              <TableHead className="pr-5">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="px-5 font-semibold text-primary">
                  #{trip.id}
                </TableCell>
                <TableCell>{trip.passenger}</TableCell>
                <TableCell>{trip.driver}</TableCell>
                <TableCell className="max-w-[180px] truncate text-muted-foreground">
                  {trip.pickup}
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-muted-foreground">
                  {trip.dropoff}
                </TableCell>
                <TableCell>
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {trip.insurance}
                  </span>
                </TableCell>
                <TableCell className="pr-5 text-xs text-muted-foreground">
                  {trip.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
