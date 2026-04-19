"use client"

import { useMemo, useState } from "react"
import { Receipt, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { payoutStatusBadge } from "@/lib/badge-utils"
import type { PayoutSummary } from "@/lib/supabase/queries"

type PayoutStatus = "paid" | "pending" | "processing" | "failed"
const STATUS_OPTIONS: Array<"all" | PayoutStatus> = [
  "all",
  "pending",
  "processing",
  "paid",
  "failed",
]

interface PayoutsTableProps {
  payouts: PayoutSummary[]
  createDialog: React.ReactNode
}

const PAGE_SIZE = 20

const peso = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function driverDisplayName(payout: PayoutSummary): string {
  const user = payout.driver_profiles?.users
  if (!user) return "Unknown driver"
  const parts = [user.first_name, user.last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : "Unknown driver"
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PayoutsTable({ payouts, createDialog }: PayoutsTableProps) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | PayoutStatus>("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return payouts.filter((p) => {
      const matchesStatus = statusFilter === "all" || p.status === statusFilter
      if (!matchesStatus) return false
      if (!q) return true
      const name = driverDisplayName(p).toLowerCase()
      const shortId = p.id.slice(0, 8).toLowerCase()
      const phone = (p.driver_profiles?.users?.phone ?? "").toLowerCase()
      return name.includes(q) || shortId.includes(q) || phone.includes(q)
    })
  }, [payouts, query, statusFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount
  const totalCount = payouts.length

  function handleFilterChange(next: "all" | PayoutStatus) {
    setStatusFilter(next)
    setVisibleCount(PAGE_SIZE)
  }

  function handleSearch(next: string) {
    setQuery(next)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow:
          "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      <div
        className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
        style={{ borderBottom: "1px solid #EEF3F9" }}
      >
        <div className="flex items-center gap-3">
          <Receipt className="size-5 text-[#1A56DB]" aria-hidden />
          <div>
            <p
              className="text-sm font-semibold text-[#0D1B2A]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Payout history
            </p>
            <p className="text-xs text-[#4A607A]">
              {totalCount === 0
                ? "No payouts yet"
                : `${filtered.length} of ${totalCount} payout${totalCount === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8BACC8]"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by driver, phone, or ID"
              className="h-9 w-full pl-9 md:w-[260px]"
              aria-label="Search payouts"
            />
          </div>

          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ border: "1px solid #DCE6F1", background: "#F4F6FB" }}
          >
            {STATUS_OPTIONS.map((status) => {
              const active = statusFilter === status
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleFilterChange(status)}
                  className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors"
                  style={
                    active
                      ? { background: "#1A56DB", color: "#FFFFFF" }
                      : { color: "#4A607A" }
                  }
                  aria-pressed={active}
                >
                  {status === "all" ? "All" : status}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F6FB]">
            <Receipt className="size-7 text-[#8BACC8]" aria-hidden />
          </div>
          <p className="text-sm font-medium text-[#0D1B2A]">
            {totalCount === 0 ? "No payouts yet" : "No payouts match your filters"}
          </p>
          <p className="max-w-sm text-xs text-[#8BACC8]">
            {totalCount === 0
              ? "Create the first driver payout to start tracking disbursements here."
              : "Try clearing the search or switching to a different status."}
          </p>
          {totalCount === 0 ? (
            <div className="mt-2">{createDialog}</div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setStatusFilter("all")
                setVisibleCount(PAGE_SIZE)
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#EEF3F9" }}>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
                    Payout ID
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
                    Driver
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
                    Amount
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
                    Created
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#8BACC8]">
                    Paid At
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((payout) => {
                  const amount = Number(payout.total_amount ?? 0)
                  const name = driverDisplayName(payout)
                  const phone = payout.driver_profiles?.users?.phone ?? null
                  return (
                    <TableRow
                      key={payout.id}
                      className="transition-colors hover:bg-[#F4F8FF]"
                    >
                      <TableCell className="font-mono text-xs text-[#4A607A]">
                        {payout.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#0D1B2A]">
                            {name}
                          </span>
                          {phone ? (
                            <span className="font-mono text-[11px] text-[#8BACC8]">
                              {phone}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-semibold tabular-nums text-[#0D1B2A]">
                          <span className="mr-0.5 font-sans font-normal text-[#4A607A]">
                            ₱
                          </span>
                          {peso.format(amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`capitalize ${payoutStatusBadge(payout.status)}`}
                        >
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#4A607A]">
                        {formatDate(payout.created_at)}
                      </TableCell>
                      <TableCell className="text-xs text-[#4A607A]">
                        {formatDate(payout.processed_at)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {hasMore ? (
            <div
              className="flex items-center justify-between px-5 py-3 text-xs text-[#4A607A]"
              style={{ borderTop: "1px solid #EEF3F9" }}
            >
              <span>
                Showing {visible.length} of {filtered.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Show more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
