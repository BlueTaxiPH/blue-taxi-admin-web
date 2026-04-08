"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CircleX, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { suspendPassenger, reactivatePassenger } from "@/app/actions/suspend-passenger"

interface PassengerPageHeaderProps {
  name: string
  userId: string
  isActive: boolean
}

export function PassengerPageHeader({ name, userId, isActive }: PassengerPageHeaderProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setIsPending(true)
    setError(null)
    const result = isActive
      ? await suspendPassenger(userId)
      : await reactivatePassenger(userId)
    setIsPending(false)

    if (result.success) {
      setModalOpen(false)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <>
      <div
        className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b px-7 py-5 bg-[#F4F6FB]/90 backdrop-blur-sm"
        style={{ borderColor: "#DCE6F1" }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/passengers">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to passengers</span>
            </Link>
          </Button>
          <div>
            <h1
              className="text-2xl font-bold text-[#0D1B2A]"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              {name}
            </h1>
            <p className="font-mono text-sm text-[#8BACC8]">
              ID: {userId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <Button
          variant={isActive ? "destructive" : "default"}
          onClick={() => setModalOpen(true)}
        >
          {isActive ? (
            <>
              <CircleX className="size-4" aria-hidden />
              Suspend Account
            </>
          ) : (
            <>
              <RotateCcw className="size-4" aria-hidden />
              Reactivate Account
            </>
          )}
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isActive ? "Suspend passenger account?" : "Reactivate passenger account?"}
            </DialogTitle>
            <DialogDescription>
              {isActive
                ? "This will temporarily block the passenger from booking new rides. You can reactivate the account later."
                : "This will restore the passenger's ability to book rides."}
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{error}</p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant={isActive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Processing..." : isActive ? "Confirm Suspend" : "Confirm Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
