'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import { requireAdmin } from '@/lib/auth/require-admin';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/permissions';

export type UpdatePlatformFeeResult =
  | { success: true }
  | { success: false; error: string };

const MAX_TOTAL_FEE = 1000;

export async function updatePlatformFee(
  platformAmount: number,
  insuranceAmount: number,
  label: string = 'Platform Fee',
): Promise<UpdatePlatformFeeResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const permCheck = await requirePermission(auth.user.id, 'system_config');
  if (permCheck) return { success: false, error: permCheck.error };

  if (platformAmount < 0) return { success: false, error: 'Platform fee must be >= 0.' };
  if (insuranceAmount < 0) return { success: false, error: 'Insurance fee must be >= 0.' };

  const totalFeeAmount = platformAmount + insuranceAmount;
  if (totalFeeAmount > MAX_TOTAL_FEE) {
    return { success: false, error: `Total fee must not exceed ₱${MAX_TOTAL_FEE}.` };
  }

  const adminClient = createAdminClient();

  // Deactivate current active fee first (the unique index only allows one active row)
  const { error: deactivateError } = await adminClient
    .from('platform_fees')
    .update({ is_active: false })
    .eq('is_active', true);

  if (deactivateError) {
    return { success: false, error: `Failed to deactivate current fee: ${deactivateError.message}` };
  }

  // Insert new active fee
  const { error: insertError } = await adminClient
    .from('platform_fees')
    .insert({
      fee_amount: totalFeeAmount,
      insurance_amount: insuranceAmount,
      label,
      is_active: true,
      created_by: auth.user.id,
    });

  if (insertError) {
    // Rollback: try to reactivate the most recent fee
    await adminClient
      .from('platform_fees')
      .update({ is_active: true })
      .order('created_at', { ascending: false })
      .limit(1);

    return { success: false, error: insertError.message };
  }

  revalidatePath('/pricing-and-services');
  revalidatePath('/system-settings');
  return { success: true };
}
