"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { approveDriver } from "@/app/actions/approve-driver"
import { Button } from "@/components/ui/button"

export function ApproveDriverButton({ driverId }: { driverId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerificationAction(action: "approve" | "reject") {
    setError(null)
    setIsLoading(true)
    const result = await approveDriver(driverId, action)
    setIsLoading(false)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : null}
      <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleVerificationAction("approve")}
        disabled={isLoading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleVerificationAction("reject")}
        disabled={isLoading}
      >
        Reject
      </Button>
      </div>
    </div>
  )
}
