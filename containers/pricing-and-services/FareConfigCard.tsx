"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Calculator, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { updateFareConfig } from "@/app/actions/update-fare-config"
import type { FareConfig } from "@/lib/supabase/queries"

interface FareConfigCardProps {
  fareConfig: FareConfig | null
}

export function FareConfigCard({ fareConfig }: FareConfigCardProps) {
  const router = useRouter()
  const [baseFare, setBaseFare] = useState(String(fareConfig?.base_fare ?? 45))
  const [perKmRate, setPerKmRate] = useState(String(fareConfig?.per_km_rate ?? 15.5))
  const [perMinuteRate, setPerMinuteRate] = useState(String(fareConfig?.per_minute_rate ?? 2.5))
  const [surgeEnabled, setSurgeEnabled] = useState(fareConfig?.surge_enabled ?? false)
  const [surgeMultiplier, setSurgeMultiplier] = useState(String(fareConfig?.surge_multiplier ?? 1.5))
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function handleSave() {
    setMessage(null)

    const base = parseFloat(baseFare)
    const km = parseFloat(perKmRate)
    const minute = parseFloat(perMinuteRate)
    const multiplier = parseFloat(surgeMultiplier)

    if (isNaN(base) || base < 0) { setMessage({ type: "error", text: "Base fare must be >= 0." }); return }
    if (isNaN(km) || km < 0) { setMessage({ type: "error", text: "Per KM rate must be >= 0." }); return }
    if (isNaN(minute) || minute < 0) { setMessage({ type: "error", text: "Per minute rate must be >= 0." }); return }
    if (isNaN(multiplier) || multiplier < 1) { setMessage({ type: "error", text: "Surge multiplier must be >= 1." }); return }

    startTransition(async () => {
      const result = await updateFareConfig({
        baseFare: base,
        perKmRate: km,
        perMinuteRate: minute,
        surgeEnabled,
        surgeMultiplier: multiplier,
      })
      if (result.success) {
        setMessage({ type: "success", text: "Fare config saved." })
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.error })
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
          <h2 className="text-sm font-semibold text-[#0D1B2A]">Fare Calculation</h2>
          <p className="text-xs text-[#8BACC8]">Global rates for estimated fares</p>
        </div>
        <Calculator className="size-5 text-[#8BACC8]" />
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Base Fare / Flagdown (₱)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={baseFare}
              onChange={(e) => { setBaseFare(e.target.value); setMessage(null) }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Per KM Rate (₱)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={perKmRate}
              onChange={(e) => { setPerKmRate(e.target.value); setMessage(null) }}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              Per Minute Rate (₱)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={perMinuteRate}
              onChange={(e) => { setPerMinuteRate(e.target.value); setMessage(null) }}
              className="font-mono"
            />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-lg px-4 py-3"
          style={{ border: "1px solid #DCE6F1", background: "#F8FBFF" }}
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0D1B2A]">Dynamic Surge Pricing</p>
            <p className="text-xs text-[#8BACC8]">
              Multiply fares during high demand periods
            </p>
          </div>
          <div className="flex items-center gap-3">
            {surgeEnabled ? (
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-[#8BACC8]">Multiplier</label>
                <Input
                  type="number"
                  min="1"
                  step="0.1"
                  value={surgeMultiplier}
                  onChange={(e) => { setSurgeMultiplier(e.target.value); setMessage(null) }}
                  className="h-8 w-20 font-mono text-sm"
                />
              </div>
            ) : null}
            <Switch
              checked={surgeEnabled}
              onCheckedChange={(checked) => { setSurgeEnabled(checked); setMessage(null) }}
              aria-label="Toggle dynamic surge pricing"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Rates"
            )}
          </Button>
          {message ? (
            <p className={`text-sm ${message.type === "success" ? "text-[#059669]" : "text-[#DC2626]"}`}>
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
