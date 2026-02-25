"use client"

import { useMemo, useState } from "react"
import { MOCK_DRIVERS } from "@/lib/drivers-mock"
import { AddDriverModal } from "./AddDriverModal"
import { DriverPageHeader } from "./DriverPageHeader"
import { DriverFilters } from "./DriverFilters"
import { DriverTable } from "./DriverTable"
import { DriverTablePagination } from "./DriverTablePagination"

const PAGE_SIZE = 5

export function DriverManagementPage() {
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("all")
  const [status, setStatus] = useState("all")
  const [service, setService] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const filteredDrivers = useMemo(() => {
    return MOCK_DRIVERS.filter((d) => {
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.phone.includes(search) ||
        d.id.toLowerCase().includes(search.toLowerCase())
      const matchCity = city === "all" || d.city === city
      const matchStatus = status === "all" || d.status === status
      const matchService = service === "all" || d.serviceType === service
      return matchSearch && matchCity && matchStatus && matchService
    })
  }, [search, city, status, service])

  const totalCount = filteredDrivers.length
  const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, maxPage)
  const paginatedDrivers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredDrivers.slice(start, start + PAGE_SIZE)
  }, [filteredDrivers, safePage])

  return (
    <div>
      <DriverPageHeader onAddDriver={() => setAddModalOpen(true)} />
      <AddDriverModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={() => setAddModalOpen(false)}
      />
    <div className="flex flex-col gap-6 p-6">
      <DriverFilters
        search={search}
        city={city}
        status={status}
        service={service}
        onSearchChange={setSearch}
        onCityChange={(v) => {
          setCity(v)
          setPage(1)
        }}
        onStatusChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        onServiceChange={(v) => {
          setService(v)
          setPage(1)
        }}
        onBulkActions={() => {}}
      />
      <div className="rounded-md border">
        <DriverTable
          drivers={paginatedDrivers}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSelectAll={(checked) => {
            if (checked) {
              setSelectedIds(paginatedDrivers.map((d) => d.id))
            } else {
              setSelectedIds([])
            }
          }}
        />
      </div>
      <DriverTablePagination
        page={safePage}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </div>
    </div>
  )
}
