import { AlertTriangle } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import type {
  ApprovedDriverOption,
  PayoutMetrics,
  PayoutSummary,
} from "@/lib/supabase/queries"

import { CreatePayoutDialog } from "./CreatePayoutDialog"
import { PayoutMetricsGrid } from "./PayoutMetrics"
import { PayoutsTable } from "./PayoutsTable"

interface PaymentsPageProps {
  payouts: PayoutSummary[]
  metrics: PayoutMetrics
  drivers: ApprovedDriverOption[]
  loadError: string | null
}

export function PaymentsPage({
  payouts,
  metrics,
  drivers,
  loadError,
}: PaymentsPageProps) {
  const createDialog = <CreatePayoutDialog drivers={drivers} />

  return (
    <div>
      <PageHeader
        title="Payments & Payouts"
        subtitle="Queue, track, and reconcile driver payouts"
        breadcrumbs={["Business", "Payments"]}
        actions={createDialog}
      />

      <div className="space-y-6 p-7">
        {loadError ? (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
            }}
            role="alert"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Could not load payouts</p>
              <p className="text-xs">
                {loadError} — refresh the page or try again in a moment.
              </p>
            </div>
          </div>
        ) : null}

        <PayoutMetricsGrid metrics={metrics} />
        <PayoutsTable payouts={payouts} createDialog={createDialog} />
      </div>
    </div>
  )
}
