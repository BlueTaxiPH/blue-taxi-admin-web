"use client"

import { ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function InsuranceCoverageSummaryCard() {
  return (
    <Card className="py-5">
      <CardContent className="flex flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Total Insured Trips Today
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-4xl font-bold leading-none">2,488</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              100% Compliant
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Coverage policy: BlueShield Daily V.4
          </p>
        </div>

        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <ShieldCheck className="size-8" />
        </div>
      </CardContent>
    </Card>
  )
}
