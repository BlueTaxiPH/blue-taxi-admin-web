import { Button } from "@/components/ui/button"

export function PassengerSavedPlaces() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Saved Places</h3>
        <Button variant="ghost" size="xs" className="text-xs">
          Edit
        </Button>
      </div>
      <div className="space-y-3 rounded-xl border bg-card p-4 text-sm">
        <div className="flex items-start gap-3">
          <div className="mt-1 size-7 shrink-0 rounded-full bg-blue-100 text-center text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            H
          </div>
          <div>
            <p className="font-medium text-foreground">Home</p>
            <p className="text-xs text-muted-foreground">
              1243 Market St, San Francisco, CA 94103
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 size-7 shrink-0 rounded-full bg-amber-100 text-center text-sm font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            O
          </div>
          <div>
            <p className="font-medium text-foreground">Office</p>
            <p className="text-xs text-muted-foreground">
              500 Terry Francois St, San Francisco, CA 94158
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 size-7 shrink-0 rounded-full bg-violet-100 text-center text-sm font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            G
          </div>
          <div>
            <p className="font-medium text-foreground">Gym</p>
            <p className="text-xs text-muted-foreground">
              24th St Mission, San Francisco, CA 94110
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

