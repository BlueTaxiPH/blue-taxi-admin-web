"use client"

import { Bell, CalendarDays, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InsuranceReportsHeader() {
  return (
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
        <Button variant="outline" className="justify-start text-muted-foreground">
          <CalendarDays className="size-4" />
          Oct 24, 2023 - Oct 24, 2023
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
  )
}
