import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  const now = new Date()
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(now)
  const formattedDay = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Manila",
  }).format(now)

  return (
    <div className="sticky top-0 z-10 grid items-center gap-4 border-b shadow-sm bg-background p-6 md:grid-cols-[1fr_auto_1fr]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Executive Overview
        </h1>
        <p className="text-muted-foreground">
          Real-time operational metrics for today
        </p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-semibold text-primary">{formattedDate}</p>
        <p className="text-sm capitalize text-muted-foreground">{formattedDay}</p>
      </div>
      <div className="flex items-center justify-end gap-4">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search drivers, trip ID..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </div>
    </div>
  )
}
