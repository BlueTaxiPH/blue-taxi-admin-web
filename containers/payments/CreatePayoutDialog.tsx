"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ApprovedDriverOption } from "@/lib/supabase/queries"

interface CreatePayoutDialogProps {
  drivers: ApprovedDriverOption[]
}

export function CreatePayoutDialog({ drivers }: CreatePayoutDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [driverId, setDriverId] = useState("")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setDriverId("")
    setAmount("")
    setNotes("")
    setError(null)
    setIsSubmitting(false)
  }

  function handleOpenChange(next: boolean) {
    if (isSubmitting) return
    setOpen(next)
    if (!next) reset()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!driverId) {
      setError("Select a driver.")
      return
    }
    const parsedAmount = Number(amount)
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0.")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { error: invokeError } = await supabase.functions.invoke(
      "admin-create-payout",
      {
        body: { driverId, amount: parsedAmount, notes: notes.trim() || undefined },
      },
    )

    if (invokeError) {
      setError(invokeError.message ?? "Failed to create payout.")
      setIsSubmitting(false)
      return
    }

    reset()
    setOpen(false)
    router.refresh()
  }

  const selectedDriver = drivers.find((d) => d.id === driverId)
  const noDrivers = drivers.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          Create Payout
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Create driver payout
          </DialogTitle>
          <DialogDescription>
            Queues a new payout record for an approved driver. The driver is notified once processed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="payout-driver"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#4A607A]"
            >
              Driver <span className="text-[#DC2626]">*</span>
            </label>
            <Select
              value={driverId}
              onValueChange={setDriverId}
              disabled={noDrivers || isSubmitting}
            >
              <SelectTrigger id="payout-driver" aria-required>
                <SelectValue
                  placeholder={noDrivers ? "No approved drivers available" : "Select a driver"}
                />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    <span className="flex flex-col items-start gap-0.5">
                      <span className="text-sm">{driver.name}</span>
                      {driver.phone ? (
                        <span className="font-mono text-[11px] text-[#8BACC8]">
                          {driver.phone}
                        </span>
                      ) : null}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="payout-amount"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#4A607A]"
            >
              Amount <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#4A607A]"
                aria-hidden
              >
                ₱
              </span>
              <Input
                id="payout-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                required
                placeholder="0.00"
                className="pl-7 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="payout-notes"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#4A607A]"
            >
              Notes <span className="text-[#8BACC8] normal-case">(optional)</span>
            </label>
            <Textarea
              id="payout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Internal notes attached to this payout"
              rows={3}
            />
          </div>

          {error ? (
            <p
              className="rounded-md px-3 py-2 text-sm text-[#DC2626]"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {selectedDriver ? (
            <div
              className="rounded-md px-3 py-2 text-xs"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1A56DB" }}
            >
              Creating payout for <span className="font-semibold">{selectedDriver.name}</span>
            </div>
          ) : null}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || noDrivers}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                "Create Payout"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
