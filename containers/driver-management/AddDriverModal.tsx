"use client"

import { useState, useRef } from "react"
import { FileText, CreditCard } from "lucide-react"
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
import { cn } from "@/lib/utils"

const CITIES = ["New York", "London", "San Francisco"] as const
const SERVICE_TYPES = ["Standard", "Premium", "Van"] as const

export interface AddDriverFormData {
  fullName: string
  phone: string
  email: string
  operatingCity: string
  plateNumber: string
  vehicleModel: string
  serviceType: string
  licenseFile: File | null
  nationalIdFile: File | null
}

const defaultForm: AddDriverFormData = {
  fullName: "",
  phone: "",
  email: "",
  operatingCity: "",
  plateNumber: "",
  vehicleModel: "",
  serviceType: "",
  licenseFile: null,
  nationalIdFile: null,
}

interface AddDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: AddDriverFormData) => void
}

export function AddDriverModal({
  open,
  onOpenChange,
  onSuccess,
}: AddDriverModalProps) {
  const [form, setForm] = useState<AddDriverFormData>(defaultForm)
  const licenseInputRef = useRef<HTMLInputElement>(null)
  const nationalIdInputRef = useRef<HTMLInputElement>(null)

  function update(field: keyof AddDriverFormData, value: string | File | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenChange(open: boolean) {
    if (!open) setForm(defaultForm)
    onOpenChange(open)
  }

  function handleSubmit() {
    if (!form.fullName.trim()) return
    onSuccess?.(form)
    setForm(defaultForm)
    onOpenChange(false)
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
              <div>
                <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                  Operating City
                </label>
                <Select
                  value={form.operatingCity || undefined}
                  onValueChange={(v) => update("operatingCity", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2 – VEHICLE DETAILS */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Vehicle Details
            </h3>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                    Vehicle Model
                  </label>
                  <Input
                    placeholder="Toyota Camry 2023"
                    value={form.vehicleModel}
                    onChange={(e) => update("vehicleModel", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground mb-1.5 block text-sm font-medium">
                  Service Type
                </label>
                <Select
                  value={form.serviceType || undefined}
                  onValueChange={(v) => update("serviceType", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 3 – DOCUMENTS */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Documents
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                ref={licenseInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) =>
                  update("licenseFile", e.target.files?.[0] ?? null)
                }
              />
              <button
                type="button"
                onClick={() => licenseInputRef.current?.click()}
                className={cn(
                  "border-border flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 p-6 transition-colors hover:bg-muted/50",
                )}
              >
                <FileText className="text-muted-foreground size-10" />
                <span className="text-muted-foreground text-sm font-medium">
                  Driver&apos;s License
                </span>
                {form.licenseFile && (
                  <span className="text-muted-foreground truncate text-xs">
                    {form.licenseFile.name}
                  </span>
                )}
              </button>

              <input
                ref={nationalIdInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) =>
                  update("nationalIdFile", e.target.files?.[0] ?? null)
                }
              />
              <button
                type="button"
                onClick={() => nationalIdInputRef.current?.click()}
                className={cn(
                  "border-border flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 p-6 transition-colors hover:bg-muted/50",
                )}
              >
                <CreditCard className="text-muted-foreground size-10" />
                <span className="text-muted-foreground text-sm font-medium">
                  National ID / Passport
                </span>
                {form.nationalIdFile && (
                  <span className="text-muted-foreground truncate text-xs">
                    {form.nationalIdFile.name}
                  </span>
                )}
              </button>
            </div>
          </div>
          </div>
        </div>

        <DialogFooter className="gap-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            Create Driver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
