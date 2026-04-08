"use client"

import { Search, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { fetchCompletedRides } from "@/lib/supabase/queries"

type CompletedRide = Awaited<ReturnType<typeof fetchCompletedRides>>[number]

interface InsuredTripManifestCardProps {
  rides: CompletedRide[]
  search: string
  onSearchChange: (v: string) => void
  insuranceAmount: number
}

export function InsuredTripManifestCard({
  rides,
  search,
  onSearchChange,
  insuranceAmount,
}: InsuredTripManifestCardProps) {
  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      {/* Header: title + search */}
      <div
        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderBottom: "1px solid #EEF3F9" }}
      >
        <p
          className="font-semibold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Insured Trip Manifest
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8BACC8]" aria-hidden />
          <Input
            placeholder="Search by ID, passenger, or driver…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-9 text-sm"
            style={{ borderColor: "#DCE6F1" }}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#EEF3F9" }}>
            <TableHead className="w-1 p-0" />
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Trip ID
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
              Insurance
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Completed
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rides.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
                    <ShieldCheck className="size-7 text-[#8BACC8]" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-[#0D1B2A]">No insured trips found</p>
                  <p className="text-xs text-[#8BACC8]">
                    Try adjusting your search or date range
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rides.map((ride) => {
              const passenger = ride.passenger as { first_name?: string | null; last_name?: string | null } | null
              const driver = ride.driver as { first_name?: string | null; last_name?: string | null } | null
              const pName = [passenger?.first_name, passenger?.last_name].filter(Boolean).join(" ") || "—"
              const dName = [driver?.first_name, driver?.last_name].filter(Boolean).join(" ") || "—"
              const fare = ride.final_fare ?? ride.estimated_fare
              const insurance = insuranceAmount

              return (
                <TableRow
                  key={ride.id}
                  className="transition-colors hover:bg-[#F4F8FF]"
                >
                  {/* Emerald strip — all completed = all covered */}
                  <TableCell className="w-1 p-0 pl-0 pr-2">
                    <div
                      className="min-h-[52px] w-1 rounded-r-sm"
                      style={{ background: "#059669" }}
                      aria-hidden
                    />
                  </TableCell>

                  {/* Trip ID */}
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-[#1A56DB]">
                      #{ride.id.slice(0, 8).toUpperCase()}
                    </span>
                  </TableCell>

                  {/* Passenger */}
                  <TableCell className="text-sm text-[#0D1B2A]">{pName}</TableCell>

                  {/* Driver */}
                  <TableCell className="text-sm text-[#0D1B2A]">{dName}</TableCell>

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
                        ₱{Number(fare).toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-sm text-[#8BACC8]">—</span>
                    )}
                  </TableCell>

                  {/* Insurance */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                      <ShieldCheck className="size-3" aria-hidden />
                      ₱{Number(insurance).toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Completed date */}
                  <TableCell>
                    <span className="font-mono text-xs text-[#4A607A]">
                      {new Date(ride.trip_completed_at ?? ride.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
