import { fetchPayouts } from "@/lib/supabase/queries"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { payoutStatusBadge } from "@/lib/badge-utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreatePayoutButton } from "@/containers/payments/CreatePayoutButton"

export default async function PaymentsPage() {
  let payouts: Awaited<ReturnType<typeof fetchPayouts>> = []
  try {
    payouts = await fetchPayouts()
  } catch (err) {
    console.error("[Payments] fetch error:", err)
  }

  return (
    <div>
      <PageHeader
        title="Payments & Payouts"
        subtitle="Manage driver payout requests and payment history"
        breadcrumbs={["Business", "Payments"]}
        actions={<CreatePayoutButton />}
      />
      <div className="space-y-6 p-7">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payout ID</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Paid At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No payouts found.
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((payout: any) => {
                const driverProfile = payout.driver_profiles
                const driverUser = driverProfile?.users
                const driverName = driverUser
                  ? [driverUser.first_name, driverUser.last_name].filter(Boolean).join(" ")
                  : "—"

                return (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-xs">
                      {payout.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>{driverName}</TableCell>
                    <TableCell className="font-semibold">
                      ₱{Number(payout.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={payoutStatusBadge(payout.status)}
                      >
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {payout.processed_at
                        ? new Date(payout.processed_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  )
}
