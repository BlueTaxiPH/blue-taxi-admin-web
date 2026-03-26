"use client"

import { useState } from "react"
import { Bell, CalendarDays, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DateRange } from "react-day-picker"

export function InsuranceReportsHeader() {
  const initialDate = new Date(2023, 9, 24)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialDate,
    to: initialDate,
  })
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false)

  const dateLabel = (() => {
    if (!dateRange?.from) return "Select date range"
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    const from = formatter.format(dateRange.from)
    const to = dateRange.to ? formatter.format(dateRange.to) : from
    return `${from} - ${to}`
  })()

  return (
    <>
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Compliance Exports
          </h1>
          <p className="text-sm text-muted-foreground">
            Daily insurance coverage reports and archives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="justify-start text-muted-foreground"
            onClick={() => setIsDateDialogOpen(true)}
          >
            <CalendarDays className="size-4" />
            {dateLabel}
          </Button>
          <Button>
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
        </div>
      </header>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="w-fit max-w-full p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Select date range</DialogTitle>
          </DialogHeader>
          <div className="p-3 pt-0">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
