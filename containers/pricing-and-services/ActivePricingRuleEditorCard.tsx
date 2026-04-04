"use client"

import { useState, useTransition } from "react"
import { History, ShieldCheck, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { updatePlatformFee } from "@/app/actions/platform-fee"
import type { PlatformFee } from "@/types/platform-fee"

interface ActivePricingRuleEditorCardProps {
  isDynamicSurgeEnabled: boolean
  onDynamicSurgeChange: (value: boolean) => void
  activeFee: PlatformFee | null
}

export function ActivePricingRuleEditorCard({
  isDynamicSurgeEnabled,
  onDynamicSurgeChange,
  activeFee,
}: ActivePricingRuleEditorCardProps) {
  const [platformFee, setPlatformFee] = useState(
    activeFee?.fee_amount?.toString() ?? "0"
  )
  const [isPending, startTransition] = useTransition()
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function handleSavePlatformFee() {
    setSaveMessage(null)
    const amount = parseFloat(platformFee)

    if (isNaN(amount) || amount < 0) {
      setSaveMessage({ type: "error", text: "Please enter a valid fee amount (0 or greater)." })
      return
    }

    startTransition(async () => {
      const result = await updatePlatformFee(amount)
      if (result.success) {
        setSaveMessage({ type: "success", text: "Platform fee updated successfully." })
      } else {
        setSaveMessage({ type: "error", text: result.error })
      }
    })
  }

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
        {/* Platform Fee Section */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Platform Fee</p>
              <p className="text-sm text-muted-foreground">
                Fixed fee added to every ride and collected by the platform.
              </p>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Fee Amount (PHP)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={platformFee}
                onChange={(e) => {
                  setPlatformFee(e.target.value)
                  setSaveMessage(null)
                }}
                placeholder="0.00"
              />
            </div>
            <Button
              onClick={handleSavePlatformFee}
              disabled={isPending}
              size="sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Fee"
              )}
            </Button>
          </div>
          {saveMessage ? (
            <p
              className={`text-sm ${
                saveMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {saveMessage.text}
            </p>
          ) : null}
        </div>

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
