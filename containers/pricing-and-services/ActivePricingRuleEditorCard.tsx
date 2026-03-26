"use client"

import { History, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface ActivePricingRuleEditorCardProps {
  isDynamicSurgeEnabled: boolean
  onDynamicSurgeChange: (value: boolean) => void
}

export function ActivePricingRuleEditorCard({
  isDynamicSurgeEnabled,
  onDynamicSurgeChange,
}: ActivePricingRuleEditorCardProps) {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Active Pricing Rule Editor</CardTitle>
            <p className="text-sm text-muted-foreground">
              Editing: Economy Class for Metro Manila
            </p>
          </div>
          <History className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Base Fare (Flagdown)
            </label>
            <Input defaultValue="45.00" />
            <p className="text-xs text-muted-foreground">
              Initial charge upon starting the trip.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Per KM Rate
            </label>
            <Input defaultValue="15.50" />
            <p className="text-xs text-muted-foreground">
              Charge per kilometer distance.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Per Minute Rate
            </label>
            <Input defaultValue="2.50" />
            <p className="text-xs text-muted-foreground">
              Time-based charge for duration.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Minimum Fare
            </label>
            <Input defaultValue="75.00" />
            <p className="text-xs text-muted-foreground">
              Minimum amount charged regardless of distance.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Cancellation Fee
            </label>
            <Input defaultValue="50.00" />
            <p className="text-xs text-muted-foreground">
              Charged if user cancels after 5 minutes.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Insurance Fee
              <ShieldCheck className="size-3" />
            </label>
            <Input defaultValue="5.00" />
            <p className="text-xs text-muted-foreground">
              Mandatory fixed regulatory fee.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-medium">Dynamic Surge Pricing</p>
            <p className="text-sm text-muted-foreground">
              Allow automatic multiplier increases during high demand.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isDynamicSurgeEnabled}
              onCheckedChange={onDynamicSurgeChange}
              aria-label="Toggle dynamic surge pricing"
            />
            <span className="text-sm font-medium">Enabled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
