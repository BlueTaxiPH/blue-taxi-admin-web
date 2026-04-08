"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import type { Driver } from "@/types/driver"
import { AddDriverModal } from "./AddDriverModal"
import { DriverFilters } from "./DriverFilters"
import { DriverTable } from "./DriverTable"
import { DriverTablePagination } from "./DriverTablePagination"

const PAGE_SIZE = 10

function DriverSummaryStats({ drivers }: { drivers: Driver[] }) {
  const total = drivers.length
  const active = drivers.filter((d) => d.status === "Active").length
  const docIssues = drivers.filter(
    (d) => d.docStatus === "Pending" || d.docStatus === "Rejected"
  ).length
  const rated = drivers.filter((d) => d.rating > 0)
  const avgRating =
    rated.length > 0
      ? (rated.reduce((s, d) => s + d.rating, 0) / rated.length).toFixed(2)
      : null

  const stats = [
    { label: "Total Drivers", value: String(total), accent: "#1A56DB", Icon: Users },
    { label: "Active", value: String(active), accent: "#059669", Icon: CheckCircle2 },
    { label: "Doc Issues", value: String(docIssues), accent: "#D97706", Icon: AlertCircle },
    { label: "Avg Rating", value: avgRating ?? "\u2014", accent: "#F59E0B", Icon: Star },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, accent }) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-xl bg-white px-4 py-3"
          style={{
            border: "1px solid #DCE6F1",
            boxShadow: "0 1px 3px rgba(13,27,42,0.04)",
          }}
        >
          <div
            className="absolute left-0 top-0 h-full w-[3px]"
            style={{ background: accent }}
          />
          <div className="pl-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              {label}
            </p>
            <p className="mt-0.5 font-mono text-2xl font-bold text-[#0D1B2A]">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

interface DriverManagementPageProps {
  initialDrivers?: Driver[]
  cities?: Array<{ id: string; name: string; is_active: boolean }>
  fetchError?: string | null
}

export function DriverManagementPage({
  initialDrivers = [],
  cities = [],
  fetchError = null,
}: DriverManagementPageProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("all")
  const [status, setStatus] = useState("all")
  const [service, setService] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const filteredDrivers = useMemo(() => {
    return initialDrivers.filter((d) => {
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
  }, [initialDrivers, search, city, status, service])

  const totalCount = filteredDrivers.length
  const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, maxPage)
  const paginatedDrivers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredDrivers.slice(start, start + PAGE_SIZE)
  }, [filteredDrivers, safePage])

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Drivers"
        subtitle="Manage and verify all registered drivers"
        breadcrumbs={["Operations", "Drivers"]}
        actions={
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="size-4" />
            Add New Driver
          </Button>
        }
      />
      <AddDriverModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        cities={cities}
        onSuccess={() => {
          setAddModalOpen(false)
          router.refresh()
        }}
      />
      <div className="flex flex-col gap-6 p-7">
        {fetchError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {fetchError}
          </div>
        ) : null}
        <DriverSummaryStats drivers={initialDrivers} />
        <DriverFilters
          search={search}
          city={city}
          status={status}
          service={service}
          cities={cities}
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
          onClearAll={() => {
            setSearch("")
            setCity("all")
            setStatus("all")
            setService("all")
            setPage(1)
          }}
        />
        <div
          className="overflow-hidden rounded-xl bg-white"
          style={{
            border: "1px solid #DCE6F1",
            boxShadow:
              "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
          }}
        >
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
