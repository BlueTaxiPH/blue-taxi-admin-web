"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, ScreenShare } from "lucide-react"

interface PricingAndServicesHeaderProps {
  city: string
  onCityChange: (value: string) => void
}

export function PricingAndServicesHeader({
  city,
  onCityChange,
}: PricingAndServicesHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Pricing &amp; Services Configuration
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage fare rules and service availability
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={city} onValueChange={onCityChange}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metro-manila">Metro Manila</SelectItem>
            <SelectItem value="cebu-city">Cebu City</SelectItem>
            <SelectItem value="davao-city">Davao City</SelectItem>
          </SelectContent>
        </Select>

        <Button>
          <Save className="size-4" />
          Save Changes
        </Button>
      </div>
    </header>
  )
}
