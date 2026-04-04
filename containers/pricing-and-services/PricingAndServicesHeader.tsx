"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface City {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

interface PricingAndServicesHeaderProps {
  cities: City[];
  selectedCityId: string;
  onCityChange: (value: string) => void;
}

export function PricingAndServicesHeader({
  cities,
  selectedCityId,
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
        <Select value={selectedCityId} onValueChange={onCityChange}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>
    </header>
  )
}
