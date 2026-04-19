import {
  fetchPayouts,
  fetchPayoutMetrics,
  fetchApprovedDriversForPayout,
  type PayoutMetrics,
} from "@/lib/supabase/queries"
import { PaymentsPage } from "@/containers/payments"

const EMPTY_METRICS: PayoutMetrics = {
  totalPending: 0,
  paidThisMonth: 0,
  avgPaidThisMonth: 0,
  successRate: 0,
  successRateDenominator: 0,
}

export default async function Page() {
  let payouts: Awaited<ReturnType<typeof fetchPayouts>> = []
  let metrics: PayoutMetrics = EMPTY_METRICS
  let drivers: Awaited<ReturnType<typeof fetchApprovedDriversForPayout>> = []
  let loadError: string | null = null

  try {
    const [p, m, d] = await Promise.all([
      fetchPayouts(),
      fetchPayoutMetrics(),
      fetchApprovedDriversForPayout(),
    ])
    payouts = p
    metrics = m
    drivers = d
  } catch (err) {
    console.error("[Payments] fetch error:", err)
    loadError = err instanceof Error ? err.message : "Unknown error"
  }

  return (
    <PaymentsPage
      payouts={payouts}
      metrics={metrics}
      drivers={drivers}
      loadError={loadError}
    />
  )
}
