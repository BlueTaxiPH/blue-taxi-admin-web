'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/permissions';

export type UploadAvatarResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadDriverAvatar(
  driverId: string,
  userId: string,
  formData: FormData,
): Promise<UploadAvatarResult> {
  const authResult = await requireAdmin();
  if ('error' in authResult) return { success: false, error: authResult.error };

  const permCheck = await requirePermission(authResult.user.id, 'drivers');
  if (permCheck) return { success: false, error: permCheck.error };

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided.' };

  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Only image files are allowed.' };
  }

  const adminClient = createAdminClient();
  const filePath = `avatars/${userId}/avatar-${Date.now()}-${file.name}`;

  const { error: uploadError } = await adminClient.storage
    .from('driver-uploads')
    .upload(filePath, file);

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: { publicUrl } } = adminClient.storage
    .from('driver-uploads')
    .getPublicUrl(filePath);

  const { error: updateError } = await adminClient
    .from('users')
    .update({ photo_url: publicUrl })
    .eq('id', userId);

  if (updateError) {
    // Clean up uploaded file since DB update failed
    await adminClient.storage.from('driver-uploads').remove([filePath]);
    return { success: false, error: updateError.message };
  }

  revalidatePath(`/drivers/${driverId}`);
  revalidatePath('/drivers');
  return { success: true, url: publicUrl };
}
