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
  city_id: string | null
  cities: { name: string } | null
  driver_documents: Array<{ is_verified: boolean; rejection_reason: string | null }>
}

function computeDocStatus(docs: Array<{ is_verified: boolean; rejection_reason: string | null }> | null): Driver["docStatus"] {
  if (!docs || docs.length === 0) return "No Docs"
  if (docs.some(d => d.rejection_reason !== null && !d.is_verified)) return "Rejected"
  if (docs.every(d => d.is_verified)) return "Verified"
  return "Pending"
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
  const vt = primaryVehicle?.type ?? ""
  const serviceType: Driver["serviceType"] = vt === "xl" ? "XL" : "Basic"

  return {
    id: row.id.slice(0, 8).toUpperCase(),
    name,
    phone,
    city: row.cities?.name ?? "",
    serviceType,
    status,
    docStatus: computeDocStatus(row.driver_documents),
    rating: Number(row.avg_rating) || 0,
    photoUrl: row.users?.photo_url ?? null,
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
      vehicles(make, model, plate_number, type),
      cities(name),
      driver_documents(is_verified, rejection_reason)
    `)
    .order("created_at", { ascending: false })
    .limit(500)

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
      vehicles(make, model, plate_number, type),
      cities(name),
      driver_documents(is_verified, rejection_reason)
    `)
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) throw error
  return (data ?? []).map((row) => mapDriverRowToDriver(row as unknown as DriverRow))
}

export async function fetchDriverById(supabaseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("driver_profiles")
    .select(`
      id, user_id, verification_status, is_online, avg_rating, total_rides, created_at, city_id,
      users!user_id(first_name, last_name, phone, email, photo_url),
      vehicles(id, make, model, plate_number, color, type),
      cities(name),
      driver_documents(is_verified, rejection_reason)
    `)
    .eq("id", supabaseId)
    .single()

  if (error) throw error

  const driverUserId = (data as unknown as DriverRow).user_id

  const { data: ridesData } = await supabase
    .from("rides")
    .select("id, status, final_fare, estimated_fare, created_at, trip_completed_at, pickup_address, dropoff_address")
    .eq("driver_id", driverUserId)
    .order("created_at", { ascending: false })

  return {
    driver: mapDriverRowToDriver(data as unknown as DriverRow),
    raw: data as unknown as DriverRow,
    avgRating: Math.round(Number((data as unknown as DriverRow).avg_rating) * 10) / 10,
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

export async function fetchCompletedRides() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("rides")
    .select(`
      id, status, final_fare, estimated_fare, platform_fee,
      pickup_address, dropoff_address, created_at, trip_completed_at,
      passenger:users!rides_passenger_id_fkey(first_name, last_name),
      driver:users!rides_driver_id_fkey(first_name, last_name)
    `)
    .eq("status", "completed")
    .order("trip_completed_at", { ascending: false })
    .limit(500)

  if (error) throw error
  return data ?? []
}

export interface PayoutSummary {
  id: string
  driver_id: string | null
  total_amount: number | string | null
  status: string
  created_at: string
  processed_at: string | null
  driver_profiles: {
    id: string
    users: {
      first_name: string | null
      last_name: string | null
      phone: string | null
    } | null
  } | null
}

export async function fetchPayouts(): Promise<PayoutSummary[]> {
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

  type Raw = {
    id: string
    driver_id: string | null
    total_amount: number | string | null
    status: string
    created_at: string
    processed_at: string | null
    driver_profiles:
      | Array<{
          id: string
          users:
            | Array<{ first_name: string | null; last_name: string | null; phone: string | null }>
            | { first_name: string | null; last_name: string | null; phone: string | null }
            | null
        }>
      | { id: string; users: unknown } | null
  }

  return ((data ?? []) as unknown as Raw[]).map((row) => {
    const profileRaw = Array.isArray(row.driver_profiles)
      ? row.driver_profiles[0] ?? null
      : row.driver_profiles
    const userRaw = profileRaw
      ? (Array.isArray((profileRaw as { users: unknown }).users)
          ? ((profileRaw as { users: Array<{ first_name: string | null; last_name: string | null; phone: string | null }> }).users[0] ?? null)
          : ((profileRaw as { users: { first_name: string | null; last_name: string | null; phone: string | null } | null }).users ?? null))
      : null
    return {
      id: row.id,
      driver_id: row.driver_id,
      total_amount: row.total_amount,
      status: row.status,
      created_at: row.created_at,
      processed_at: row.processed_at,
      driver_profiles: profileRaw
        ? {
            id: (profileRaw as { id: string }).id,
            users: userRaw,
          }
        : null,
    }
  })
}

export interface PayoutMetrics {
  totalPending: number
  paidThisMonth: number
  avgPaidThisMonth: number
  successRate: number
  successRateDenominator: number
}

export async function fetchPayoutMetrics(): Promise<PayoutMetrics> {
  const supabase = await createClient()
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [pendingRes, paidMonthRes, resolvedRes] = await Promise.all([
    supabase
      .from("driver_payouts")
      .select("total_amount")
      .eq("status", "pending")
      .limit(10000),
    supabase
      .from("driver_payouts")
      .select("total_amount")
      .eq("status", "paid")
      .gte("processed_at", monthStart.toISOString())
      .limit(10000),
    supabase
      .from("driver_payouts")
      .select("status")
      .in("status", ["paid", "failed"])
      .limit(10000),
  ])

  const totalPending = (pendingRes.data ?? []).reduce(
    (sum: number, r: { total_amount: number | null }) => sum + Number(r.total_amount ?? 0),
    0,
  )
  const paidAmounts = (paidMonthRes.data ?? []).map(
    (r: { total_amount: number | null }) => Number(r.total_amount ?? 0),
  )
  const paidThisMonth = paidAmounts.reduce((sum, n) => sum + n, 0)
  const avgPaidThisMonth = paidAmounts.length > 0 ? paidThisMonth / paidAmounts.length : 0

  const resolved = resolvedRes.data ?? []
  const successRateDenominator = resolved.length
  const successCount = resolved.filter(
    (r: { status: string }) => r.status === "paid",
  ).length
  const successRate = successRateDenominator > 0 ? successCount / successRateDenominator : 0

  return { totalPending, paidThisMonth, avgPaidThisMonth, successRate, successRateDenominator }
}

export interface ApprovedDriverOption {
  id: string
  name: string
  phone: string | null
}

export async function fetchApprovedDriversForPayout(): Promise<ApprovedDriverOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("driver_profiles")
    .select(`
      id,
      users!user_id(first_name, last_name, phone)
    `)
    .eq("verification_status", "approved")
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) throw error

  return (data ?? []).map((row) => {
    const u = (row as unknown as { users: { first_name: string | null; last_name: string | null; phone: string | null } | null }).users
    const first = u?.first_name ?? ""
    const last = u?.last_name ?? ""
    const name = [first, last].filter(Boolean).join(" ") || "Unknown driver"
    return { id: (row as { id: string }).id, name, phone: u?.phone ?? null }
  })
}

