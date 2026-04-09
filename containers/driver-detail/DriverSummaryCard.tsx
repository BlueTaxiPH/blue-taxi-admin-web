"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Phone, MapPin, Car, Star, Camera } from "lucide-react"
import { uploadDriverAvatar } from "@/app/actions/upload-driver-avatar"
import { compressImage, isCompressibleImage } from "@/lib/compress-image"

interface DriverSummaryCardProps {
  driverId: string
  userId: string
  driverName: string
  email: string | null
  phone: string | null
  photoUrl: string | null
  isOnline: boolean
  avgRating: number
  totalRides: number
  createdAt: string
  verificationStatus: string
  vehicle: {
    make: string | null
    model: string | null
    plate_number: string | null
    color?: string | null
    type: string | null
  } | null
  city: string
}

export function DriverSummaryCard({
  driverId,
  userId,
  driverName,
  email,
  phone,
  photoUrl,
  isOnline,
  avgRating,
  totalRides,
  createdAt,
  verificationStatus,
  vehicle,
  city,
}: DriverSummaryCardProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const ringColor =
    verificationStatus === "approved"
      ? "ring-[#1A56DB]"
      : verificationStatus === "suspended"
        ? "ring-[#DC2626]"
        : "ring-[#F59E0B]"

  const memberSince = new Date(createdAt).toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  })

  const vehicleLabel = vehicle?.make || vehicle?.model
    ? `${vehicle.color ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim()
    : null
  const vehiclePlate = vehicle?.plate_number ?? null
  const vehicleType = vehicle?.type === "xl" ? "XL" : "Basic"

  const initials = driverName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setIsUploading(true)

    try {
      let processedFile = file
      if (isCompressibleImage(file)) {
        processedFile = await compressImage(file)
      }
      const formData = new FormData()
      formData.append("file", processedFile)
      const result = await uploadDriverAvatar(driverId, userId, formData)
      if (result.success) {
        router.refresh()
      } else {
        setUploadError(result.error)
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      {/* Avatar + Name + Online Status */}
      <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-4">
        <div className="group relative">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={driverName}
              className={`size-20 rounded-full object-cover ring-2 ring-offset-2 ${ringColor}`}
            />
          ) : (
            <div
              className={`flex size-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-700 ring-2 ring-offset-2 ${ringColor}`}
              aria-hidden
            >
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors hover:bg-black/40 cursor-pointer"
            aria-label="Upload photo"
          >
            <Camera
              className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {uploadError ? (
          <p className="text-xs text-[#DC2626]">{uploadError}</p>
        ) : null}
        {isUploading ? (
          <p className="text-xs text-[#8BACC8]">Uploading...</p>
        ) : null}
        <div className="text-center">
          <h2
            className="text-xl font-bold text-[#0D1B2A]"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            {driverName}
          </h2>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#8BACC8]">
            <span
              className={`size-2 rounded-full ${isOnline ? "bg-[#059669]" : "bg-[#94A3B8]"}`}
              aria-hidden
            />
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 border-t px-6 py-4" style={{ borderColor: "#EEF3F9" }}>
        {email ? (
          <p className="flex items-center gap-2 text-sm text-[#4A607A]">
            <Mail className="size-4 text-[#8BACC8]" aria-hidden />
            {email}
          </p>
        ) : null}
        {phone ? (
          <p className="flex items-center gap-2 font-mono text-sm text-[#4A607A]">
            <Phone className="size-4 text-[#8BACC8]" aria-hidden />
            {phone}
          </p>
        ) : null}
        <p className="flex items-center gap-2 text-sm text-[#4A607A]">
          <MapPin className="size-4 text-[#8BACC8]" aria-hidden />
          {city || "No city assigned"}
        </p>
      </div>

      {/* Vehicle Info */}
      <div className="border-t px-6 py-4" style={{ borderColor: "#EEF3F9" }}>
        <div className="flex items-start gap-2">
          <Car className="mt-0.5 size-4 text-[#8BACC8]" aria-hidden />
          <div className="min-w-0">
            {vehicleLabel ? (
              <>
                <p className="text-sm font-medium text-[#0D1B2A]">
                  {vehicleLabel}
                  {vehiclePlate ? (
                    <span className="ml-2 font-mono text-xs text-[#8BACC8]">
                      {vehiclePlate}
                    </span>
                  ) : null}
                </p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    vehicle?.type === "xl"
                      ? "bg-[#EDE9FE] text-[#6D28D9]"
                      : "bg-[#E0F2FE] text-[#0369A1]"
                  }`}
                >
                  {vehicleType}
                </span>
              </>
            ) : (
              <p className="text-sm text-[#8BACC8]">No vehicle registered</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-3 divide-x border-t"
        style={{ borderColor: "#EEF3F9" }}
      >
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
            Rating
          </p>
          {avgRating > 0 ? (
            <p className="mt-1 flex items-center justify-center gap-1 font-mono text-lg font-bold text-[#0D1B2A]">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              {avgRating.toFixed(1)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[#8BACC8]">&mdash;</p>
          )}
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
            Trips
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[#0D1B2A]">
            {totalRides}
          </p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">
            Since
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0D1B2A]">
            {memberSince}
          </p>
        </div>
      </div>
    </div>
  )
}
