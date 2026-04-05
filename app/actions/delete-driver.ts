'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { failure, success, revalidateDriversPath } from '@/lib/actions/result';

export type DeleteDriverResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteDriver(
  driverId: string,
): Promise<DeleteDriverResult> {
  const authResult = await requireAdmin();
  if ('error' in authResult) return failure(authResult.error);

  const adminClient = createAdminClient();

  const { data: profile, error: profileError } = await adminClient
    .from('driver_profiles')
    .select('user_id')
    .eq('id', driverId)
    .single();

  if (profileError || !profile) return failure('Driver not found');

  const { error } = await adminClient.auth.admin.deleteUser(profile.user_id);
  if (error) return failure(error.message);

  revalidateDriversPath();
  return success();
}
