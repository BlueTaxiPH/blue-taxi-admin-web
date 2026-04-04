"use client"

import { useState } from "react"
import { PricingAndServicesHeader } from "./PricingAndServicesHeader"
import { ServiceAvailabilityCard } from "./ServiceAvailabilityCard"
import { ActivePricingRuleEditorCard } from "./ActivePricingRuleEditorCard"
import { VersionHistoryCard } from "./VersionHistoryCard"
import type { PlatformFee } from "@/types/platform-fee"

interface PricingAndServicesPageProps {
  activeFee: PlatformFee | null;
  feeHistory: PlatformFee[];
}

export function PricingAndServicesPage({ activeFee, feeHistory }: PricingAndServicesPageProps) {
  const [city, setCity] = useState("metro-manila")
  const [isBlueBasicEnabled, setBlueBasicEnabled] = useState(true)
  const [isBlueXlEnabled, setBlueXlEnabled] = useState(true)
  const [isDynamicSurgeEnabled, setDynamicSurgeEnabled] = useState(true)

  return (
    <div>
      <PricingAndServicesHeader city={city} onCityChange={setCity} />

      <main className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <ServiceAvailabilityCard
            isBlueBasicEnabled={isBlueBasicEnabled}
            onBlueBasicChange={setBlueBasicEnabled}
            isBlueXlEnabled={isBlueXlEnabled}
            onBlueXlChange={setBlueXlEnabled}
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
