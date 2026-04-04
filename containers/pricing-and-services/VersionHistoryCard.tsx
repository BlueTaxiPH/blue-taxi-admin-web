"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlatformFee } from "@/types/platform-fee"

interface VersionHistoryCardProps {
  feeHistory: PlatformFee[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatCurrency(amount: number): string {
  return `PHP ${amount.toFixed(2)}`
}

export function VersionHistoryCard({ feeHistory }: VersionHistoryCardProps) {
  const hasHistory = feeHistory.length > 0

  return (
    <Card className="h-full gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <CardTitle className="text-lg">Version History</CardTitle>
        <p className="text-sm text-muted-foreground">
          Timeline of platform fee changes
        </p>
      </CardHeader>
      <CardContent className="px-5">
        {hasHistory ? (
          <ol className="space-y-4">
            {feeHistory.map((item, idx) => (
              <li key={item.id} className="relative pl-6">
                <span
                  className={`absolute top-1 left-0 size-2 rounded-full ${
                    item.is_active ? "bg-green-500" : "bg-muted-foreground"
                  }`}
                />
                {idx < feeHistory.length - 1 ? (
                  <span className="absolute top-3 left-[3px] h-[calc(100%+8px)] w-px bg-border" />
                ) : null}
                <p className="text-sm font-semibold leading-tight">
                  {item.label}
                  {item.is_active ? (
                    <span className="ml-2 text-xs font-medium text-green-600">(Active)</span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
                <div className="mt-2 rounded-md bg-muted/60 p-2.5">
                  <p className="text-sm font-medium">
                    ₱{item.fee_amount.toFixed(2)} total
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ₱{(item.fee_amount - (item.insurance_amount ?? 0)).toFixed(2)} platform + ₱{(item.insurance_amount ?? 0).toFixed(2)} insurance
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.created_by ? `Updated by admin` : "System"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            No fee changes recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
