'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyDocument } from '@/app/actions/verify-document';
import { getDocumentLabel } from '@/lib/document-types';
import { UploadDocumentButton } from './UploadDocumentButton';

interface DriverDocument {
  id: string;
  document_type: string;
  file_url: string | null;
  is_verified: boolean;
  rejection_reason: string | null;
  created_at: string;
}

interface DriverDocumentCardProps {
  documents: DriverDocument[];
  driverId?: string;
  allDocumentTypes?: string[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DriverDocumentCard({ documents, driverId, allDocumentTypes }: DriverDocumentCardProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(docId: string) {
    setPending(docId);
    setError(null);
    const result = await verifyDocument(docId, 'approve');
    setPending(null);
    if (!result.success) setError(result.error);
  }

  async function handleReject(docId: string) {
    setPending(docId);
    setError(null);
    const result = await verifyDocument(docId, 'reject', rejectionReason);
    setPending(null);
    if (!result.success) {
      setError(result.error);
    } else {
      setRejectingId(null);
      setRejectionReason('');
    }
  }

  const types = allDocumentTypes ?? documents.map((d) => d.document_type);

  return (
    <div>
      {error ? (
        <p className="mx-6 mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{error}</p>
      ) : null}
      <div className="divide-y" style={{ borderColor: '#EEF3F9' }}>
        {types.map((docType) => {
          const doc = documents.find((d) => d.document_type === docType);

          return (
            <div
              key={docType}
              className="flex items-start justify-between gap-4 px-6 py-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FileText className="mt-0.5 size-4 shrink-0 text-[#8BACC8]" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0D1B2A]">
                    {getDocumentLabel(docType)}
                  </p>
                  <p className="text-xs text-[#8BACC8] mt-0.5">
                    {doc
                      ? `Uploaded ${formatDate(doc.created_at)}`
                      : 'Not uploaded'}
                  </p>
                  {doc?.rejection_reason ? (
                    <p className="text-xs text-[#DC2626] mt-1">
                      Reason: {doc.rejection_reason}
                    </p>
                  ) : null}
                  {doc?.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1A56DB] hover:underline mt-1 inline-block"
                    >
                      View file
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {doc ? (
                  doc.is_verified ? (
                    <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-medium text-[#059669] border border-[#A7F3D0]">
                      Verified
                    </span>
                  ) : doc.rejection_reason ? (
                    <span className="inline-flex items-center rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-medium text-[#DC2626] border border-[#FECACA]">
                      Rejected
                    </span>
                  ) : (
                    <>
                      {rejectingId === doc.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Rejection reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="h-8 w-48 text-xs"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={pending === doc.id}
                            onClick={() => void handleReject(doc.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={pending === doc.id}
                            onClick={() => void handleApprove(doc.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending === doc.id}
                            onClick={() => setRejectingId(doc.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </>
                  )
                ) : null}
                {driverId ? (
                  <UploadDocumentButton
                    driverId={driverId}
                    documentType={docType}
                    hasExisting={!!doc}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
