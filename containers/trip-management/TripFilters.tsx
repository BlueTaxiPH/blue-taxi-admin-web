"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_OPTIONS = [
  { value: "all",       label: "All Status" },
  { value: "active",    label: "Active" },
  { value: "pending",   label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const DATE_OPTIONS = [
  { value: "all",   label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
]

interface TripFiltersProps {
  search: string
  statusGroup: string
  dateRange: string
  resultCount: number
  onSearchChange: (v: string) => void
  onStatusGroupChange: (v: string) => void
  onDateRangeChange: (v: string) => void
  onClearAll: () => void
}

export function TripFilters({
  search,
  statusGroup,
  dateRange,
  resultCount,
  onSearchChange,
  onStatusGroupChange,
  onDateRangeChange,
  onClearAll,
}: TripFiltersProps) {
  const hasActiveFilters = search !== "" || statusGroup !== "all" || dateRange !== "all"

  return (
    <div
      className="flex flex-col gap-3 rounded-xl bg-white p-4 sm:flex-row sm:items-center"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8BACC8]" aria-hidden />
        <Input
          placeholder="Search by ride ID, passenger, or driver…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-sm"
          style={{ borderColor: "#DCE6F1" }}
        />
      </div>

      {/* Status filter */}
      <Select value={statusGroup} onValueChange={onStatusGroupChange}>
        <SelectTrigger
          className="h-9 w-full sm:w-40"
          style={{ borderColor: "#DCE6F1" }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date filter */}
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger
          className="h-9 w-full sm:w-36"
          style={{ borderColor: "#DCE6F1" }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Result count + clear */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-[#4A607A]">
          <span className="font-mono font-semibold text-[#0D1B2A]">{resultCount}</span> result{resultCount !== 1 ? "s" : ""}
        </span>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 gap-1.5 px-2.5 text-[#4A607A] hover:text-[#0D1B2A]"
          >
            <X className="size-3.5" aria-hidden />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}
