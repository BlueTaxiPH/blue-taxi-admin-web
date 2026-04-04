"use client"

import { useMemo, useState } from "react"
import type { Passenger } from "@/types/passenger"
import { PassengerPageHeader } from "./PassengerPageHeader"
import { PassengerFilters } from "./PassengerFilters"
import { PassengerTable } from "./PassengerTable"
import { PassengerTablePagination } from "./PassengerTablePagination"

const PAGE_SIZE = 6

interface PassengerManagementPageProps {
  initialPassengers: Passenger[]
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
        p.email.toLowerCase().includes(normalizedSearch)

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
      <PassengerPageHeader />
      <div className="flex flex-col gap-6 p-6">
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
        />
        <div className="rounded-lg border bg-card shadow-sm">
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
