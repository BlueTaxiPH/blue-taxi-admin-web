import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { fetchDriverById, fetchDriverDocuments, fetchCities } from "@/lib/supabase/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DriverAvatarUpload } from "@/containers/driver-detail/DriverAvatarUpload"
import { EditDriverForm } from "@/containers/driver-detail/EditDriverForm"
import { DOCUMENT_TYPE_LABELS, getDocumentLabel } from "@/lib/document-types"
import { UploadDocumentButton } from "@/containers/driver-detail/UploadDocumentButton"
import { ResendInviteButton } from "@/containers/driver-detail/ResendInviteButton"

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let data
  try {
    data = await fetchDriverById(id)
  } catch {
    notFound()
  }

  const { driver, raw, avgRating, recentRides } = data

  let documents: Awaited<ReturnType<typeof fetchDriverDocuments>> = []
  let cities: Awaited<ReturnType<typeof fetchCities>> = []
  try {
    documents = await fetchDriverDocuments(id)
  } catch {
    // Documents table may not exist yet — fail gracefully
  }
  try {
    cities = await fetchCities()
  } catch {
    // Cities table may not exist yet
  }

  const primaryVehicle = raw.vehicles?.[0] ?? null
  const driverFormData = {
    driverProfileId: raw.id,
    userId: raw.user_id,
    firstName: (raw.users as any)?.first_name ?? '',
    lastName: (raw.users as any)?.last_name ?? '',
    email: (raw.users as any)?.email ?? '',
    phone: (raw.users as any)?.phone ?? '',
    cityId: raw.city_id,
    cityName: raw.cities?.name ?? '',
    vehicleId: primaryVehicle ? (primaryVehicle as any).id ?? null : null,
    vehicleMake: primaryVehicle?.make ?? '',
    vehicleModel: primaryVehicle?.model ?? '',
    vehiclePlateNumber: primaryVehicle?.plate_number ?? '',
    vehicleColor: (primaryVehicle as any)?.color ?? '',
    vehicleType: (primaryVehicle?.type === 'xl' ? 'xl' : 'basic') as 'basic' | 'xl',
    verificationStatus: raw.verification_status,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/drivers">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to drivers</span>
          </Link>
        </Button>
        <DriverAvatarUpload
          driverId={id}
          userId={raw.user_id}
          currentPhotoUrl={(raw.users as any)?.photo_url ?? null}
          driverName={driver.name}
        />
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
        <ResendInviteButton email={(raw.users as any)?.email ?? ''} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Profile — inline editable */}
        <EditDriverForm driver={driverFormData} cities={cities} />

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

      <div className="rounded-xl border bg-card p-6 col-span-2">
        <h3 className="text-lg font-semibold mb-4">Documents</h3>
        <div className="space-y-3">
          {Object.keys(DOCUMENT_TYPE_LABELS).map((docType) => {
            const existingDoc = documents.find((d: any) => d.document_type === docType);
            return (
              <div key={docType} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{getDocumentLabel(docType)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {existingDoc
                      ? `Uploaded ${new Date(existingDoc.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Not uploaded'}
                  </p>
                  {existingDoc?.rejection_reason ? (
                    <p className="text-xs text-red-600 mt-1">Reason: {existingDoc.rejection_reason}</p>
                  ) : null}
                  {existingDoc?.file_url ? (
                    <a href={existingDoc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                      View file
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {existingDoc ? (
                    existingDoc.is_verified ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Verified</span>
                    ) : existingDoc.rejection_reason ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Rejected</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Pending</span>
                    )
                  ) : null}
                  <UploadDocumentButton
                    driverId={id}
                    documentType={docType}
                    hasExisting={!!existingDoc}
                  />
                </div>
              </div>
            );
          })}
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
