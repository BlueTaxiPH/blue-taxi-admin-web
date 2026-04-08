"use client"

import {
  Check,
  Clock,
  X,
  Minus,
  Star,
  MoreHorizontal,
  Users,
} from "lucide-react"
import type { Driver } from "@/types/driver"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { approveDriver } from "@/app/actions/approve-driver"
import { suspendDriver } from "@/app/actions/suspend-driver"
import { deleteDriver } from "@/app/actions/delete-driver"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DriverTableProps {
  drivers: Driver[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onSelectAll: (checked: boolean) => void
}

const STATUS_RING: Record<Driver["status"], string> = {
  Active: "ring-2 ring-[#1A56DB] ring-offset-1",
  Inactive: "ring-2 ring-gray-300 ring-offset-1",
  Suspended: "ring-2 ring-red-400 ring-offset-1",
}

function ServiceBadge({ type }: { type: Driver["serviceType"] }) {
  const map: Record<Driver["serviceType"], string> = {
    Basic: "bg-gray-100 text-gray-800",
    XL: "bg-violet-100 text-violet-800",
  }
  return (
    <Badge variant="secondary" className={cn("font-medium", map[type])}>
      {type}
    </Badge>
  )
}

function StatusCell({ status }: { status: Driver["status"] }) {
  const map: Record<Driver["status"], string> = {
    Active: "bg-emerald-500",
    Inactive: "bg-gray-400",
    Suspended: "bg-red-500",
  }
  return (
    <div className="flex items-center gap-2">
      <span className={cn("size-2 rounded-full", map[status])} aria-hidden />
      <span>{status}</span>
    </div>
  )
}

function DocStatusCell({ docStatus }: { docStatus: Driver["docStatus"] }) {
  const config: Record<
    Driver["docStatus"],
    { icon: typeof Check; className: string; badge: string }
  > = {
    Verified: {
      icon: Check,
      className: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-800",
    },
    Pending: {
      icon: Clock,
      className: "text-amber-600",
      badge: "bg-amber-100 text-amber-800",
    },
    Rejected: {
      icon: X,
      className: "text-red-600",
      badge: "bg-red-100 text-red-800",
    },
    "No Docs": {
      icon: Minus,
      className: "text-gray-400",
      badge: "bg-gray-100 text-gray-800",
    },
  }
  const { icon: Icon, className, badge } = config[docStatus]
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("size-4 shrink-0", className)} aria-hidden />
      <Badge variant="secondary" className={cn("font-medium", badge)}>
        {docStatus}
      </Badge>
    </div>
  )
}

export function DriverTable({
  drivers,
  selectedIds,
  onSelectionChange,
  onSelectAll,
}: DriverTableProps) {
  const router = useRouter()
  const allSelected =
    drivers.length > 0 && selectedIds.length === drivers.length
  const someSelected = selectedIds.length > 0

  function toggleRow(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  function toggleAll() {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(drivers.map((d) => d.id))
    }
  }

  return (
    <Table>
      <TableHeader className="[&_th]:px-4 [&_th]:py-3">
        <TableRow>
          <TableHead className="w-10">
            <input
              type="checkbox"
              role="checkbox"
              aria-label="Select all"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected
              }}
              onChange={() => toggleAll()}
              className="size-4 rounded border-input accent-blue-500"
            />
          </TableHead>
          <TableHead className="uppercase text-muted-foreground">Name</TableHead>
          <TableHead className="uppercase text-muted-foreground">Phone</TableHead>
          <TableHead className="uppercase text-muted-foreground">City</TableHead>
          <TableHead className="uppercase text-muted-foreground">Service Type</TableHead>
          <TableHead className="uppercase text-muted-foreground">Status</TableHead>
          <TableHead className="uppercase text-muted-foreground">Doc Status</TableHead>
          <TableHead className="uppercase text-muted-foreground">Rating</TableHead>
          <TableHead className="w-20 uppercase text-muted-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&_td]:px-4 [&_td]:py-3">
        {drivers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
                  <Users className="size-7 text-[#8BACC8]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0D1B2A]">
                    No drivers found
                  </p>
                  <p className="mt-0.5 text-xs text-[#8BACC8]">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          drivers.map((driver) => (
            <TableRow
              key={driver.id}
              className="cursor-pointer transition-colors hover:bg-[#F4F8FF]"
              onClick={() => {
                if (driver.supabaseId) router.push(`/drivers/${driver.supabaseId}`)
              }}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  role="checkbox"
                  aria-label={`Select ${driver.name}`}
                  checked={selectedIds.includes(driver.id)}
                  onChange={() => toggleRow(driver.id)}
                  className="size-4 rounded border-input accent-primary"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {driver.photoUrl ? (
                    <img
                      src={driver.photoUrl}
                      alt={driver.name}
                      className={cn(
                        "size-9 shrink-0 rounded-full object-cover",
                        STATUS_RING[driver.status]
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700",
                        STATUS_RING[driver.status]
                      )}
                    >
                      {driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      ID: #{driver.id}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{driver.phone}</TableCell>
              <TableCell>{driver.city}</TableCell>
              <TableCell>
                <ServiceBadge type={driver.serviceType} />
              </TableCell>
              <TableCell>
                <StatusCell status={driver.status} />
              </TableCell>
              <TableCell>
                <DocStatusCell docStatus={driver.docStatus} />
              </TableCell>
              <TableCell>
                {driver.rating > 0 ? (
                  <div className="flex items-center gap-1 font-mono">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span>{driver.rating.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-[#8BACC8]">{"\u2014"}</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Driver actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/drivers/${driver.supabaseId}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {driver.status !== "Active" ? (
                      <DropdownMenuItem
                        onClick={async () => {
                          if (!driver.supabaseId) return
                          const result = await approveDriver(
                            driver.supabaseId,
                            "approve"
                          )
                          if (result.success) router.refresh()
                        }}
                      >
                        Approve Driver
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={async () => {
                          if (!driver.supabaseId) return
                          const result = await suspendDriver(driver.supabaseId)
                          if (result.success) router.refresh()
                        }}
                      >
                        Suspend Driver
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={async () => {
                        if (!driver.supabaseId) return
                        const confirmed = confirm(
                          `Are you sure you want to delete ${driver.name}? This action cannot be undone.`
                        )
                        if (!confirmed) return
                        const result = await deleteDriver(driver.supabaseId)
                        if (result.success) router.refresh()
                      }}
                    >
                      Delete Driver
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
