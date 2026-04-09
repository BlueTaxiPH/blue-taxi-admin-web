'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import { requireAdmin } from '@/lib/auth/require-admin';

import {
  failure,
  success,
  revalidateDriversPath,
} from '@/lib/actions/result';
import { requirePermission } from '@/lib/auth/permissions';

export type ApproveDriverResult =
  | { success: true }
  | { success: false; error: string };

function buildDriverVerificationUpdate(
  action: 'approve' | 'reject',
  userId: string,
): Record<string, unknown> {
  const verificationStatus = action === 'approve' ? 'approved' : 'rejected';
  const updatePayload: Record<string, unknown> = {
    verification_status: verificationStatus,
  };
  if (action === 'approve') {
    updatePayload.approved_at = new Date().toISOString();
    updatePayload.approved_by = userId;
  }
  return updatePayload;
}

export async function approveDriver(
  driverId: string,
  action: 'approve' | 'reject',
): Promise<ApproveDriverResult> {
  const authResult = await requireAdmin();
  if ('error' in authResult) return failure(authResult.error);

  const permCheck = await requirePermission(authResult.user.id, 'drivers');
  if (permCheck) return failure(permCheck.error);

  const updatePayload = buildDriverVerificationUpdate(action, authResult.user.id);
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('driver_profiles')
    .update(updatePayload)
    .eq('id', driverId);

  if (error) {
    return failure(error.message);
  }

  revalidateDriversPath(driverId);
  return success();
}
