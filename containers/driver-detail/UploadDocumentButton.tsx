'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadDriverDocument } from '@/app/actions/upload-driver-document';
import { compressImage, isCompressibleImage } from '@/lib/compress-image';

interface UploadDocumentButtonProps {
  driverId: string;
  documentType: string;
  hasExisting: boolean;
}

export function UploadDocumentButton({ driverId, documentType, hasExisting }: UploadDocumentButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);

    try {
      let processedFile = file;
      if (isCompressibleImage(file)) {
        setStatus('Compressing...');
        processedFile = await compressImage(file, (percent) => {
          setStatus(`Compressing... ${percent}%`);
        });
      }

      setStatus('Uploading...');
      const formData = new FormData();
      formData.append('file', processedFile);
      const result = await uploadDriverDocument(driverId, documentType, formData);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed');
    } finally {
      setIsUploading(false);
      setStatus(null);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5 mr-1.5" />
        {status ? status : hasExisting ? 'Replace' : 'Upload'}
      </Button>
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}
