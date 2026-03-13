export function PassengerDetailsCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground"
          aria-hidden
        >
          SJ
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              Sarah Jenkins
            </h2>
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Verified
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            sarah.j@example.com · +1 (555) 012-3456
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t pt-4 text-sm text-muted-foreground sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide">Rating</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            4.85{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (42 trips)
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Member since</p>
          <p className="mt-1 text-base font-medium text-foreground">
            Oct 2021
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Total spent</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            $1,240.50
          </p>
        </div>
      </div>
    </div>
  )
}

