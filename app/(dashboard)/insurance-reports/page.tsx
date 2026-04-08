export const dynamic = "force-dynamic"

import { fetchCompletedRides, fetchActivePlatformFee } from "@/lib/supabase/queries"
import { InsuranceReportsPage } from "@/containers/insurance-reports"

export default async function InsuranceReportsRoutePage() {
  let rides: Awaited<ReturnType<typeof fetchCompletedRides>> = []
  let insuranceAmount = 0
  let feeLabel = "BlueShield Daily"

  try {
    rides = await fetchCompletedRides()
  } catch (err) {
    console.error("[InsuranceReports] rides fetch error:", err)
  }
  try {
    const fee = await fetchActivePlatformFee()
    if (fee) {
      insuranceAmount = Number(fee.insurance_amount)
      feeLabel = fee.label ?? feeLabel
    }
  } catch (err) {
    console.error("[InsuranceReports] fee fetch error:", err)
  }

  return (
    <InsuranceReportsPage
      rides={rides}
      insuranceAmount={insuranceAmount}
      feeLabel={feeLabel}
    />
  )
}
