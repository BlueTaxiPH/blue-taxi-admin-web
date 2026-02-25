"use client"

import { Search, Layers } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CITIES = ["All Cities", "New York", "London", "San Francisco"] as const
const STATUSES = ["All", "Active", "Inactive", "Suspended"] as const
const SERVICES = ["All", "Premium", "Standard", "Van"] as const

interface DriverFiltersProps {
  search: string
  city: string
  status: string
  service: string
  onSearchChange: (value: string) => void
  onCityChange: (value: string) => void
  onStatusChange: (value: string) => void
  onServiceChange: (value: string) => void
  onBulkActions?: () => void
}

export function DriverFilters({
  search,
  city,
  status,
  service,
  onSearchChange,
  onCityChange,
  onStatusChange,
  onServiceChange,
  onBulkActions,
}: DriverFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 border shadow-sm p-6 rounded-lg">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
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
          {CITIES.map((c) => (
            <SelectItem key={c} value={c === "All Cities" ? "all" : c}>
              {c}
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
    </div>
  )
}
