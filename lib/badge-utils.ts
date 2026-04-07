export function driverStatusBadge(status: string): string {
  const map: Record<string, string> = {
    approved:     "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
    pending:      "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
    under_review: "bg-[#EFF6FF] text-[#1A56DB] border border-[#BFDBFE]",
    rejected:     "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
    suspended:    "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]",
  }
  return map[status] ?? map.pending
}

export function rideStatusBadge(status: string): string {
  const map: Record<string, string> = {
    completed:        "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
    cancelled:        "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
    pending:          "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
    accepted:         "bg-[#EFF6FF] text-[#1A56DB] border border-[#BFDBFE]",
    trip_in_progress: "bg-[#EFF6FF] text-[#1A56DB] border border-[#BFDBFE]",
  }
  return map[status] ?? "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]"
}

export function payoutStatusBadge(status: string): string {
  const map: Record<string, string> = {
    paid:       "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
    pending:    "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
    processing: "bg-[#EFF6FF] text-[#1A56DB] border border-[#BFDBFE]",
    failed:     "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
  }
  return map[status] ?? "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]"
}
