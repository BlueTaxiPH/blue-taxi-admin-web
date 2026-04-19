"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  CheckCircle2,
  Flag,
  Loader2,
  Route,
  Timer,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { updateFareConfig } from "@/app/actions/update-fare-config"
import type { FareConfig } from "@/lib/supabase/queries"

interface FareConfigCardProps {
  fareConfig: FareConfig | null
}

type Message =
  | { type: "success"; text: string }
  | { type: "error"; text: string }

function FareInput({
  id,
  label,
  value,
  onChange,
  suffix,
  icon: Icon,
  description,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  suffix: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#4A607A]"
      >
        <Icon className="size-3.5 text-[#8BACC8]" aria-hidden />
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#4A607A]"
          aria-hidden
        >
          ₱
        </span>
        <Input
          id={id}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-7 pr-14 font-mono tabular-nums"
        />
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-wider text-[#8BACC8]"
          aria-hidden
        >
          {suffix}
        </span>
      </div>
      {description ? (
        <p className="text-[11px] text-[#8BACC8]">{description}</p>
      ) : null}
    </div>
  )
}

export function FareConfigCard({ fareConfig }: FareConfigCardProps) {
  const router = useRouter()
  const [baseFare, setBaseFare] = useState(String(fareConfig?.base_fare ?? 45))
  const [perKmRate, setPerKmRate] = useState(String(fareConfig?.per_km_rate ?? 15.5))
  const [perMinuteRate, setPerMinuteRate] = useState(String(fareConfig?.per_minute_rate ?? 2.5))
  const [surgeEnabled, setSurgeEnabled] = useState(fareConfig?.surge_enabled ?? false)
  const [surgeMultiplier, setSurgeMultiplier] = useState(String(fareConfig?.surge_multiplier ?? 1.5))
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<Message | null>(null)

  function clearMessage() {
    setMessage(null)
  }

  function handleSave() {
    setMessage(null)

    const base = parseFloat(baseFare)
    const km = parseFloat(perKmRate)
    const minute = parseFloat(perMinuteRate)
    const multiplier = parseFloat(surgeMultiplier)

    if (Number.isNaN(base) || base < 0) {
      setMessage({ type: "error", text: "Base fare must be a number greater than or equal to 0." })
      return
    }
    if (Number.isNaN(km) || km < 0) {
      setMessage({ type: "error", text: "Per-kilometer rate must be a number greater than or equal to 0." })
      return
    }
    if (Number.isNaN(minute) || minute < 0) {
      setMessage({ type: "error", text: "Per-minute rate must be a number greater than or equal to 0." })
      return
    }
    if (Number.isNaN(multiplier) || multiplier < 1) {
      setMessage({ type: "error", text: "Surge multiplier must be 1.0 or higher." })
      return
    }

    startTransition(async () => {
      const result = await updateFareConfig({
        baseFare: base,
        perKmRate: km,
        perMinuteRate: minute,
        surgeEnabled,
        surgeMultiplier: multiplier,
      })
      if (result.success) {
        setMessage({ type: "success", text: "Fare configuration saved." })
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.error })
      }
    })
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)" }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "#EEF3F9" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ background: "#EFF6FF" }}
          >
            <Calculator className="size-5 text-[#1A56DB]" aria-hidden />
          </div>
          <div>
            <h2
              className="text-sm font-semibold text-[#0D1B2A]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Fare calculation
            </h2>
            <p className="text-xs text-[#8BACC8]">Global rates used for estimated fares</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5">
        <section className="space-y-3">
          <header>
            <h3
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0D1B2A]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Base fare
            </h3>
            <p className="text-[11px] text-[#8BACC8]">Charged once at the start of every trip</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-3">
            <FareInput
              id="base-fare"
              label="Flagdown"
              value={baseFare}
              onChange={(v) => { setBaseFare(v); clearMessage() }}
              suffix="per trip"
              icon={Flag}
              description="Minimum fare per booking"
            />
            <FareInput
              id="per-km"
              label="Per kilometer"
              value={perKmRate}
              onChange={(v) => { setPerKmRate(v); clearMessage() }}
              suffix="/ km"
              icon={Route}
              description="Applied to trip distance"
            />
            <FareInput
              id="per-minute"
              label="Per minute"
              value={perMinuteRate}
              onChange={(v) => { setPerMinuteRate(v); clearMessage() }}
              suffix="/ min"
              icon={Timer}
              description="Applied to trip duration"
            />
          </div>
        </section>

        <div className="h-px" style={{ background: "#EEF3F9" }} aria-hidden />

        <section className="space-y-3">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h3
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0D1B2A]"
                style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
              >
                <TrendingUp className="size-3.5 text-[#8BACC8]" aria-hidden />
                Dynamic surge
              </h3>
              <p className="text-[11px] text-[#8BACC8]">Multiplies the final fare during peak demand</p>
            </div>
            <Switch
              checked={surgeEnabled}
              onCheckedChange={(checked) => { setSurgeEnabled(checked); clearMessage() }}
              aria-label="Toggle dynamic surge pricing"
            />
          </header>

          {surgeEnabled ? (
            <div
              className="flex flex-col gap-3 rounded-lg px-4 py-3 sm:flex-row sm:items-end"
              style={{ border: "1px solid #DCE6F1", background: "#F8FBFF" }}
            >
              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="surge-multiplier"
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#4A607A]"
                >
                  Multiplier
                </label>
                <div className="relative">
                  <Input
                    id="surge-multiplier"
                    type="number"
                    min="1"
                    step="0.1"
                    value={surgeMultiplier}
                    onChange={(e) => { setSurgeMultiplier(e.target.value); clearMessage() }}
                    className="pr-12 font-mono tabular-nums"
                  />
                  <span
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-wider text-[#8BACC8]"
                    aria-hidden
                  >
                    &times;
                  </span>
                </div>
                <p className="text-[11px] text-[#8BACC8]">
                  e.g. 1.5&times; multiplies a ₱100 fare to ₱150
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-[#8BACC8]">
              Surge is currently off. Toggle to enable and set a multiplier.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save rates"
            )}
          </Button>

          {message ? (
            message.type === "success" ? (
              <p
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm"
                style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
                role="status"
              >
                <CheckCircle2 className="size-4" aria-hidden />
                {message.text}
              </p>
            ) : (
              <p
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-destructive"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                role="alert"
              >
                <AlertCircle className="size-4" aria-hidden />
                {message.text}
              </p>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
