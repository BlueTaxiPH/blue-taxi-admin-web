import { LandingPage } from "@/containers/landing"
import { fetchActiveCityNamesForLanding } from "@/lib/supabase/queries"

export const revalidate = 3600 // 1 hour ISR — city list changes rarely

export default async function Home() {
  let cities: string[] = []
  try {
    cities = await fetchActiveCityNamesForLanding()
  } catch (err) {
    console.error("[Landing] fetchActiveCityNamesForLanding failed:", err)
  }

  return <LandingPage cities={cities} />
}
