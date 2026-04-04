'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import { requireAdmin } from '@/lib/auth/require-admin';
import { revalidatePath } from 'next/cache';

export type UpdatePlatformFeeResult =
  | { success: true }
  | { success: false; error: string };

const MAX_PLATFORM_FEE = 1000;

export async function updatePlatformFee(
  newAmount: number,
  label: string = 'Platform Fee',
): Promise<UpdatePlatformFeeResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  if (newAmount < 0 || newAmount > MAX_PLATFORM_FEE) {
    return { success: false, error: `Fee must be between 0 and ${MAX_PLATFORM_FEE}.` };
  }

  const adminClient = createAdminClient();

  // Insert new active fee first (safer — if this fails, old fee remains active)
  const { data: newFee, error: insertError } = await adminClient
    .from('platform_fees')
    .insert({
      fee_amount: newAmount,
      label,
      is_active: true,
      created_by: auth.user.id,
    })
    .select('id')
    .single();

  if (insertError) return { success: false, error: insertError.message };

  // Deactivate all other fees (excluding the one we just inserted)
  const { error: deactivateError } = await adminClient
    .from('platform_fees')
    .update({ is_active: false })
    .eq('is_active', true)
    .neq('id', newFee.id);

  if (deactivateError) {
    return { success: false, error: `Fee created but failed to deactivate old fee: ${deactivateError.message}` };
  }

  revalidatePath('/pricing-and-services');
  return { success: true };
}
