import { Input } from "@/components/ui/input"

export function PassengerInternalNotes() {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <h3 className="font-semibold text-foreground">Internal Notes</h3>

      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide">
            <span>Support Team</span>
            <span>Oct 20, 2:30 PM</span>
          </div>
          <p className="mt-1">
            Passenger complained about cleanliness in trip #TR-8982. Refunded
            $5.00 as courtesy.
          </p>
        </div>

        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between font-medium uppercase tracking-wide">
            <span>System</span>
            <span>Sep 15, 9:00 AM</span>
          </div>
          <p className="mt-1">
            Account flagged once for late cancellation fee dispute.
          </p>
        </div>
      </div>

      <div className="mt-3">
        <Input
          placeholder="Add a private note..."
          className="text-xs"
          aria-label="Add a private note"
        />
      </div>
    </div>
  )
}

