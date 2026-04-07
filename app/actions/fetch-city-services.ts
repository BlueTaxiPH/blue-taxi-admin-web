'use server';

import { fetchCityServices } from '@/lib/supabase/queries';

export async function fetchCityServicesAction(cityId: string) {
  return fetchCityServices(cityId);
}
