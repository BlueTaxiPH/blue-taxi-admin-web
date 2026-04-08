"use client"

import { useMemo, useState } from "react"
import { Users, CheckCircle2, AlertCircle, Star } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import type { Passenger } from "@/types/passenger"
import { PassengerFilters } from "./PassengerFilters"
import { PassengerTable } from "./PassengerTable"
import { PassengerTablePagination } from "./PassengerTablePagination"

const PAGE_SIZE = 10

interface PassengerManagementPageProps {
  initialPassengers: Passenger[]
}

function PassengerSummaryStats({ passengers }: { passengers: Passenger[] }) {
  const total = passengers.length
  const active = passengers.filter((p) => p.status === "Active").length
  const suspended = passengers.filter((p) => p.status === "Suspended").length
  const rated = passengers.filter((p) => p.rating != null && p.rating > 0)
  const avgRating =
    rated.length > 0
      ? (rated.reduce((s, p) => s + (p.rating ?? 0), 0) / rated.length).toFixed(2)
      : null

  const stats = [
    { label: "Total Passengers", value: String(total), accent: "#1A56DB", Icon: Users },
    { label: "Active", value: String(active), accent: "#059669", Icon: CheckCircle2 },
    { label: "Suspended", value: String(suspended), accent: "#EF4444", Icon: AlertCircle },
    { label: "Avg Rating", value: avgRating ?? "—", accent: "#F59E0B", Icon: Star },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, accent }) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-xl bg-white px-4 py-3"
          style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.04)" }}
        >
          <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: accent }} />
          <div className="pl-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              {label}
            </p>
            <p className="mt-0.5 font-mono text-2xl font-bold text-[#0D1B2A]">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PassengerManagementPage({ initialPassengers }: PassengerManagementPageProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)

  const filteredPassengers = useMemo(() => {
    return initialPassengers.filter((p) => {
      const normalizedSearch = search.trim().toLowerCase()
      const matchesSearch =
        !normalizedSearch ||
        p.name.toLowerCase().includes(normalizedSearch) ||
        p.phone.toLowerCase().includes(normalizedSearch) ||
        p.email.toLowerCase().includes(normalizedSearch) ||
        p.id.toLowerCase().includes(normalizedSearch)

      const matchesStatus = status === "all" || p.status === status

      return matchesSearch && matchesStatus
    })
  }, [search, status, initialPassengers])

  const totalCount = filteredPassengers.length
  const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, maxPage)

  const paginatedPassengers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredPassengers.slice(start, start + PAGE_SIZE)
  }, [filteredPassengers, safePage])

  return (
    <div>
      <PageHeader
        title="Passengers"
        subtitle="View and manage registered passengers"
        breadcrumbs={["Operations", "Passengers"]}
      />
      <div className="flex flex-col gap-6 p-6">
        <PassengerSummaryStats passengers={initialPassengers} />
        <PassengerFilters
          search={search}
          status={status}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          onStatusChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
          onClearAll={() => {
            setSearch("")
            setStatus("all")
            setPage(1)
          }}
        />
        <div
          className="overflow-hidden rounded-xl bg-white"
          style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)" }}
        >
          <PassengerTable passengers={paginatedPassengers} />
        </div>
        <PassengerTablePagination
          page={safePage}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
