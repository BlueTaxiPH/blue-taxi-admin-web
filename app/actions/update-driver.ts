'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import { requireAdmin } from '@/lib/auth/require-admin';
import { revalidatePath } from 'next/cache';

export interface UpdateDriverInput {
  driverProfileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityId: string | null;
  vehicleId: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  vehicleColor: string;
  vehicleType: 'basic' | 'xl';
  verificationStatus: string;
}

export type UpdateDriverResult =
  | { success: true }
  | { success: false; error: string };

export async function updateDriver(
  input: UpdateDriverInput,
): Promise<UpdateDriverResult> {
  const auth = await requireAdmin();
  if ('error' in auth) return { success: false, error: auth.error };

  const adminClient = createAdminClient();

  // Update users table (name, email, phone)
  const { error: userError } = await adminClient
    .from('users')
    .update({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
    })
    .eq('id', input.userId);

  if (userError) return { success: false, error: `Failed to update user: ${userError.message}` };

  // Update driver_profiles (city, verification_status)
  const { error: profileError } = await adminClient
    .from('driver_profiles')
    .update({
      city_id: input.cityId || null,
      verification_status: input.verificationStatus,
    })
    .eq('id', input.driverProfileId);

  if (profileError) return { success: false, error: `Failed to update profile: ${profileError.message}` };

  // Update or create vehicle
  if (input.vehicleMake.trim() || input.vehicleModel.trim() || input.vehiclePlateNumber.trim()) {
    const vehiclePayload = {
      make: input.vehicleMake.trim(),
      model: input.vehicleModel.trim(),
      plate_number: input.vehiclePlateNumber.trim(),
      color: input.vehicleColor.trim(),
      type: input.vehicleType,
    };

    if (input.vehicleId) {
      const { error } = await adminClient
        .from('vehicles')
        .update(vehiclePayload)
        .eq('id', input.vehicleId);
      if (error) return { success: false, error: `Failed to update vehicle: ${error.message}` };
    } else {
      const { error } = await adminClient
        .from('vehicles')
        .insert({
          ...vehiclePayload,
          driver_id: input.driverProfileId,
          is_active: true,
        });
      if (error) return { success: false, error: `Failed to create vehicle: ${error.message}` };
    }
  }

  // Update auth email if changed
  const { error: authError } = await adminClient.auth.admin.updateUserById(
    input.userId,
    { email: input.email.trim() },
  );
  if (authError) {
    console.warn('[updateDriver] auth email update failed:', authError.message);
  }

  revalidatePath(`/drivers/${input.driverProfileId}`);
  revalidatePath('/drivers');
  return { success: true };
}
