import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DriverPageHeaderProps {
  onAddDriver?: () => void
}

export function DriverPageHeader({ onAddDriver }: DriverPageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between p-6 border-b shadow-sm mb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Driver Management
        </h1>
        <p className="text-muted-foreground">
          Manage fleet drivers, approvals, and performance metrics
        </p>
      </div>
      <div className="mt-2 flex items-center gap-4 sm:mt-0">
        <Button onClick={onAddDriver} size="default">
          <Plus className="size-4" />
          Add New Driver
        </Button>
        
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </div>
    </div>
  )
}
