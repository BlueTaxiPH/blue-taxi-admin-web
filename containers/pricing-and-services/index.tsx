import { PricingAndServicesPage } from "./PricingAndServicesPage"
import type { PlatformFee } from "@/types/platform-fee"

interface PricingAndServicesSectionProps {
  activeFee: PlatformFee | null;
  feeHistory: PlatformFee[];
}

export default function PricingAndServicesSection({
  activeFee,
  feeHistory,
}: PricingAndServicesSectionProps) {
  return <PricingAndServicesPage activeFee={activeFee} feeHistory={feeHistory} />
}
