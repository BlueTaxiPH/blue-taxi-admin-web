import { fetchPayouts } from "@/lib/supabase/queries"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreatePayoutButton } from "@/containers/payments/CreatePayoutButton"

function payoutStatusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800"
    case "pending":
      return "bg-amber-100 text-amber-800"
    case "failed":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function PaymentsPage() {
  let payouts: Awaited<ReturnType<typeof fetchPayouts>> = []
  try {
    payouts = await fetchPayouts()
  } catch (err) {
    console.error("[Payments] fetch error:", err)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Payments & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage driver payout requests and payment history.
          </p>
        </div>
        <CreatePayoutButton />
      </div>

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
                        className={payoutStatusClass(payout.status)}
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
  )
}
