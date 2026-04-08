import { Mail, Phone, Star } from "lucide-react"
import type { PassengerUser } from "./types"

interface PassengerDetailsCardProps {
  user: PassengerUser
}

export function PassengerDetailsCard({ user }: PassengerDetailsCardProps) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed"
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const profile = Array.isArray(user.passenger_profiles)
    ? user.passenger_profiles[0]
    : user.passenger_profiles
  const totalRides = profile?.total_rides ?? 0
  const avgRating = profile?.avg_rating ?? null
  const isActive = (user as any).is_active !== false

  const memberSince = new Date(user.created_at).toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  })

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-4">
        <div
          className={`flex size-20 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-700 ${
            isActive
              ? "ring-2 ring-emerald-400 ring-offset-2"
              : "ring-2 ring-red-400 ring-offset-2"
          }`}
          aria-hidden
        >
          {initials}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0D1B2A]" style={{ fontFamily: "var(--font-outfit, sans-serif)" }}>
            {fullName}
          </h2>
          <span
            className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
            }`}
          >
            {isActive ? "Active" : "Suspended"}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-t px-6 py-4" style={{ borderColor: "#EEF3F9" }}>
        {user.email ? (
          <p className="flex items-center gap-2 text-sm text-[#4A607A]">
            <Mail className="size-4 text-[#8BACC8]" aria-hidden />
            {user.email}
          </p>
        ) : null}
        {user.phone ? (
          <p className="flex items-center gap-2 font-mono text-sm text-[#4A607A]">
            <Phone className="size-4 text-[#8BACC8]" aria-hidden />
            {user.phone}
          </p>
        ) : null}
      </div>

      <div
        className="grid grid-cols-3 divide-x border-t"
        style={{ borderColor: "#EEF3F9" }}
      >
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">Rating</p>
          {avgRating != null && avgRating > 0 ? (
            <p className="mt-1 flex items-center justify-center gap-1 font-mono text-lg font-bold text-[#0D1B2A]">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              {avgRating.toFixed(2)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[#8BACC8]">—</p>
          )}
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">Trips</p>
          <p className="mt-1 font-mono text-lg font-bold text-[#0D1B2A]">{totalRides}</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8BACC8]">Since</p>
          <p className="mt-1 text-sm font-semibold text-[#0D1B2A]">{memberSince}</p>
        </div>
      </div>
    </div>
  )
}
