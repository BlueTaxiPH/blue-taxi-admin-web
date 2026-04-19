import { LandingNav } from "./LandingNav"
import { HeroSection } from "./HeroSection"
import { CapabilitiesSection } from "./CapabilitiesSection"
import { PilotBand } from "./PilotBand"
import { CTASection } from "./CTASection"
import { LandingFooter } from "./LandingFooter"

interface LandingPageProps {
  cities: string[]
}

export function LandingPage({ cities }: LandingPageProps) {
  return (
    <div className="landing-canvas relative min-h-[100dvh] overflow-hidden">
      <div className="landing-mesh landing-drift" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <LandingNav />

      <main className="relative">
        <HeroSection cities={cities} />
        <CapabilitiesSection />
        <PilotBand cities={cities} />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  )
}
