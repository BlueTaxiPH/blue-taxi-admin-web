"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { TripSummaryStats } from "./TripSummaryStats"
import { TripFilters } from "./TripFilters"
import { TripTable } from "./TripTable"
import { TripTablePagination } from "./TripTablePagination"
import { ACTIVE_STATUSES } from "@/lib/trip-status"
import type { fetchRides } from "@/lib/supabase/queries"

type RideRow = Awaited<ReturnType<typeof fetchRides>>[number]

const PAGE_SIZE = 7

interface TripManagementPageProps {
  rides: RideRow[]
}

export function TripManagementPage({ rides }: TripManagementPageProps) {
  const [search, setSearch] = useState("")
  const [statusGroup, setStatusGroup] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return rides.filter((ride) => {
      // Search: short ID, passenger name, driver name
      if (search) {
        const q = search.toLowerCase()
        const p = ride.passenger as { first_name?: string | null; last_name?: string | null } | null
        const d = ride.driver as { first_name?: string | null; last_name?: string | null } | null
        const pName = [p?.first_name, p?.last_name].filter(Boolean).join(" ").toLowerCase()
        const dName = [d?.first_name, d?.last_name].filter(Boolean).join(" ").toLowerCase()
        const rid = ride.id.slice(0, 8).toLowerCase()
        if (!pName.includes(q) && !dName.includes(q) && !rid.includes(q)) return false
      }

      // Status group
      if (statusGroup !== "all") {
        const groups: Record<string, (s: string) => boolean> = {
          pending: (s) => s === "pending",
          active: (s) => ACTIVE_STATUSES.has(s),
          completed: (s) => s === "completed",
          cancelled: (s) => s === "cancelled",
        }
        if (!groups[statusGroup]?.(ride.status)) return false
      }

      // Date range (on created_at)
      if (dateRange !== "all") {
        const rideDate = new Date(ride.created_at)
        const now = new Date()
        if (dateRange === "today") {
          if (rideDate.toDateString() !== now.toDateString()) return false
        } else if (dateRange === "week") {
          if (rideDate < new Date(now.getTime() - 7 * 86_400_000)) return false
        } else if (dateRange === "month") {
          if (
            rideDate.getMonth() !== now.getMonth() ||
            rideDate.getFullYear() !== now.getFullYear()
          ) return false
        }
      }

      return true
    })
  }, [rides, search, statusGroup, dateRange])

  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, maxPage)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function clearFilters() {
    setSearch("")
    setStatusGroup("all")
    setDateRange("all")
    setPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Trip Management"
        subtitle="Monitor and manage all rides across the platform"
        breadcrumbs={["Operations", "Trip Management"]}
      />
      <div className="flex flex-col gap-6 p-7">
        <TripSummaryStats rides={rides} />
        <TripFilters
          search={search}
          statusGroup={statusGroup}
          dateRange={dateRange}
          resultCount={filtered.length}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          onStatusGroupChange={(v) => { setStatusGroup(v); setPage(1) }}
          onDateRangeChange={(v) => { setDateRange(v); setPage(1) }}
          onClearAll={clearFilters}
        />
        <TripTable rides={paginated} />
        <TripTablePagination
          page={safePage}
          pageSize={PAGE_SIZE}
          totalCount={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
