"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldBan,
  RotateCcw,
  ClipboardEdit,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { approveDriver } from "@/app/actions/approve-driver"
import { suspendDriver } from "@/app/actions/suspend-driver"
import { setDriverUnderReview } from "@/app/actions/set-driver-under-review"

interface DriverPageHeaderProps {
  driverId: string
  driverName: string
  shortId: string
  verificationStatus: string
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
  },
  under_review: {
    label: "Under Review",
    className: "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
  },
  approved: {
    label: "Approved",
    className: "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
  },
  suspended: {
    label: "Suspended",
    className: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]",
  },
}

type ModalType = "reject" | "suspend" | null

export function DriverPageHeader({
  driverId,
  driverName,
  shortId,
  verificationStatus,
}: DriverPageHeaderProps) {
  const router = useRouter()
  const [modal, setModal] = useState<ModalType>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const badge = STATUS_BADGE[verificationStatus] ?? STATUS_BADGE.pending

  async function handleApprove() {
    setIsPending(true)
    setError(null)
    const result = await approveDriver(driverId, "approve")
    setIsPending(false)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleReject() {
    setIsPending(true)
    setError(null)
    const result = await approveDriver(driverId, "reject")
    setIsPending(false)
    if (result.success) {
      setModal(null)
      setRejectReason("")
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleSuspend() {
    setIsPending(true)
    setError(null)
    const result = await suspendDriver(driverId)
    setIsPending(false)
    if (result.success) {
      setModal(null)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleReactivate() {
    setIsPending(true)
    setError(null)
    const result = await approveDriver(driverId, "approve")
    setIsPending(false)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  async function handleSetUnderReview() {
    setIsPending(true)
    setError(null)
    const result = await setDriverUnderReview(driverId)
    setIsPending(false)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  function renderActions() {
    switch (verificationStatus) {
      case "pending":
      case "under_review":
        return (
          <div className="flex items-center gap-2">
            <Button onClick={handleApprove} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden />
              )}
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setModal("reject")}
              disabled={isPending}
            >
              <XCircle className="size-4" aria-hidden />
              Reject
            </Button>
          </div>
        )

      case "approved":
        return (
          <Button
            variant="destructive"
            onClick={() => setModal("suspend")}
            disabled={isPending}
          >
            <ShieldBan className="size-4" aria-hidden />
            Suspend
          </Button>
        )

      case "suspended":
        return (
          <Button onClick={handleReactivate} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <RotateCcw className="size-4" aria-hidden />
            )}
            Reactivate
          </Button>
        )

      case "rejected":
        return (
          <div className="flex items-center gap-2">
            <Button onClick={handleApprove} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={handleSetUnderReview}
              disabled={isPending}
            >
              <ClipboardEdit className="size-4" aria-hidden />
              Set to Under Review
            </Button>
          </div>
        )

      default:
        return null
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
            <Link href="/drivers">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to drivers</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-bold text-[#0D1B2A]"
                style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
              >
                {driverName}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="font-mono text-sm text-[#8BACC8]">
              ID: {shortId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error ? (
            <p className="text-sm text-[#DC2626]">{error}</p>
          ) : null}
          {renderActions()}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={modal === "reject"} onOpenChange={(open) => { if (!open) { setModal(null); setRejectReason(""); setError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject driver?</DialogTitle>
            <DialogDescription>
              This will mark the driver as rejected. They will not be able to accept rides.
              Please provide a reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (min 3 characters)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[80px]"
          />
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{error}</p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setModal(null); setRejectReason(""); setError(null); }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || rejectReason.trim().length < 3}
            >
              {isPending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={modal === "suspend"} onOpenChange={(open) => { if (!open) { setModal(null); setError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend driver?</DialogTitle>
            <DialogDescription>
              This will block the driver from accepting rides. You can reactivate
              the account later.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{error}</p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setModal(null); setError(null); }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={isPending}
            >
              {isPending ? "Suspending..." : "Confirm Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
