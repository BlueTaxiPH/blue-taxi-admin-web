"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardRefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [lastAt, setLastAt] = useState<Date | null>(null)

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
    setLastAt(new Date())
  }

  const timeLabel = lastAt
    ? `Refreshed at ${lastAt.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}`
    : null

  return (
    <div className="flex items-center gap-3">
      {timeLabel ? (
        <span className="text-xs text-[#8BACC8]">{timeLabel}</span>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isPending}
        className="gap-2"
      >
        <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
        Refresh
      </Button>
    </div>
  )
}
