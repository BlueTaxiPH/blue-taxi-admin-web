"use client"

import { useState, useMemo } from "react"
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
import { AdminUsersCard } from "./AdminUsersCard"
import type { AdminUser } from "@/types/admin-user"

const STATUS_OPTIONS = [
  { value: "all",      label: "All Status" },
  { value: "pending",  label: "Pending" },
  { value: "active",   label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "rejected", label: "Rejected" },
]

interface AdminUsersTabProps {
  users: AdminUser[]
}

export function AdminUsersTab({ users }: AdminUsersTabProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase()
        const name = `${u.first_name} ${u.last_name}`.toLowerCase()
        if (!name.includes(q) && !u.email.toLowerCase().includes(q)) return false
      }
      if (statusFilter !== "all") {
        const display =
          !u.is_active && u.admin_status === "active" ? "inactive" : u.admin_status
        if (display !== statusFilter) return false
      }
      return true
    })
  }, [users, search, statusFilter])

  const hasFilters = search !== "" || statusFilter !== "all"

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div
        className="flex flex-col gap-3 rounded-xl bg-white px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
        style={{
          border: "1px solid #DCE6F1",
          boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8BACC8]" aria-hidden />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
            style={{ borderColor: "#DCE6F1" }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="h-9 w-full sm:w-[140px]"
            style={{ borderColor: "#DCE6F1" }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-[#4A607A]">
            <span className="font-mono font-semibold text-[#0D1B2A]">{filtered.length}</span>{" "}
            user{filtered.length !== 1 ? "s" : ""}
          </span>
          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
              }}
              className="h-8 gap-1.5 px-2.5 text-[#4A607A] hover:text-[#0D1B2A]"
            >
              <X className="size-3.5" aria-hidden />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <AdminUsersCard users={filtered} />
    </div>
  )
}
