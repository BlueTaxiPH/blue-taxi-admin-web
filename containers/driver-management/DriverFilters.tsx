"use client"

import { Search, Layers, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUSES = ["All", "Active", "Inactive", "Suspended"] as const
const SERVICES = ["All", "Basic", "XL"] as const

interface DriverFiltersProps {
  search: string
  city: string
  status: string
  service: string
  cities?: Array<{ id: string; name: string; is_active: boolean }>
  onSearchChange: (value: string) => void
  onCityChange: (value: string) => void
  onStatusChange: (value: string) => void
  onServiceChange: (value: string) => void
  onBulkActions?: () => void
  onClearAll?: () => void
}

export function DriverFilters({
  search,
  city,
  status,
  service,
  cities = [],
  onSearchChange,
  onCityChange,
  onStatusChange,
  onServiceChange,
  onBulkActions,
  onClearAll,
}: DriverFiltersProps) {
  const hasActiveFilters =
    search !== "" || city !== "all" || status !== "all" || service !== "all"

  return (
    <div
      className="flex flex-col gap-3 rounded-xl bg-white px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06)",
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search drivers by name, phone, or ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={city} onValueChange={onCityChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[130px]">
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
      <Select value={service} onValueChange={onServiceChange}>
        <SelectTrigger className="w-full sm:w-[130px]">
          <SelectValue placeholder="Service: All" />
        </SelectTrigger>
        <SelectContent>
          {SERVICES.map((s) => (
            <SelectItem key={s} value={s === "All" ? "all" : s}>
              Service: {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onBulkActions} className="shrink-0">
        <Layers className="size-4" />
        Bulk Actions
      </Button>
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
