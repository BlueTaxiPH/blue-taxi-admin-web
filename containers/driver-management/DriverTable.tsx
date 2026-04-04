"use client"

import {
  Check,
  Clock,
  X,
  Minus,
  Star,
  MoreHorizontal,
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
              className="size-4 rounded border-input accent-primary"
            />
          </TableHead>
          <TableHead className="uppercase text-muted-foreground">Name</TableHead>
          <TableHead className="uppercase text-muted-foreground">Phone</TableHead>
          <TableHead className="uppercase text-muted-foreground">City</TableHead>
          <TableHead className="uppercase text-muted-foreground">Service Type</TableHead>
          <TableHead className="uppercase text-muted-foreground">Status</TableHead>
          <TableHead className="uppercase text-muted-foreground">Doc Status</TableHead>
          <TableHead className="uppercase text-muted-foreground">Rating</TableHead>
          <TableHead className="w-20 uppercase text-muted-foreground">Account</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&_td]:px-4 [&_td]:py-3">
        {drivers.map((driver) => (
          <TableRow key={driver.id}>
            <TableCell>
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
                    className="size-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {driver.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div>
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-xs text-muted-foreground">ID: #{driver.id}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{driver.phone}</TableCell>
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
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span>{driver.rating.toFixed(2)}</span>
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Account actions</span>
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
                        const result = await approveDriver(driver.supabaseId, "approve")
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
        ))}
      </TableBody>
    </Table>
  )
}
