"use client"

import { ShieldCheck } from "lucide-react"
import type { fetchCompletedRides } from "@/lib/supabase/queries"

type CompletedRide = Awaited<ReturnType<typeof fetchCompletedRides>>[number]

interface InsuranceCoverageSummaryCardProps {
  allRides: CompletedRide[]
  filteredRides: CompletedRide[]
  insuranceAmount: number
  feeLabel: string
  period: string
}

export function InsuranceCoverageSummaryCard({
  allRides,
  filteredRides,
  insuranceAmount,
  feeLabel,
  period,
}: InsuranceCoverageSummaryCardProps) {
  const today = new Date()
  const todayRides = allRides.filter((r) => {
    return new Date(r.trip_completed_at ?? r.created_at).toDateString() === today.toDateString()
  })

  const fmt = (n: number) =>
    n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const stats = [
    {
      label: "Trips Today",
      value: todayRides.length.toLocaleString(),
      accent: "#1A56DB",
    },
    {
      label: "Premium Today",
      value: `₱${fmt(todayRides.length * insuranceAmount)}`,
      accent: "#059669",
    },
    {
      label: `Trips · ${period}`,
      value: filteredRides.length.toLocaleString(),
      accent: "#1A56DB",
    },
    {
      label: `Premium · ${period}`,
      value: `₱${fmt(filteredRides.length * insuranceAmount)}`,
      accent: "#059669",
    },
  ]

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{
        border: "1px solid #DCE6F1",
        boxShadow: "0 1px 3px rgba(13,27,42,0.06), 0 4px 12px rgba(13,27,42,0.04)",
      }}
    >
      {/* Policy header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #EEF3F9" }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#1A56DB]" aria-hidden />
          <p className="text-sm font-semibold text-[#0D1B2A]">Coverage Policy</p>
          <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#1A56DB]">
            {feeLabel}
          </span>
        </div>
        <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
          100% Compliant
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {stats.map(({ label, value, accent }, i) => (
          <div
            key={label}
            className="relative px-5 py-4"
            style={{
              borderRight: i < stats.length - 1 ? "1px solid #EEF3F9" : undefined,
            }}
          >
            <div
              className="absolute left-0 top-0 h-full w-[3px]"
              style={{ background: accent }}
              aria-hidden
            />
            <p className="pl-2 text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
              {label}
            </p>
            <p className="pl-2 font-mono text-xl font-bold text-[#0D1B2A]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
