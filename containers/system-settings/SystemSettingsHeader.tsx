"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
export function SystemSettingsHeader({
  saveState,
  onSaveChanges,
}: {
  saveState: "idle" | "saving" | "saved"
  onSaveChanges: () => void
}) {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-4 border-b shadow-sm bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          System Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure platform parameters and manage user roles
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline">Audit Logs</Button>
        <Button onClick={onSaveChanges} disabled={saveState === "saving"}>
          {saveState === "saving" ? "Saving…" : "Save Changes"}
        </Button>
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </div>
    </div>
  )
}

