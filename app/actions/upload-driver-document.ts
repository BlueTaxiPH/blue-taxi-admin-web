'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/permissions';

export type UploadDocumentResult =
  | { success: true }
  | { success: false; error: string };

export async function uploadDriverDocument(
  driverId: string,
  documentType: string,
  formData: FormData,
): Promise<UploadDocumentResult> {
  const authResult = await requireAdmin();
  if ('error' in authResult) return { success: false, error: authResult.error };

  const permCheck = await requirePermission(authResult.user.id, 'drivers');
  if (permCheck) return { success: false, error: permCheck.error };

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided' };

  const adminClient = createAdminClient();
  const filePath = `documents/${driverId}/${documentType}-${Date.now()}-${file.name}`;

  const { error: uploadError } = await adminClient.storage
    .from('driver-uploads')
    .upload(filePath, file);

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: { publicUrl } } = adminClient.storage
    .from('driver-uploads')
    .getPublicUrl(filePath);

  // Upsert on (driver_id, document_type) — eliminates the SELECT + conditional
  // UPDATE/INSERT race condition
  const { error } = await adminClient
    .from('driver_documents')
    .upsert(
      {
        driver_id: driverId,
        document_type: documentType,
        file_url: publicUrl,
        is_verified: false,
        verified_by: null,
        verified_at: null,
        rejection_reason: null,
      },
      { onConflict: 'driver_id,document_type' },
    );

  if (error) {
    // Clean up uploaded file since DB write failed
    await adminClient.storage.from('driver-uploads').remove([filePath]);
    return { success: false, error: error.message };
  }

  revalidatePath(`/drivers/${driverId}`);
  return { success: true };
}
