"use client"

import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import type { Passenger } from "@/types/passenger"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface PassengerTableProps {
  passengers: Passenger[]
}

const STATUS_RING: Record<Passenger["status"], string> = {
  Active: "ring-2 ring-blue-400 ring-offset-1",
  Blocked: "ring-2 ring-gray-300 ring-offset-1",
  Suspended: "ring-2 ring-red-400 ring-offset-1",
}

const STATUS_BADGE: Record<Passenger["status"], string> = {
  Active: "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
  Blocked: "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]",
  Suspended: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
}

export function PassengerTable({ passengers }: PassengerTableProps) {
  const router = useRouter()

  return (
    <Table>
      <TableHeader className="[&_th]:px-4 [&_th]:py-3">
        <TableRow>
          <TableHead className="uppercase text-muted-foreground">Name</TableHead>
          <TableHead className="uppercase text-muted-foreground">Phone</TableHead>
          <TableHead className="uppercase text-muted-foreground">Trips</TableHead>
          <TableHead className="uppercase text-muted-foreground">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&_td]:px-4 [&_td]:py-3">
        {passengers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
                  <Users className="size-7 text-[#8BACC8]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0D1B2A]">No passengers found</p>
                  <p className="mt-0.5 text-xs text-[#8BACC8]">Try adjusting your search or filters</p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          passengers.map((p) => (
            <TableRow
              key={p.supabaseId}
              className="cursor-pointer transition-colors hover:bg-[#F4F8FF]"
              onClick={() => router.push(`/passengers/${p.supabaseId}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700",
                      STATUS_RING[p.status]
                    )}
                  >
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-[#0D1B2A]">{p.name}</p>
                    <p className="text-xs text-[#8BACC8]">{p.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{p.phone}</TableCell>
              <TableCell className="font-mono text-sm font-medium">
                {p.totalTrips}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    STATUS_BADGE[p.status]
                  )}
                >
                  {p.status}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
