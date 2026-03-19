 "use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PassengerPageHeader() {
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)

  function handleConfirmSuspend() {
    // TODO: replace with suspend API integration.
    setSuspendModalOpen(false)
  }

  return (
    <>
      <header className="flex flex-col gap-3 border-b bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
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
              </div>
              <p className="text-sm text-muted-foreground">ID: #PA-8920-XJ</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="destructive"
            className="inline-flex items-center gap-2"
            onClick={() => setSuspendModalOpen(true)}
          >
            <CircleX className="size-4" aria-hidden />
            Suspend Account
          </Button>
        </div>
      </header>

      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend passenger account?</DialogTitle>
            <DialogDescription>
              This will temporarily block the passenger from booking new rides.
              You can reactivate the account later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmSuspend}>
              Confirm Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

