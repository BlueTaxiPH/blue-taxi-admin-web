"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createDriver } from "@/app/actions/create-driver"

/** DB vehicle_type enum: basic | xl */
const SERVICE_TYPE_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "xl", label: "XL" },
] as const

export interface AddDriverFormData {
  fullName: string
  phone: string
  email: string
  plateNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vehicleColor: string
  serviceType: "basic" | "xl"
}

const defaultForm: AddDriverFormData = {
  fullName: "",
  phone: "",
  email: "",
  plateNumber: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  vehicleColor: "",
  serviceType: "basic",
}

interface AddDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: AddDriverFormData) => void
}

function hasAnyVehicleField(form: AddDriverFormData): boolean {
  return !!(
    form.plateNumber?.trim() ||
    form.vehicleMake?.trim() ||
    form.vehicleModel?.trim() ||
    form.vehicleYear?.trim() ||
    form.vehicleColor?.trim()
  )
}

function hasFullVehicle(form: AddDriverFormData): boolean {
  const year = form.vehicleYear?.trim() ? parseInt(form.vehicleYear, 10) : NaN
  return !!(
    form.plateNumber?.trim() &&
    form.vehicleMake?.trim() &&
    form.vehicleModel?.trim() &&
    Number.isFinite(year) &&
    year >= 1990 &&
    year <= 2030 &&
    form.vehicleColor?.trim()
  )
}

export function AddDriverModal({
  open,
  onOpenChange,
  onSuccess,
}: AddDriverModalProps) {
  const [form, setForm] = useState<AddDriverFormData>(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  function update(
    field: keyof AddDriverFormData,
    value: string | "basic" | "xl"
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setForm(defaultForm)
      setServerError(null)
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit() {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setServerError("Full name, email, and phone are required.")
      return
    }

    if (hasAnyVehicleField(form) && !hasFullVehicle(form)) {
      setServerError(
        "To add a vehicle, please fill Plate Number, Make, Model, Year (1990–2030), and Color."
      )
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    const result = await createDriver({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      plateNumber: form.plateNumber?.trim() || undefined,
      vehicleMake: form.vehicleMake?.trim() || undefined,
      vehicleModel: form.vehicleModel?.trim() || undefined,
      vehicleYear: form.vehicleYear?.trim()
        ? parseInt(form.vehicleYear, 10)
        : undefined,
      vehicleColor: form.vehicleColor?.trim() || undefined,
      serviceType: form.serviceType,
    })

    setIsSubmitting(false)

    if (result.success) {
      onSuccess?.(form)
      setForm(defaultForm)
      onOpenChange(false)
    } else {
      setServerError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-xl sm:max-w-xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle>Add New Driver</DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4">
          <div className="flex flex-col gap-6 py-2">
            {/* Section 1 – PERSONAL INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Personal Information
              </h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="driver@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 – VEHICLE DETAILS (matches DB: vehicles) */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Vehicle Details
              </h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                    Plate Number
                  </label>
                  <Input
                    placeholder="ABC-1234"
                    value={form.plateNumber}
                    onChange={(e) => update("plateNumber", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                      Make
                    </label>
                    <Input
                      placeholder="e.g. Toyota"
                      value={form.vehicleMake}
                      onChange={(e) => update("vehicleMake", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                      Model
                    </label>
                    <Input
                      placeholder="e.g. Vios"
                      value={form.vehicleModel}
                      onChange={(e) =>
                        update("vehicleModel", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                      Year
                    </label>
                    <Input
                      type="number"
                      min={1990}
                      max={2030}
                      placeholder="e.g. 2023"
                      value={form.vehicleYear}
                      onChange={(e) => update("vehicleYear", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                      Color
                    </label>
                    <Input
                      placeholder="e.g. White"
                      value={form.vehicleColor}
                      onChange={(e) =>
                        update("vehicleColor", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                    Service Type
                  </label>
                  <Select
                    value={form.serviceType}
                    onValueChange={(v: "basic" | "xl") =>
                      update("serviceType", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {serverError ? (
          <p className="text-destructive px-1 text-sm">{serverError}</p>
        ) : null}

        <DialogFooter className="gap-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
