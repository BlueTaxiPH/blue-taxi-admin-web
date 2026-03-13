import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PassengerPageHeaderProps {
  onAddPassenger?: () => void
}

export function PassengerPageHeader({ onAddPassenger }: PassengerPageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 border-b p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Passenger Management
        </h1>
        <p className="text-muted-foreground">
          Manage user accounts and monitor fraud risk
        </p>
      </div>
      <div className="mt-2 flex items-center gap-4 sm:mt-0">
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </div>
    </div>
  )
}

