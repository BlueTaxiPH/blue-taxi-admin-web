"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { InsuranceCoverageSummaryCard } from "./InsuranceCoverageSummaryCard"
import { InsuredTripManifestCard } from "./InsuredTripManifestCard"
import { InsuredTripManifestPagination } from "./InsuredTripManifestPagination"

export function InsuranceReportsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 6
  const totalCount = 2488

  return (
    <div>
      <PageHeader
        title="Insurance Reports"
        subtitle="Coverage summary and insured trip manifest"
        breadcrumbs={["Business", "Insurance Reports"]}
      />
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
