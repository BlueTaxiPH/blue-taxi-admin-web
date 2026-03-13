import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function PassengerPageHeader() {
  return (
    <header className="flex flex-col gap-3 border-b bg-background pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            aria-label="Back to passengers"
          >
            <Link href="/passengers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Passenger Profile
              </h1>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                Verified
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">ID: #PA-8920-XJ</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm">
          Message
        </Button>
        <Button variant="outline" size="sm">
          Reset Pass
        </Button>
        <Button variant="outline" size="sm">
          Payment
        </Button>
        <Button variant="destructive" size="sm">
          Suspend Account
        </Button>
      </div>
    </header>
  )
}

