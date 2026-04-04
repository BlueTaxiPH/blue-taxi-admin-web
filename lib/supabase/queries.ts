import { createAdminClient } from "./admin-client"
import { createClient } from "./server"
import type { Driver } from "@/types/driver"
import type { DashboardMetrics } from "@/types/dashboard"

export interface DriverRow {
  id: string
  user_id: string
  verification_status: string
  is_online: boolean
  avg_rating: number
  total_rides: number
  created_at: string
  users: {
    first_name: string | null
    last_name: string | null
    phone: string | null
    email: string | null
    photo_url: string | null
  } | null
  vehicles: Array<{
    make: string | null
    model: string | null
    plate_number: string | null
    type: string | null
  }>
}

function mapVerificationToDocStatus(status: string): Driver["docStatus"] {
  switch (status) {
    case "approved": return "Verified"
    case "pending": return "Pending"
    case "under_review": return "Pending"
    case "rejected": return "Expired"
    case "suspended": return "Expired"
    default: return "Pending"
  }
}

function mapDriverRowToDriver(row: DriverRow): Driver {
  const firstName = row.users?.first_name ?? ""
  const lastName = row.users?.last_name ?? ""
  const name = [firstName, lastName].filter(Boolean).join(" ") || "Unknown"
  const phone = row.users?.phone ?? row.users?.email ?? ""

  let status: Driver["status"] = "Active"
  if (row.verification_status === "suspended") status = "Suspended"
  else if (row.verification_status !== "approved") status = "Inactive"

  const primaryVehicle = row.vehicles?.[0]
  let serviceType: Driver["serviceType"] = "Standard"
  const vt = primaryVehicle?.type ?? ""
  if (vt === "xl") serviceType = "Van"

  return {
    id: row.id.slice(0, 8).toUpperCase(),
    name,
    phone,
    city: "",
    serviceType,
    status,
    docStatus: mapVerificationToDocStatus(row.verification_status),
    rating: Number(row.avg_rating) || 0,
    supabaseId: row.id,
  }
}

export async function fetchDrivers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("driver_profiles")
    .select(`
      id, user_id, verification_status, is_online, avg_rating, total_rides, created_at,
      users!user_id(first_name, last_name, phone, email, photo_url),
      vehicles(make, model, plate_number, type)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDriverRowToDriver(row as unknown as DriverRow))
}

/**
 * Fetches all drivers using the admin client (bypasses RLS).
 * Use only on the admin dashboard so the list always shows all drivers.
 */
export async function fetchDriversForAdmin() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("driver_profiles")
    .select(`
      id, user_id, verification_status, is_online, avg_rating, total_rides, created_at,
      users!user_id(first_name, last_name, phone, email, photo_url),
      vehicles(make, model, plate_number, type)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDriverRowToDriver(row as unknown as DriverRow))
}

export async function fetchDriverById(supabaseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("driver_profiles")
    .select(`
      id, user_id, verification_status, is_online, avg_rating, total_rides, created_at,
      users!user_id(first_name, last_name, phone, email, photo_url),
      vehicles(make, model, plate_number, type)
    `)
    .eq("id", supabaseId)
    .single()

  if (error) throw error

  const driverUserId = (data as unknown as DriverRow).user_id
  const { data: ratingsData } = await supabase
    .from("ride_ratings")
    .select("rating")
    .eq("ratee_id", driverUserId)

  const ratings = (ratingsData ?? []).map((r: { rating: number }) => r.rating)
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0

  const { data: ridesData } = await supabase
    .from("rides")
    .select("id, status, final_fare, estimated_fare, created_at, trip_completed_at, pickup_address, dropoff_address")
    .eq("driver_id", driverUserId)
    .order("created_at", { ascending: false })
    .limit(10)

  return {
    driver: mapDriverRowToDriver(data as unknown as DriverRow),
    raw: data as unknown as DriverRow,
    avgRating: Math.round(avgRating * 10) / 10,
    recentRides: (ridesData ?? []) as Array<{
      id: string
      status: string
      final_fare: number | null
      estimated_fare: number | null
      created_at: string
      trip_completed_at: string | null
      pickup_address: string | null
      dropoff_address: string | null
    }>,
  }
}

export async function fetchRides() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("rides")
    .select(`
      id, status, final_fare, estimated_fare, pickup_address, dropoff_address,
      created_at, trip_completed_at,
      passenger:users!rides_passenger_id_fkey(first_name, last_name, phone),
      driver:users!rides_driver_id_fkey(first_name, last_name, phone)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

export async function fetchPayouts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("driver_payouts")
    .select(`
      id, driver_id, total_amount, status, created_at, processed_at,
      driver_profiles(
        id,
        users(first_name, last_name, phone)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

export async function fetchActivePlatformFee() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("platform_fees")
    .select("id, fee_amount, label, is_active, created_by, created_at, updated_at")
    .eq("is_active", true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchPlatformFeeHistory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("platform_fees")
    .select("id, fee_amount, label, is_active, created_by, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(20)
  if (error) throw error
  return data ?? []
}

export async function fetchDriverDocuments(driverProfileId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("driver_documents")
    .select("id, document_type, file_url, is_verified, verified_by, verified_at, rejection_reason, created_at, updated_at")
    .eq("driver_id", driverProfileId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    onlineRes,
    activeRes,
    pendingRes,
    completedRes,
    revenueRes,
    totalRes,
  ] = await Promise.all([
    supabase
      .from("driver_profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_online", true),
    supabase
      .from("rides")
      .select("id", { count: "exact", head: true })
      .in("status", [
        "navigating_to_pickup",
        "arrived_at_pickup",
        "waiting_for_passenger",
        "trip_in_progress",
      ]),
    supabase
      .from("rides")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("rides")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("trip_completed_at", todayStart.toISOString()),
    supabase
      .from("rides")
      .select("final_fare")
      .eq("status", "completed")
      .gte("trip_completed_at", todayStart.toISOString()),
    supabase
      .from("driver_profiles")
      .select("id", { count: "exact", head: true }),
  ])

  const revenueToday = (revenueRes.data ?? []).reduce(
    (sum: number, r: { final_fare: number | null }) => sum + (r.final_fare ?? 0),
    0
  )

  return {
    onlineDrivers: onlineRes.count ?? 0,
    activeTrips: activeRes.count ?? 0,
    pendingBookings: pendingRes.count ?? 0,
    completedToday: completedRes.count ?? 0,
    revenueToday,
    totalDrivers: totalRes.count ?? 0,
  }
}

export async function fetchPassengers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select(`
      id, first_name, last_name, email, phone, created_at,
      passenger_profiles(id, total_rides, avg_rating)
    `)
    .eq("role", "passenger")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchPassengerById(userId: string) {
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase
    .from("users")
    .select(`
      id, first_name, last_name, email, phone, photo_url, created_at,
      passenger_profiles(id, total_rides, avg_rating)
    `)
    .eq("id", userId)
    .eq("role", "passenger")
    .single()

  if (userError) throw userError

  const { data: rides, error: ridesError } = await supabase
    .from("rides")
    .select(`
      id, status, pickup_address, dropoff_address, final_fare, platform_fee,
      created_at, trip_completed_at,
      driver:users!rides_driver_id_fkey(first_name, last_name)
    `)
    .eq("passenger_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (ridesError) throw ridesError

  return { user, rides: rides ?? [] }
}
