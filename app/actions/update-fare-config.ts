'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';

export interface FareConfigInput {
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  surgeEnabled: boolean;
  surgeMultiplier: number;
}

export type UpdateFareConfigResult =
  | { success: true }
  | { success: false; error: string };

export async function updateFareConfig(
  input: FareConfigInput,
): Promise<UpdateFareConfigResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  if (input.baseFare < 0) return { success: false, error: 'Base fare must be >= 0.' };
  if (input.perKmRate < 0) return { success: false, error: 'Per KM rate must be >= 0.' };
  if (input.perMinuteRate < 0) return { success: false, error: 'Per minute rate must be >= 0.' };
  if (input.surgeMultiplier < 1) return { success: false, error: 'Surge multiplier must be >= 1.' };

  const adminClient = createAdminClient();

  // Get existing config row
  const { data: existing } = await adminClient
    .from('fare_config')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await adminClient
      .from('fare_config')
      .update({
        base_fare: input.baseFare,
        per_km_rate: input.perKmRate,
        per_minute_rate: input.perMinuteRate,
        surge_enabled: input.surgeEnabled,
        surge_multiplier: input.surgeMultiplier,
        updated_at: new Date().toISOString(),
        updated_by: auth.user.id,
      })
      .eq('id', existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await adminClient
      .from('fare_config')
      .insert({
        base_fare: input.baseFare,
        per_km_rate: input.perKmRate,
        per_minute_rate: input.perMinuteRate,
        surge_enabled: input.surgeEnabled,
        surge_multiplier: input.surgeMultiplier,
        updated_by: auth.user.id,
      });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/pricing-and-services');
  return { success: true };
}
