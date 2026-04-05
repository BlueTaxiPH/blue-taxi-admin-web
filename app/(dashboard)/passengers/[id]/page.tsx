import { fetchPassengerById } from "@/lib/supabase/queries"
import { PassengerProfileSection } from "@/containers/passenger-profile"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PassengerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const { user, rides } = await fetchPassengerById(id)
    return <PassengerProfileSection user={user} rides={rides} />
  } catch {
    notFound()
  }
}
