'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyDocument } from '@/app/actions/verify-document';
import { getDocumentLabel } from '@/lib/document-types';

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
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DriverDocumentCard({ documents }: DriverDocumentCardProps) {
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

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Documents</h3>
        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Documents ({documents.length})</h3>
      {error ? (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      ) : null}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{getDocumentLabel(doc.document_type)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Uploaded {formatDate(doc.created_at)}
              </p>
              {doc.rejection_reason ? (
                <p className="text-xs text-red-600 mt-1">Reason: {doc.rejection_reason}</p>
              ) : null}
              {doc.file_url ? (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  View file
                </a>
              ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {doc.is_verified ? (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Verified
                </Badge>
              ) : doc.rejection_reason ? (
                <Badge variant="destructive">Rejected</Badge>
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
