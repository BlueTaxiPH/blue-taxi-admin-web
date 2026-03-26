"use client"

import { useState } from "react"
import { PricingAndServicesHeader } from "./PricingAndServicesHeader"
import { ServiceAvailabilityCard } from "./ServiceAvailabilityCard"
import { ActivePricingRuleEditorCard } from "./ActivePricingRuleEditorCard"
import { VersionHistoryCard } from "./VersionHistoryCard"

export function PricingAndServicesPage() {
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
          />
        </section>

        <aside>
          <VersionHistoryCard />
        </aside>
      </main>
    </div>
  )
}
