'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import { requireAdmin } from '@/lib/auth/require-admin';
import {
  failure,
  success,
  revalidateDriversPath,
} from '@/lib/actions/result';
import { requirePermission } from '@/lib/auth/permissions';

export type VerifyDocumentResult =
  | { success: true }
  | { success: false; error: string };

export async function verifyDocument(
  documentId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string,
): Promise<VerifyDocumentResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return failure(auth.error);

  const permCheck = await requirePermission(auth.user.id, 'drivers');
  if (permCheck) return failure(permCheck.error);

  if (action === 'reject' && (!rejectionReason || rejectionReason.trim().length === 0)) {
    return failure('A rejection reason is required.');
  }

  const adminClient = createAdminClient();

  const updatePayload: Record<string, unknown> = {
    is_verified: action === 'approve',
    verified_by: auth.user.id,
    verified_at: new Date().toISOString(),
    rejection_reason: action === 'reject' ? rejectionReason!.trim() : null,
  };

  const { error } = await adminClient
    .from('driver_documents')
    .update(updatePayload)
    .eq('id', documentId);

  if (error) return failure(error.message);

  revalidateDriversPath();
  return success();
}
