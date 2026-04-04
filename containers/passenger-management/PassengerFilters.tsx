import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
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
}

export function PassengerFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: PassengerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-6 shadow-sm sm:flex-row sm:items-center sm:gap-4">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
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
    </div>
  )
}
