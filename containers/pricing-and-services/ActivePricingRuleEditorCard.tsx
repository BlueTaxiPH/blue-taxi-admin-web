"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Receipt } from "lucide-react"
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

  const router = useRouter()
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
        router.refresh()
      } else {
        setSaveMessage({ type: "error", text: result.error })
      }
    })
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "#EEF3F9" }}
      >
        <div>
          <h2 className="text-sm font-semibold text-[#0D1B2A]">Platform Fee Configuration</h2>
          <p className="text-xs text-[#8BACC8]">
            Set the platform fee and insurance charged on every ride
          </p>
        </div>
        <Receipt className="size-5 text-[#8BACC8]" />
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
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
              className="font-mono"
            />
            <p className="text-xs text-[#8BACC8]">
              Service fee collected by the platform.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
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
              className="font-mono"
            />
            <p className="text-xs text-[#8BACC8]">
              Mandatory regulatory insurance charge.
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between border-t px-5 py-4"
        style={{ borderColor: "#EEF3F9", background: "#F8FBFF" }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
            Total per ride
          </p>
          <p className="mt-0.5 font-mono text-2xl font-bold text-[#0D1B2A]">
            ₱{totalPlatformFee.toFixed(2)}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
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
        <div className="border-t px-5 py-3" style={{ borderColor: "#EEF3F9" }}>
          <p className={`text-sm ${saveMessage.type === "success" ? "text-[#059669]" : "text-[#DC2626]"}`}>
            {saveMessage.text}
          </p>
        </div>
      ) : null}
    </div>
  )
}
