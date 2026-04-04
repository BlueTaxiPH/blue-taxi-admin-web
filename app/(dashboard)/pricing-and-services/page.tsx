import { fetchActivePlatformFee, fetchPlatformFeeHistory, fetchCitiesWithCoords } from "@/lib/supabase/queries";
import PricingAndServicesSection from "@/containers/pricing-and-services";

export const dynamic = "force-dynamic";

export default async function PricingAndServicesRoutePage() {
  const [activeFee, feeHistory, cities] = await Promise.all([
    fetchActivePlatformFee(),
    fetchPlatformFeeHistory(),
    fetchCitiesWithCoords(),
  ]);

  return (
    <PricingAndServicesSection
      activeFee={activeFee}
      feeHistory={feeHistory}
      cities={cities}
    />
  );
}
