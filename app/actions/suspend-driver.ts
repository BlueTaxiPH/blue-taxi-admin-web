'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { failure, success, revalidateDriversPath } from '@/lib/actions/result';

export type SuspendDriverResult =
  | { success: true }
  | { success: false; error: string };

export async function suspendDriver(
  driverId: string,
): Promise<SuspendDriverResult> {
  const authResult = await requireAdmin();
  if ('error' in authResult) return failure(authResult.error);

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('driver_profiles')
    .update({ verification_status: 'suspended' })
    .eq('id', driverId);

  if (error) return failure(error.message);
  revalidateDriversPath(driverId);
  return success();
}
