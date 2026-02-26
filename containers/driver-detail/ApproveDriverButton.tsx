"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function ApproveDriverButton({ driverId }: { driverId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleApprove() {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.functions.invoke("admin-approve-driver", {
      body: { driverId, action: "approve" },
    })
    router.refresh()
    setIsLoading(false)
  }

  async function handleReject() {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.functions.invoke("admin-approve-driver", {
      body: { driverId, action: "reject" },
    })
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex gap-2 pt-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={isLoading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleReject}
        disabled={isLoading}
      >
        Reject
      </Button>
    </div>
  )
}
