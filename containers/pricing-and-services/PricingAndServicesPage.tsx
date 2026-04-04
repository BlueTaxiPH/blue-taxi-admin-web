"use client"

import { useState, useEffect } from "react"
import { PricingAndServicesHeader } from "./PricingAndServicesHeader"
import { ServiceAvailabilityCard } from "./ServiceAvailabilityCard"
import { ActivePricingRuleEditorCard } from "./ActivePricingRuleEditorCard"
import { VersionHistoryCard } from "./VersionHistoryCard"
import { createClient } from "@/lib/supabase/client"
import type { PlatformFee } from "@/types/platform-fee"

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
}

export function PricingAndServicesPage({ activeFee, feeHistory, cities }: PricingAndServicesPageProps) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? "")
  const [cityServices, setCityServices] = useState<CityService[]>([])
  const [isDynamicSurgeEnabled, setDynamicSurgeEnabled] = useState(true)

  useEffect(() => {
    if (!selectedCityId) return

    const supabase = createClient()
    supabase
      .from("city_services")
      .select("id, city_id, vehicle_type, is_available")
      .eq("city_id", selectedCityId)
      .then(({ data }) => {
        setCityServices(data ?? [])
      })
  }, [selectedCityId])

  const isBasicAvailable = cityServices.find((s) => s.vehicle_type === "basic")?.is_available ?? true
  const isXlAvailable = cityServices.find((s) => s.vehicle_type === "xl")?.is_available ?? true

  return (
    <div>
      <PricingAndServicesHeader
        cities={cities}
        selectedCityId={selectedCityId}
        onCityChange={setSelectedCityId}
      />

      <main className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <ServiceAvailabilityCard
            cityId={selectedCityId}
            isBasicAvailable={isBasicAvailable}
            isXlAvailable={isXlAvailable}
            onServiceUpdated={() => {
              const supabase = createClient()
              supabase
                .from("city_services")
                .select("id, city_id, vehicle_type, is_available")
                .eq("city_id", selectedCityId)
                .then(({ data }) => {
                  setCityServices(data ?? [])
                })
            }}
          />

          <ActivePricingRuleEditorCard
            isDynamicSurgeEnabled={isDynamicSurgeEnabled}
            onDynamicSurgeChange={setDynamicSurgeEnabled}
            activeFee={activeFee}
          />
        </section>

        <aside>
          <VersionHistoryCard feeHistory={feeHistory} />
        </aside>
      </main>
    </div>
  )
}
