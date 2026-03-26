"use client"

import { useState } from "react"
import { InsuranceReportsHeader } from "./InsuranceReportsHeader"
import { InsuranceCoverageSummaryCard } from "./InsuranceCoverageSummaryCard"
import { InsuredTripManifestCard } from "./InsuredTripManifestCard"
import { InsuredTripManifestPagination } from "./InsuredTripManifestPagination"

export function InsuranceReportsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 6
  const totalCount = 2488

  return (
    <div>
      <InsuranceReportsHeader />
      <main className="space-y-6 p-6">
        <InsuranceCoverageSummaryCard />
        <div className="space-y-4">
          <InsuredTripManifestCard />
          <InsuredTripManifestPagination
            page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          />
        </div>
      </main>
    </div>
  )
}
