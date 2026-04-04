'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';

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

  // Upsert: update if exists, insert if not
  const { data: existing } = await adminClient
    .from('driver_documents')
    .select('id')
    .eq('driver_id', driverId)
    .eq('document_type', documentType)
    .maybeSingle();

  if (existing) {
    const { error } = await adminClient
      .from('driver_documents')
      .update({ file_url: publicUrl, is_verified: true, verified_by: authResult.user.id, verified_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', existing.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await adminClient
      .from('driver_documents')
      .insert({
        driver_id: driverId,
        document_type: documentType,
        file_url: publicUrl,
        is_verified: true,
        verified_by: authResult.user.id,
        verified_at: new Date().toISOString(),
      });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/drivers/${driverId}`);
  return { success: true };
}
