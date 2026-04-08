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

const STATUSES = ["All", "Active", "Blocked", "Suspended"] as const

interface PassengerFiltersProps {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClearAll?: () => void
}

export function PassengerFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClearAll,
}: PassengerFiltersProps) {
  const hasActiveFilters = search !== "" || status !== "all"

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 rounded-xl bg-white px-5 py-4"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8BACC8]" />
        <Input
          type="search"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Status: All" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s === "All" ? "all" : s}>
              Status: {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasActiveFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="shrink-0 gap-1.5 text-[#4A607A] hover:text-[#0D1B2A]"
        >
          <X className="size-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}
