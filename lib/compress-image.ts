import imageCompression from 'browser-image-compression';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  initialQuality: 0.8,
  preserveExif: false,
};

export function isCompressibleImage(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}

export async function compressImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<File> {
  if (!isCompressibleImage(file)) {
    return file;
  }

  const originalSizeMB = file.size / (1024 * 1024);

  if (originalSizeMB <= COMPRESSION_OPTIONS.maxSizeMB) {
    return file;
  }

  const compressed = await imageCompression(file, {
    ...COMPRESSION_OPTIONS,
    onProgress,
  });

  return compressed;
}
