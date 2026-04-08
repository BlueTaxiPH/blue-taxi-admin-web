"use client"

import { ArrowRight, User } from "lucide-react"
import type { PlatformFee } from "@/types/platform-fee"

interface VersionHistoryCardProps {
  feeHistory: PlatformFee[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getChangedByName(item: PlatformFee): string {
  const changedBy = item.changed_by
  if (!changedBy) return "System"
  const name = [changedBy.first_name, changedBy.last_name].filter(Boolean).join(" ")
  return name || "Admin"
}

function computeChanges(current: PlatformFee, previous: PlatformFee | undefined): string[] {
  if (!previous) return ["Initial configuration"]

  const changes: string[] = []

  const prevPlatform = previous.fee_amount - (previous.insurance_amount ?? 0)
  const currPlatform = current.fee_amount - (current.insurance_amount ?? 0)

  if (currPlatform !== prevPlatform) {
    changes.push(`Platform fee: ₱${prevPlatform.toFixed(2)} → ₱${currPlatform.toFixed(2)}`)
  }

  const prevInsurance = previous.insurance_amount ?? 0
  const currInsurance = current.insurance_amount ?? 0
  if (currInsurance !== prevInsurance) {
    changes.push(`Insurance: ₱${prevInsurance.toFixed(2)} → ₱${currInsurance.toFixed(2)}`)
  }

  if (current.label !== previous.label) {
    changes.push(`Label: "${previous.label}" → "${current.label}"`)
  }

  if (changes.length === 0) {
    changes.push("Re-saved with no value changes")
  }

  return changes
}

export function VersionHistoryCard({ feeHistory }: VersionHistoryCardProps) {
  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: "#EEF3F9" }}>
        <h2 className="text-sm font-semibold text-[#0D1B2A]">Change History</h2>
        <p className="text-xs text-[#8BACC8]">Timeline of configuration changes</p>
      </div>
      <div className="p-5">
        {feeHistory.length > 0 ? (
          <ol className="space-y-5">
            {feeHistory.map((item, idx) => {
              const previous = feeHistory[idx + 1]
              const changes = computeChanges(item, previous)
              const changedBy = getChangedByName(item)

              return (
                <li key={item.id} className="relative pl-6">
                  <span
                    className={`absolute left-0 top-1 size-2.5 rounded-full ${
                      item.is_active ? "bg-[#059669]" : "bg-[#DCE6F1]"
                    }`}
                  />
                  {idx < feeHistory.length - 1 ? (
                    <span className="absolute left-[4px] top-3.5 h-[calc(100%+12px)] w-px bg-[#DCE6F1]" />
                  ) : null}

                  {/* Header: label + active badge */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold leading-tight text-[#0D1B2A]">
                      {item.label}
                    </p>
                    {item.is_active ? (
                      <span className="inline-flex rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#059669]">
                        Active
                      </span>
                    ) : null}
                  </div>

                  {/* Timestamp + who changed it */}
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="font-mono text-xs text-[#8BACC8]">
                      {formatDate(item.created_at)}
                    </p>
                    <span className="text-[#DCE6F1]">·</span>
                    <p className="flex items-center gap-1 text-xs text-[#4A607A]">
                      <User className="size-3 text-[#8BACC8]" />
                      {changedBy}
                    </p>
                  </div>

                  {/* Change details */}
                  <div
                    className="mt-2 space-y-1.5 rounded-lg px-3 py-2.5"
                    style={{ background: "#F8FBFF", border: "1px solid #EEF3F9" }}
                  >
                    <p className="font-mono text-sm font-semibold text-[#0D1B2A]">
                      ₱{item.fee_amount.toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-[#8BACC8]">total</span>
                      <span className="ml-2 text-xs font-normal text-[#8BACC8]">
                        (₱{(item.fee_amount - (item.insurance_amount ?? 0)).toFixed(2)} platform + ₱{(item.insurance_amount ?? 0).toFixed(2)} insurance)
                      </span>
                    </p>
                    {changes.map((change, ci) => (
                      <p key={ci} className="flex items-center gap-1 text-xs text-[#4A607A]">
                        <ArrowRight className="size-3 shrink-0 text-[#8BACC8]" />
                        {change}
                      </p>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="py-4 text-center text-sm text-[#8BACC8]">
            No changes recorded yet.
          </p>
        )}
      </div>
    </div>
  )
}
