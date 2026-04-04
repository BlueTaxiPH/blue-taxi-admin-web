import { PricingAndServicesPage } from "./PricingAndServicesPage"
import type { PlatformFee } from "@/types/platform-fee"
import type { FareConfig } from "@/lib/supabase/queries"

interface City {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

interface PricingAndServicesSectionProps {
  activeFee: PlatformFee | null;
  feeHistory: PlatformFee[];
  cities: City[];
  fareConfig: FareConfig | null;
}

export default function PricingAndServicesSection({
  activeFee,
  feeHistory,
  cities,
  fareConfig,
}: PricingAndServicesSectionProps) {
  return (
    <PricingAndServicesPage
      activeFee={activeFee}
      feeHistory={feeHistory}
      cities={cities}
      fareConfig={fareConfig}
    />
  )
}
