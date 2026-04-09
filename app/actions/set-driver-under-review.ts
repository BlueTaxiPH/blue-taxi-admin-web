'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { failure, success, revalidateDriversPath } from '@/lib/actions/result';
import { requirePermission } from '@/lib/auth/permissions';

export async function setDriverUnderReview(driverId: string) {
  const authResult = await requireAdmin();
  if ('error' in authResult) return failure(authResult.error);

  const permCheck = await requirePermission(authResult.user.id, 'drivers');
  if (permCheck) return failure(permCheck.error);

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('driver_profiles')
    .update({ verification_status: 'under_review' })
    .eq('id', driverId);

  if (error) return failure(error.message);
  revalidateDriversPath(driverId);
  return success();
}
