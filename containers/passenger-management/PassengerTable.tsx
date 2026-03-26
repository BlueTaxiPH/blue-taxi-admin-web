"use client"

import Link from "next/link"
import { MoreHorizontal, Star } from "lucide-react"
import type { Passenger } from "@/types/passenger"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PassengerTableProps {
  passengers: Passenger[]
}

function FraudBadge({ risk }: { risk: Passenger["fraudRisk"] }) {
  const map: Record<Passenger["fraudRisk"], string> = {
    "Low Risk":
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    "High Risk":
      "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  }
  return (
    <Badge variant="secondary" className={cn("rounded-full px-2 py-0.5 text-xs font-medium", map[risk])}>
      {risk}
    </Badge>
  )
}

function StatusBadge({ status }: { status: Passenger["status"] }) {
  const config: Record<Passenger["status"], string> = {
    Active:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Blocked: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
    Suspended:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        config[status]
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", {
          "bg-emerald-500": status === "Active",
          "bg-gray-400": status === "Blocked",
          "bg-amber-500": status === "Suspended",
        })}
      />
      {status}
    </span>
  )
}

export function PassengerTable({ passengers }: PassengerTableProps) {
  return (
    <Table>
      <TableHeader className="[&_th]:px-6 [&_th]:py-3">
        <TableRow>
          <TableHead className="text-muted-foreground uppercase">Name</TableHead>
          <TableHead className="text-muted-foreground uppercase">
            Phone Number
          </TableHead>
          <TableHead className="text-muted-foreground uppercase">
            Total Trips
          </TableHead>
          <TableHead className="text-muted-foreground uppercase">Rating</TableHead>
          <TableHead className="text-muted-foreground uppercase">
            Fraud Flag
          </TableHead>
          <TableHead className="text-muted-foreground uppercase">Status</TableHead>
          <TableHead className="w-16 text-muted-foreground uppercase">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&_td]:px-6 [&_td]:py-4">
        {passengers.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <Link href={`/passengers/${p.id}`} className="block">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-sm font-medium">
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground hover:underline">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </div>
                </div>
              </Link>
            </TableCell>
            <TableCell className="text-sm">{p.phone}</TableCell>
            <TableCell className="text-sm font-medium">
              {p.totalTrips} trips
            </TableCell>
            <TableCell>
              {p.rating != null ? (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>{p.rating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">N/A</span>
              )}
            </TableCell>
            <TableCell>
              <FraudBadge risk={p.fraudRisk} />
            </TableCell>
            <TableCell>
              <StatusBadge status={p.status} />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/passengers/${p.id}`}>
                  <MoreHorizontal className="size-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

