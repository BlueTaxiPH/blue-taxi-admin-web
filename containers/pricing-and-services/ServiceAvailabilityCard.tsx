"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, Van } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateServiceAvailability } from "@/app/actions/update-service-availability"

interface City {
  id: string
  name: string
}

interface ServiceAvailabilityCardProps {
  cities: City[]
  selectedCityId: string
  onCityChange: (cityId: string) => void
  cityId: string
  isBasicAvailable: boolean
  isXlAvailable: boolean
  onServiceUpdated: () => void
}

export function ServiceAvailabilityCard({
  cities,
  selectedCityId,
  onCityChange,
  cityId,
  isBasicAvailable,
  isXlAvailable,
  onServiceUpdated,
}: ServiceAvailabilityCardProps) {
  const router = useRouter()
  const [isUpdatingBasic, setUpdatingBasic] = useState(false)
  const [isUpdatingXl, setUpdatingXl] = useState(false)

  async function handleBasicToggle(checked: boolean) {
    setUpdatingBasic(true)
    const result = await updateServiceAvailability(cityId, "basic", checked)
    if (result.success) {
      onServiceUpdated()
      router.refresh()
    }
    setUpdatingBasic(false)
  }

  async function handleXlToggle(checked: boolean) {
    setUpdatingXl(true)
    const result = await updateServiceAvailability(cityId, "xl", checked)
    if (result.success) {
      onServiceUpdated()
      router.refresh()
    }
    setUpdatingXl(false)
  }

  const selectedCityName = cities.find((c) => c.id === selectedCityId)?.name ?? "City"

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "#EEF3F9" }}
      >
        <div>
          <h2 className="text-sm font-semibold text-[#0D1B2A]">Service Availability</h2>
          <p className="text-xs text-[#8BACC8]">Toggle services per city</p>
        </div>
        <Select value={selectedCityId} onValueChange={onCityChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0" style={{ borderColor: "#EEF3F9" }}>
        {/* Blue Basic */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1A56DB]">
                <Car className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1B2A]">Blue Basic</p>
                <p className="text-xs text-[#8BACC8]">Standard 4-seater</p>
              </div>
            </div>
            <Switch
              checked={isBasicAvailable}
              onCheckedChange={handleBasicToggle}
              disabled={isUpdatingBasic}
              aria-label="Toggle Blue Basic"
            />
          </div>
          <div className="mt-3">
            <Badge
              variant="secondary"
              className={
                isBasicAvailable
                  ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                  : "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]"
              }
            >
              {isBasicAvailable ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Blue XL */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Van className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1B2A]">Blue XL</p>
                <p className="text-xs text-[#8BACC8]">Spacious 6-seater</p>
              </div>
            </div>
            <Switch
              checked={isXlAvailable}
              onCheckedChange={handleXlToggle}
              disabled={isUpdatingXl}
              aria-label="Toggle Blue XL"
            />
          </div>
          <div className="mt-3">
            <Badge
              variant="secondary"
              className={
                isXlAvailable
                  ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                  : "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]"
              }
            >
              {isXlAvailable ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
