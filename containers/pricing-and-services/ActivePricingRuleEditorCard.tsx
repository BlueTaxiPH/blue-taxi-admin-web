"use client"

import { useState, useTransition } from "react"
import { Loader2, Receipt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updatePlatformFee } from "@/app/actions/platform-fee"
import type { PlatformFee } from "@/types/platform-fee"

interface ActivePricingRuleEditorCardProps {
  activeFee: PlatformFee | null
}

export function ActivePricingRuleEditorCard({
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
            <CardTitle className="text-lg">Platform Fee Configuration</CardTitle>
            <p className="text-sm text-muted-foreground">
              Set the platform fee and insurance charged on every ride.
            </p>
          </div>
          <Receipt className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5">
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
            <p className="text-xs text-muted-foreground">
              Service fee collected by the platform.
            </p>
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
            <p className="text-xs text-muted-foreground">
              Mandatory regulatory insurance charge.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total added to meter fare
            </p>
            <p className="text-2xl font-bold mt-0.5">₱{totalPlatformFee.toFixed(2)}</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isPending}
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
        </div>

        {saveMessage ? (
          <p className={`text-sm ${saveMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {saveMessage.text}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
