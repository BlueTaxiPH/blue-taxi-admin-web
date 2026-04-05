'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadDriverAvatar } from '@/app/actions/upload-driver-avatar';
import { compressImage, isCompressibleImage } from '@/lib/compress-image';

interface DriverAvatarUploadProps {
  driverId: string;
  userId: string;
  currentPhotoUrl: string | null;
  driverName: string;
}

export function DriverAvatarUpload({
  driverId,
  userId,
  currentPhotoUrl,
  driverName,
}: DriverAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initial = driverName.charAt(0).toUpperCase() || '?';

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);

    try {
      let processedFile = file;
      if (isCompressibleImage(file)) {
        setStatus('Compressing...');
        processedFile = await compressImage(file);
      }

      setStatus('Uploading...');
      const formData = new FormData();
      formData.append('file', processedFile);
      const result = await uploadDriverAvatar(driverId, userId, formData);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setStatus(null);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        {currentPhotoUrl ? (
          <img
            src={currentPhotoUrl}
            alt={driverName}
            className="size-16 rounded-full object-cover border-2 border-blue-100"
          />
        ) : (
          <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
            <span className="text-xl font-bold text-blue-700">{initial}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Upload avatar"
        >
          <Camera className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
      <div>
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {status ? status : currentPhotoUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>
        {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
