'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';

export type CityActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createCity(
  name: string,
  latitude: number | null,
  longitude: number | null,
): Promise<CityActionResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: 'City name is required.' };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('cities')
    .insert({ name: trimmed, latitude, longitude });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A city with this name already exists.' };
    return { success: false, error: error.message };
  }

  const { data: city } = await adminClient
    .from('cities')
    .select('id')
    .eq('name', trimmed)
    .single();

  if (city) {
    await adminClient
      .from('city_services')
      .insert([
        { city_id: city.id, vehicle_type: 'basic', is_available: true },
        { city_id: city.id, vehicle_type: 'xl', is_available: true },
      ]);
  }

  revalidatePath('/pricing-and-services');
  return { success: true };
}

export async function updateCity(
  cityId: string,
  name: string,
  latitude: number | null,
  longitude: number | null,
): Promise<CityActionResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: 'City name is required.' };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('cities')
    .update({ name: trimmed, latitude, longitude })
    .eq('id', cityId);

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A city with this name already exists.' };
    return { success: false, error: error.message };
  }

  revalidatePath('/pricing-and-services');
  return { success: true };
}

export async function deleteCity(
  cityId: string,
): Promise<CityActionResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('cities')
    .update({ is_active: false })
    .eq('id', cityId);

  if (error) return { success: false, error: error.message };

  await adminClient
    .from('driver_profiles')
    .update({ city_id: null })
    .eq('city_id', cityId);

  revalidatePath('/pricing-and-services');
  revalidatePath('/drivers');
  return { success: true };
}
