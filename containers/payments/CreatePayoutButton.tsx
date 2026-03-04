"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function CreatePayoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreatePayout() {
    const driverIdInput = prompt("Enter Driver Supabase ID to create payout:")
    if (!driverIdInput) return
    const amountInput = prompt("Enter payout amount (₱):")
    if (!amountInput || isNaN(Number(amountInput))) return

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.functions.invoke("admin-create-payout", {
      body: {
        driverId: driverIdInput.trim(),
        amount: Number(amountInput),
      },
    })

    if (error) {
      alert(`Failed to create payout: ${error.message}`)
    } else {
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Button onClick={handleCreatePayout} disabled={isLoading}>
      {isLoading ? "Creating…" : "Create Payout"}
    </Button>
  )
}