export async function fetchActivePlatformFee() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("platform_fees")
    .select("id, fee_amount, insurance_amount, label, is_active, created_by, created_at, updated_at")
    .eq("is_active", true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchPlatformFeeHistory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("platform_fees")
    .select(`
      id, fee_amount, insurance_amount, label, is_active, created_by, created_at, updated_at,
      changed_by:users!platform_fees_created_by_fkey(first_name, last_name)
    `)
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
    .limit(100)

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
    activeRideStatusRes,
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
      .gte("trip_completed_at", todayStart.toISOString())
      .limit(10000),
    supabase
      .from("driver_profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("rides")
      .select("status")
      .in("status", [
        "pending", "accepted", "navigating_to_pickup", "arrived_at_pickup",
        "waiting_for_passenger", "trip_in_progress", "dropped_off",
        "input_fare", "fare_confirmed",
      ]),
  ])

  const tripsByStatus: Record<string, number> = {}
  for (const row of activeRideStatusRes.data ?? []) {
    tripsByStatus[row.status] = (tripsByStatus[row.status] ?? 0) + 1
  }

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
    tripsByStatus,
  }
}

export async function fetchPassengers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select(`
      id, first_name, last_name, email, phone, created_at, is_active,
      passenger_profiles(id, total_rides, avg_rating)
    `)
    .eq("role", "passenger")
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) throw error
  return data ?? []
}

export async function fetchPassengerById(userId: string) {
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase
    .from("users")
    .select(`
      id, first_name, last_name, email, phone, photo_url, created_at, is_active,
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

export async function fetchCities() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })
  if (error) throw error
  return data ?? []
}

// Public landing page helper. Uses admin client because the visitor is unauthenticated
// and the cities list is non-sensitive public info (names only).
export async function fetchActiveCityNamesForLanding(): Promise<string[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("cities")
    .select("name")
    .eq("is_active", true)
    .order("name", { ascending: true })
  if (error) throw error
  return (data ?? [])
    .map((row: { name: string | null }) => (row.name ?? "").trim())
    .filter((name): name is string => name.length > 0)
}

export async function fetchCityServices(cityId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("city_services")
    .select("id, city_id, vehicle_type, is_available")
    .eq("city_id", cityId)
  if (error) throw error
  return data ?? []
}

export async function fetchCitiesWithCoords() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, latitude, longitude, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })
  if (error) throw error
  return data ?? []
}

export interface FareConfig {
  id: string
  base_fare: number
  per_km_rate: number
  per_minute_rate: number
  surge_enabled: boolean
  surge_multiplier: number
  updated_at: string
  updated_by: string | null
}

export async function fetchFareConfig(): Promise<FareConfig | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("fare_config")
    .select("*")
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as FareConfig | null
}
