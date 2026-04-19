"use client"

import { useState } from "react"
import { Loader2, Check, X, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminRole, AdminUser } from "@/types/admin-user"

const MODULE_LABELS: Record<string, string> = {
  trips: "Trip management",
  drivers: "Driver management",
  passengers: "Passenger management",
  payments: "Payments & payouts",
  system_config: "System & pricing configuration",
  analytics: "Dashboard analytics",
  insurance_reports: "Insurance reports",
}

const MODULE_ORDER = [
  "trips",
  "drivers",
  "passengers",
  "payments",
  "analytics",
  "system_config",
  "insurance_reports",
]

const ROLE_PREVIEW: Record<
  AdminRole,
  {
    label: string
    purpose: string
    modules: string[]
  }
> = {
  superadmin: {
    label: "Superadmin",
    purpose: "Full platform control, including role management and system settings",
    modules: MODULE_ORDER,
  },
  blue_taxi_admin: {
    label: "Blue Taxi Admin",
    purpose: "Day-to-day operations across rides, drivers, passengers, and payouts",
    modules: ["trips", "drivers", "passengers", "payments", "analytics"],
  },
  insurance_admin: {
    label: "Insurance Admin",
    purpose: "Insurance coverage reports and compliance manifests only",
    modules: ["insurance_reports"],
  },
}

interface ApproveAdminDialogProps {
  user: AdminUser | null
  isSubmitting: boolean
  onConfirm: (role: AdminRole) => void
  onClose: () => void
}

export function ApproveAdminDialog({
  user,
  isSubmitting,
  onConfirm,
  onClose,
}: ApproveAdminDialogProps) {
  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        {user ? (
          <DialogBody
            key={user.id}
            user={user}
            isSubmitting={isSubmitting}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DialogBody({
  user,
  isSubmitting,
  onConfirm,
  onClose,
}: {
  user: AdminUser
  isSubmitting: boolean
  onConfirm: (role: AdminRole) => void
  onClose: () => void
}) {
  const [role, setRole] = useState<AdminRole>("blue_taxi_admin")
  const preview = ROLE_PREVIEW[role]

  return (
    <>
      <DialogHeader>
        <DialogTitle style={{ fontFamily: "var(--font-outfit, sans-serif)" }}>
          Approve admin user
        </DialogTitle>
        <DialogDescription>
          Grant{" "}
          <span className="font-medium text-[#0D1B2A]">
            {user.first_name} {user.last_name}
          </span>{" "}
          access with the role below. Individual modules can still be adjusted afterwards in Access Control.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="approve-role"
            className="text-[11px] font-semibold uppercase tracking-wider text-[#4A607A]"
          >
            Role
          </label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as AdminRole)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="approve-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_PREVIEW) as AdminRole[]).map((id) => (
                <SelectItem key={id} value={id}>
                  {ROLE_PREVIEW[id].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className="overflow-hidden rounded-xl"
          style={{ border: "1px solid #DCE6F1", background: "#F8FBFF" }}
        >
          <div
            className="flex items-start gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid #DCE6F1", background: "#EFF6FF" }}
          >
            <ShieldCheck className="mt-0.5 size-5 text-[#1A56DB]" aria-hidden />
            <div>
              <p
                className="text-sm font-semibold text-[#0D1B2A]"
                style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
              >
                {preview.label}
              </p>
              <p className="text-xs text-[#4A607A]">{preview.purpose}</p>
            </div>
          </div>

          <ul className="divide-y" style={{ borderColor: "#DCE6F1" }}>
            {MODULE_ORDER.map((moduleKey) => {
              const allowed = preview.modules.includes(moduleKey)
              return (
                <li
                  key={moduleKey}
                  className="flex items-center justify-between gap-3 px-4 py-2"
                >
                  <span
                    className={
                      allowed
                        ? "text-xs font-medium text-[#0D1B2A]"
                        : "text-xs text-[#8BACC8]"
                    }
                  >
                    {MODULE_LABELS[moduleKey] ?? moduleKey}
                  </span>
                  {allowed ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ background: "#ECFDF5", color: "#059669" }}
                    >
                      <Check className="size-3" aria-hidden />
                      Granted
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ background: "#F9FAFB", color: "#6B7280" }}
                    >
                      <X className="size-3" aria-hidden />
                      Denied
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(role)} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Approving…
            </>
          ) : (
            "Approve & grant access"
          )}
        </Button>
      </DialogFooter>
    </>
  )
}
