import { Button } from "@/components/ui/button"
import { Building2, Dumbbell, House } from "lucide-react"

export function PassengerSavedPlaces() {
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Saved Places</h3>
          <Button variant="ghost">
            Edit
          </Button>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <House className="size-4" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Home</p>
            <p className="text-xs text-muted-foreground">
              1243 Market St, San Francisco, CA 94103
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Building2 className="size-4" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Office</p>
            <p className="text-xs text-muted-foreground">
              500 Terry Francois St, San Francisco, CA 94158
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            <Dumbbell className="size-4" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Gym</p>
            <p className="text-xs text-muted-foreground">
              24th St Mission, San Francisco, CA 94110
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

