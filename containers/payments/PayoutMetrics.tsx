import { Wallet, CheckCircle2, TrendingUp, PercentCircle } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import type { PayoutMetrics } from "@/lib/supabase/queries"

const peso = new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 })

function currencyLabel(n: number): string {
  return peso.format(Math.round(n))
}

interface PayoutMetricsProps {
  metrics: PayoutMetrics
}

export function PayoutMetricsGrid({ metrics }: PayoutMetricsProps) {
  const successPct = Math.round(metrics.successRate * 100)

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total Pending"
        prefix="\u20B1"
        value={currencyLabel(metrics.totalPending)}
        context={
          metrics.totalPending === 0
            ? "No payouts awaiting processing"
            : "Awaiting processing"
        }
        icon={Wallet}
        badge={
          metrics.totalPending > 0
            ? { label: "Queue", tone: "warning" }
            : null
        }
        animationDelay={0}
      />
      <MetricCard
        label="Paid This Month"
        prefix="\u20B1"
        value={currencyLabel(metrics.paidThisMonth)}
        context="Disbursed since the 1st"
        icon={CheckCircle2}
        animationDelay={80}
      />
      <MetricCard
        label="Average Payout"
        prefix="\u20B1"
        value={currencyLabel(metrics.avgPaidThisMonth)}
        context={
          metrics.avgPaidThisMonth === 0
            ? "No paid payouts this month"
            : "Per paid payout this month"
        }
        icon={TrendingUp}
        animationDelay={160}
      />
      <MetricCard
        label="Success Rate"
        value={metrics.successRateDenominator === 0 ? "—" : `${successPct}%`}
        context={
          metrics.successRateDenominator === 0
            ? "No resolved payouts yet"
            : `Across ${metrics.successRateDenominator.toLocaleString()} resolved payout${metrics.successRateDenominator === 1 ? "" : "s"}`
        }
        icon={PercentCircle}
        badge={
          metrics.successRateDenominator === 0
            ? null
            : successPct >= 95
              ? { label: "Healthy", tone: "success" }
              : successPct >= 80
                ? { label: "Fair", tone: "warning" }
                : { label: "At risk", tone: "danger" }
        }
        animationDelay={240}
      />
    </section>
  )
}
