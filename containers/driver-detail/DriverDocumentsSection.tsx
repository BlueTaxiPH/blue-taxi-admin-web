"use client"

import { DOCUMENT_TYPE_LABELS } from "@/lib/document-types"
import { DriverDocumentCard } from "./DriverDocumentCard"

interface DriverDocument {
  id: string
  document_type: string
  file_url: string | null
  is_verified: boolean
  rejection_reason: string | null
  created_at: string
}

interface DriverDocumentsSectionProps {
  driverId: string
  documents: DriverDocument[]
}

export function DriverDocumentsSection({ driverId, documents }: DriverDocumentsSectionProps) {
  const uploadedCount = documents.length
  const totalTypes = Object.keys(DOCUMENT_TYPE_LABELS).length

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #DCE6F1", boxShadow: "0 1px 3px rgba(13,27,42,0.06)" }}
    >
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "#EEF3F9" }}
      >
        <h3
          className="font-semibold text-[#0D1B2A]"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Documents
        </h3>
        <span className="font-mono text-sm text-[#8BACC8]">
          {uploadedCount} / {totalTypes}
        </span>
      </div>
      <DriverDocumentCard
        documents={documents}
        driverId={driverId}
        allDocumentTypes={Object.keys(DOCUMENT_TYPE_LABELS)}
      />
    </div>
  )
}
