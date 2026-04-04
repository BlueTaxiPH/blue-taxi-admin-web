import { Button } from "@/components/ui/button"
import {
  CreditCard,
  KeyRound,
  Mail,
  MessageSquare,
  Phone,
  Star,
} from "lucide-react"
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

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground"
            aria-hidden
          >
            {initials}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {fullName}
              </h2>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active
              </div>
            </div>
            <div className="flex flex-row gap-4">
              {user.email ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-4" aria-hidden />
                  <span>{user.email}</span>
                </p>
              ) : null}
              {user.phone ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-4" aria-hidden />
                  <span>{user.phone}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex h-auto flex-col items-center gap-1 py-2"
          >
            <MessageSquare className="size-4" aria-hidden />
            <span>Message</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex h-auto flex-col items-center gap-1 py-2"
          >
            <KeyRound className="size-4" aria-hidden />
            <span>Reset Password</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="col-span-2 flex h-auto flex-col items-center gap-1 py-2"
          >
            <CreditCard className="size-4" aria-hidden />
            <span>Payment</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t justify-items-center pt-4 text-sm text-muted-foreground sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide">Rating</p>
          <p className="mt-1 inline-flex items-center gap-1 text-base font-semibold text-foreground">
            {avgRating != null ? (
              <>
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                {avgRating.toFixed(2)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({totalRides} trips)
                </span>
              </>
            ) : (
              <span className="text-sm font-normal text-muted-foreground">N/A</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Member since</p>
          <p className="mt-1 text-base font-medium text-foreground">
            {memberSince}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Total trips</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {totalRides}
          </p>
        </div>
      </div>
    </div>
  )
}
