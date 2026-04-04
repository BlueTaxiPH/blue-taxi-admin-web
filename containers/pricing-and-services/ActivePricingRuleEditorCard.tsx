"use client"

import { useState, useTransition } from "react"
import { History, Loader2 } from "lucide-react"
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
  const insuranceFromDb = activeFee?.insurance_amount ?? 0
  const platformFromDb = activeFee
    ? activeFee.fee_amount - insuranceFromDb
    : 0

  const [platformFeeInput, setPlatformFeeInput] = useState(String(platformFromDb))
  const [insuranceFeeInput, setInsuranceFeeInput] = useState(String(insuranceFromDb))
  const [isPending, startTransition] = useTransition()
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const totalPlatformFee = (Number(platformFeeInput) || 0) + (Number(insuranceFeeInput) || 0)

  function handleSave() {
    setSaveMessage(null)
    const platformAmount = parseFloat(platformFeeInput)
    const insuranceAmount = parseFloat(insuranceFeeInput)

    if (isNaN(platformAmount) || platformAmount < 0) {
      setSaveMessage({ type: "error", text: "Platform fee must be a valid number >= 0." })
      return
    }
    if (isNaN(insuranceAmount) || insuranceAmount < 0) {
      setSaveMessage({ type: "error", text: "Insurance fee must be a valid number >= 0." })
      return
    }

    startTransition(async () => {
      const result = await updatePlatformFee(platformAmount, insuranceAmount)
      if (result.success) {
        setSaveMessage({ type: "success", text: "Fees updated successfully." })
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
              Manage platform fees and insurance charges.
            </p>
          </div>
          <History className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5">
        <div className="rounded-lg border p-4 space-y-4">
          <div>
            <p className="font-medium">Fee Breakdown</p>
            <p className="text-sm text-muted-foreground">
              Platform fee and insurance are combined as the total fee added to every ride.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Platform Fee (₱)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={platformFeeInput}
                onChange={(e) => {
                  setPlatformFeeInput(e.target.value)
                  setSaveMessage(null)
                }}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Insurance Fee (₱)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={insuranceFeeInput}
                onChange={(e) => {
                  setInsuranceFeeInput(e.target.value)
                  setSaveMessage(null)
                }}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="rounded-md border bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total Fee — passed to drivers &amp; passengers
            </p>
            <p className="text-lg font-bold">₱{totalPlatformFee.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              This amount is added to the meter fare on every completed ride.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isPending}
              size="sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Fees"
              )}
            </Button>
            {saveMessage ? (
              <p className={`text-sm ${saveMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {saveMessage.text}
              </p>
            ) : null}
          </div>
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
