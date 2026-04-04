import { PricingAndServicesPage } from "./PricingAndServicesPage"
import type { PlatformFee } from "@/types/platform-fee"

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
}

export default function PricingAndServicesSection({
  activeFee,
  feeHistory,
  cities,
}: PricingAndServicesSectionProps) {
  return <PricingAndServicesPage activeFee={activeFee} feeHistory={feeHistory} cities={cities} />
}
