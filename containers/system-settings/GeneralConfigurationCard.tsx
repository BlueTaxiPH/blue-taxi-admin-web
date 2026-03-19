"use client"

import { Settings } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function GeneralConfigurationCard({
  platformCommission,
  insuranceFeePolicy,
  editableBySuperAdminOnly,
  maskedCalling,
  onPlatformCommissionChange,
  onInsuranceFeePolicyChange,
  onEditableBySuperAdminOnlyChange,
  onMaskedCallingChange,
}: {
  platformCommission: string
  insuranceFeePolicy: string
  editableBySuperAdminOnly: boolean
  maskedCalling: boolean
  onPlatformCommissionChange: (value: string) => void
  onInsuranceFeePolicyChange: (value: string) => void
  onEditableBySuperAdminOnlyChange: (checked: boolean) => void
  onMaskedCallingChange: (checked: boolean) => void
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2">
            <Settings className="size-8 text-primary" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold">General Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Core platform parameters
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Platform Commission %
          </label>
          <Input
            type="number"
            value={platformCommission}
            step={0.1}
            onChange={(e) => onPlatformCommissionChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Applied to all standard rides.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Insurance Fee Policy
          </label>
          <Input
            type="number"
            value={insuranceFeePolicy}
            step={0.01}
            onChange={(e) => onInsuranceFeePolicyChange(e.target.value)}
          />
          <Checkbox
            checked={editableBySuperAdminOnly}
            onChange={(e) => onEditableBySuperAdminOnlyChange(e.target.checked)}
            label="Editable by Super Admin only"
          />
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Masked Calling</p>
          <p className="text-xs text-muted-foreground">
            Hide passenger & driver phone numbers during active trips.
          </p>
        </div>
        <Switch checked={maskedCalling} onCheckedChange={onMaskedCallingChange} />
      </div>
    </section>
  )
}

