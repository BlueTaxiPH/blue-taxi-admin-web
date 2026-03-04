import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Star, Car, Phone, User } from "lucide-react"
import { fetchDriverById } from "@/lib/supabase/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApproveDriverButton } from "@/containers/driver-detail/ApproveDriverButton"

export default async function DriverDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let data
  try {
    data = await fetchDriverById(params.id)
  } catch {
    notFound()
  }

  const { driver, raw, avgRating, recentRides } = data

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/drivers">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to drivers</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">{driver.name}</h1>
        <Badge
          variant="secondary"
          className={
            driver.status === "Active"
              ? "bg-emerald-100 text-emerald-800"
              : driver.status === "Suspended"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
          }
        >
          {driver.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Profile */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
            Driver Profile
          </h2>
          <InfoRow icon={<User className="size-4" />} label="Full Name" value={driver.name} />
          <InfoRow icon={<Phone className="size-4" />} label="Phone" value={driver.phone || "—"} />
          <InfoRow
            icon={<Car className="size-4" />}
            label="Vehicle"
            value={
              raw.vehicles?.[0]
                ? `${raw.vehicles[0].make ?? ""} ${raw.vehicles[0].model ?? ""} · ${raw.vehicles[0].plate_number ?? ""}`.trim()
                : "—"
            }
          />
          <InfoRow
            icon={<Star className="size-4 fill-amber-400 text-amber-400" />}
            label="Avg Rating"
            value={avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : "No ratings yet"}
          />
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-1">Verification Status</p>
            <Badge
              variant="secondary"
              className={
                raw.verification_status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : raw.verification_status === "pending" || raw.verification_status === "under_review"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {raw.verification_status}
            </Badge>
          </div>
          {(raw.verification_status === "pending" || raw.verification_status === "under_review") && (
            <ApproveDriverButton driverId={params.id} />
          )}
        </div>

        {/* Recent Rides */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
            Recent Rides
          </h2>
          {recentRides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rides yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {ride.pickup_address ?? "Pickup"} → {ride.dropoff_address ?? "Dropoff"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ride.trip_completed_at ?? ride.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    {ride.final_fare != null
                      ? `₱${Number(ride.final_fare).toFixed(0)}`
                      : ride.estimated_fare != null
                        ? `₱${Number(ride.estimated_fare).toFixed(0)}`
                        : "—"}
                  </p>
                    <Badge
                      variant="secondary"
                      className={
                        ride.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 text-xs"
                          : "bg-red-100 text-red-800 text-xs"
                      }
                    >
                      {ride.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
