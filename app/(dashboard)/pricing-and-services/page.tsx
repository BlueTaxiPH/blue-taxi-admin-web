import { fetchActivePlatformFee, fetchPlatformFeeHistory, fetchCitiesWithCoords, fetchFareConfig } from "@/lib/supabase/queries";
import PricingAndServicesSection from "@/containers/pricing-and-services";

export const dynamic = "force-dynamic";

export default async function PricingAndServicesRoutePage() {
  const [activeFee, feeHistory, cities, fareConfig] = await Promise.all([
    fetchActivePlatformFee(),
    fetchPlatformFeeHistory(),
    fetchCitiesWithCoords(),
    fetchFareConfig(),
  ]);

  return (
    <PricingAndServicesSection
      activeFee={activeFee}
      feeHistory={feeHistory}
      cities={cities}
      fareConfig={fareConfig}
    />
  );
}
