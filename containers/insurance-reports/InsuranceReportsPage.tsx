"use client"

import { useState, useMemo } from "react"
import { CalendarDays, Download } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { InsuranceCoverageSummaryCard } from "./InsuranceCoverageSummaryCard"
import { InsuredTripManifestCard } from "./InsuredTripManifestCard"
import { InsuredTripManifestPagination } from "./InsuredTripManifestPagination"
import type { fetchCompletedRides } from "@/lib/supabase/queries"
import type { DateRange } from "react-day-picker"

type CompletedRide = Awaited<ReturnType<typeof fetchCompletedRides>>[number]
type PeriodKey = "today" | "week" | "month" | "all" | "custom"

const PAGE_SIZE = 7

interface InsuranceReportsPageProps {
  rides: CompletedRide[]
  insuranceAmount: number
  feeLabel: string
}

function PeriodSelector({
  period,
  onPeriodChange,
  onOpenCalendar,
}: {
  period: PeriodKey
  onPeriodChange: (p: PeriodKey) => void
  onOpenCalendar: () => void
}) {
  const options: { key: PeriodKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week",  label: "Week" },
    { key: "month", label: "Month" },
    { key: "all",   label: "All" },
  ]

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg p-0.5"
      style={{ border: "1px solid #DCE6F1", background: "#F4F6FB" }}
    >
      {options.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onPeriodChange(key)}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            period === key
              ? "bg-[#1A56DB] text-white shadow-sm"
              : "text-[#4A607A] hover:text-[#0D1B2A]"
          )}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={onOpenCalendar}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
          period === "custom"
            ? "bg-[#1A56DB] text-white shadow-sm"
            : "text-[#4A607A] hover:text-[#0D1B2A]"
        )}
      >
        <CalendarDays className="size-3.5" aria-hidden />
        Custom
      </button>
    </div>
  )
}

export function InsuranceReportsPage({
  rides,
  insuranceAmount,
  feeLabel,
}: InsuranceReportsPageProps) {
  const [period, setPeriod]     = useState<PeriodKey>("all")
  const [customRange, setCustomRange] = useState<DateRange | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [search, setSearch]     = useState("")
  const [page, setPage]         = useState(1)

  const periodFiltered = useMemo(() => {
    const now = new Date()
    return rides.filter((r) => {
      const d = new Date(r.trip_completed_at ?? r.created_at)
      if (period === "today") {
        return d.toDateString() === now.toDateString()
      }
      if (period === "week") {
        return d >= new Date(now.getTime() - 7 * 86_400_000)
      }
      if (period === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (period === "custom" && customRange?.from) {
        const from = new Date(customRange.from)
        from.setHours(0, 0, 0, 0)
        const to = customRange.to ? new Date(customRange.to) : new Date(customRange.from)
        to.setHours(23, 59, 59, 999)
        return d >= from && d <= to
      }
      return true
    })
  }, [rides, period, customRange])

  const filtered = useMemo(() => {
    if (!search) return periodFiltered
    const q = search.toLowerCase()
    return periodFiltered.filter((r) => {
      const p = r.passenger as { first_name?: string | null; last_name?: string | null } | null
      const d = r.driver as { first_name?: string | null; last_name?: string | null } | null
      const pName = [p?.first_name, p?.last_name].filter(Boolean).join(" ").toLowerCase()
      const dName = [d?.first_name, d?.last_name].filter(Boolean).join(" ").toLowerCase()
      const rid = r.id.slice(0, 8).toLowerCase()
      return pName.includes(q) || dName.includes(q) || rid.includes(q)
    })
  }, [periodFiltered, search])

  const maxPage   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage  = Math.min(page, maxPage)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleExportCSV() {
    const headers = [
      "Trip ID", "Passenger", "Driver", "Pickup", "Dropoff",
      "Fare (PHP)", "Insurance (PHP)", "Completed At",
    ]
    const rows = filtered.map((r) => {
      const p = r.passenger as { first_name?: string | null; last_name?: string | null } | null
      const d = r.driver as { first_name?: string | null; last_name?: string | null } | null
      return [
        r.id.slice(0, 8).toUpperCase(),
        [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "—",
        [d?.first_name, d?.last_name].filter(Boolean).join(" ") || "—",
        (r.pickup_address ?? "—").replace(/,/g, ";"),
        (r.dropoff_address ?? "—").replace(/,/g, ";"),
        r.final_fare ?? r.estimated_fare ?? 0,
        insuranceAmount,
        new Date(r.trip_completed_at ?? r.created_at).toLocaleString("en-PH"),
      ]
    })
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `insurance-manifest-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const periodLabel = period === "today" ? "Today"
    : period === "week" ? "This Week"
    : period === "month" ? "This Month"
    : period === "custom" && customRange?.from
      ? `${customRange.from.toLocaleDateString("en-PH")}${customRange.to ? ` – ${customRange.to.toLocaleDateString("en-PH")}` : ""}`
    : "All Time"

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Insurance Reports"
        subtitle={`Coverage summary and compliance manifest · ${periodLabel}`}
        breadcrumbs={["Business", "Insurance Reports"]}
        actions={
          <div className="flex items-center gap-2">
            <PeriodSelector
              period={period}
              onPeriodChange={(p) => { setPeriod(p); setPage(1) }}
              onOpenCalendar={() => setCalendarOpen(true)}
            />
            <Button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="gap-2"
            >
              <Download className="size-4" aria-hidden />
              Export CSV
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-6 p-7">
        <InsuranceCoverageSummaryCard
          allRides={rides}
          filteredRides={filtered}
          insuranceAmount={insuranceAmount}
          feeLabel={feeLabel}
          period={periodLabel}
        />
        <InsuredTripManifestCard
          rides={paginated}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          insuranceAmount={insuranceAmount}
        />
        <InsuredTripManifestPagination
          page={safePage}
          pageSize={PAGE_SIZE}
          totalCount={filtered.length}
          onPageChange={setPage}
        />
      </div>

      {/* Custom date range dialog */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="w-fit max-w-full p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Select date range</DialogTitle>
          </DialogHeader>
          <div className="p-3 pt-0">
            <Calendar
              mode="range"
              selected={customRange}
              onSelect={(range) => {
                setCustomRange(range)
                if (range?.from) {
                  setPeriod("custom")
                  setPage(1)
                }
              }}
              numberOfMonths={2}
            />
          </div>
          <div className="flex justify-end gap-2 border-t px-4 py-3" style={{ borderColor: "#EEF3F9" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
