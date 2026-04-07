"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ServiceAvailabilityCard } from "./ServiceAvailabilityCard"
import { ActivePricingRuleEditorCard } from "./ActivePricingRuleEditorCard"
import { FareConfigCard } from "./FareConfigCard"
import { VersionHistoryCard } from "./VersionHistoryCard"
import { CityManagementCard } from "./CityManagementCard"
import { fetchCityServicesAction } from "@/app/actions/fetch-city-services"
import type { PlatformFee } from "@/types/platform-fee"
import type { FareConfig } from "@/lib/supabase/queries"

interface City {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

interface CityService {
  id: string;
  city_id: string;
  vehicle_type: string;
  is_available: boolean;
}

interface PricingAndServicesPageProps {
  activeFee: PlatformFee | null;
  feeHistory: PlatformFee[];
  cities: City[];
  fareConfig: FareConfig | null;
}

export function PricingAndServicesPage({ activeFee, feeHistory, cities, fareConfig }: PricingAndServicesPageProps) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? "")
  const [cityServices, setCityServices] = useState<CityService[]>([])

  useEffect(() => {
    if (!selectedCityId) return

    fetchCityServicesAction(selectedCityId).then((data) => {
      setCityServices(data ?? [])
    })
  }, [selectedCityId])

  const isBasicAvailable = cityServices.find((s) => s.vehicle_type === "basic")?.is_available ?? true
  const isXlAvailable = cityServices.find((s) => s.vehicle_type === "xl")?.is_available ?? true

  return (
    <div>
      <PageHeader
        title="Pricing & Services"
        subtitle="Configure fares, cities, and service availability"
        breadcrumbs={["Business", "Pricing & Services"]}
        actions={
          <Select value={selectedCityId} onValueChange={setSelectedCityId}>
            <SelectTrigger className="w-[170px]">
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
        }
      />

      <main className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <ServiceAvailabilityCard
            cityId={selectedCityId}
            isBasicAvailable={isBasicAvailable}
            isXlAvailable={isXlAvailable}
            onServiceUpdated={() => {
              fetchCityServicesAction(selectedCityId).then((data) => {
                setCityServices(data ?? [])
              })
            }}
          />

          <ActivePricingRuleEditorCard
            activeFee={activeFee}
          />

          <FareConfigCard fareConfig={fareConfig} />
        </section>

        <aside className="space-y-6">
          <VersionHistoryCard feeHistory={feeHistory} />
          <CityManagementCard cities={cities} />
        </aside>
      </main>
    </div>
  )
}
