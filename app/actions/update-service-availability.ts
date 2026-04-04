'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';

export type UpdateServiceAvailabilityResult =
  | { success: true }
  | { success: false; error: string };

export async function updateServiceAvailability(
  cityId: string,
  vehicleType: 'basic' | 'xl',
  isAvailable: boolean,
): Promise<UpdateServiceAvailabilityResult> {
  const authResult = await requireAdmin();
  if ('error' in authResult) return { success: false, error: authResult.error };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('city_services')
    .upsert(
      {
        city_id: cityId,
        vehicle_type: vehicleType,
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'city_id,vehicle_type' },
    );

  if (error) return { success: false, error: error.message };

  revalidatePath('/pricing-and-services');
  return { success: true };
}
