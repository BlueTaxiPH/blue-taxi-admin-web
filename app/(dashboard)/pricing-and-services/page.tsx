import { fetchActivePlatformFee, fetchPlatformFeeHistory } from "@/lib/supabase/queries";
import PricingAndServicesSection from "@/containers/pricing-and-services";

export const dynamic = "force-dynamic";

export default async function PricingAndServicesRoutePage() {
  const [activeFee, feeHistory] = await Promise.all([
    fetchActivePlatformFee(),
    fetchPlatformFeeHistory(),
  ]);

  return (
    <PricingAndServicesSection
      activeFee={activeFee}
      feeHistory={feeHistory}
    />
  );
}
