export interface PassengerProfile {
  id: string
  total_rides: number | null
  avg_rating: number | null
}

export interface PassengerUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  photo_url: string | null
  created_at: string
  passenger_profiles: PassengerProfile[] | PassengerProfile | null
}

export interface DriverRef {
  first_name: string | null
  last_name: string | null
}

export interface PassengerRide {
  id: string
  status: string
  pickup_address: string | null
  dropoff_address: string | null
  final_fare: number | null
  platform_fee: number | null
  created_at: string
  trip_completed_at: string | null
  driver: DriverRef[] | DriverRef | null
}
