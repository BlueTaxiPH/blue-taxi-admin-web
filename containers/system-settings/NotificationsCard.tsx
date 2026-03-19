"use client"

import { Bell } from "lucide-react"

import { Switch } from "@/components/ui/switch"

export function NotificationsCard({
  serverDowntimeCritical,
  matchSlaAlerts,
  onServerDowntimeCriticalChange,
  onMatchSlaAlertsChange,
}: {
  serverDowntimeCritical: boolean
  matchSlaAlerts: boolean
  onServerDowntimeCriticalChange: (checked: boolean) => void
  onMatchSlaAlertsChange: (checked: boolean) => void
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-row items-center gap-2">
        <div className="flex items-center gap-2">
          <Bell className="size-8 text-primary" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Configure system alerts</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">System Alerts</p>
            <p className="text-xs text-muted-foreground">
              Server downtime & critical errors
            </p>
          </div>
          <Switch
            checked={serverDowntimeCritical}
            onCheckedChange={onServerDowntimeCriticalChange}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Match SLA Alerts</p>
            <p className="text-xs text-muted-foreground">
              When driver matching &gt; 5 mins
            </p>
          </div>
          <Switch checked={matchSlaAlerts} onCheckedChange={onMatchSlaAlertsChange} />
        </div>
      </div>
    </section>
  )
}

