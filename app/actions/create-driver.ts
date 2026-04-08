'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import type { SupabaseClient } from '@supabase/supabase-js';

import { failure, revalidateDriversPath } from '@/lib/actions/result';
import { requireAdmin } from '@/lib/auth/require-admin';

export interface CreateDriverInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  plateNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  serviceType?: 'basic' | 'xl';
  cityId?: string;
}

export type CreateDriverResult =
  | { success: true; driverId: string }
  | { success: false; error: string };

const REQUIRED_FIELDS_MESSAGE = 'Full name, email, phone, and password are required.';
const PROFILE_NOT_CREATED_MESSAGE =
  'Driver profile was not created automatically. Please retry.';
const AUTH_FAILED_MESSAGE = 'Failed to create driver account.';

const YEAR_MIN = 1990;
const YEAR_MAX = 2030;

/**
 * Normalizes a Philippine phone number to E.164 format (+639XXXXXXXXX).
 * Accepts: 09XXXXXXXXX, 639XXXXXXXXX, +639XXXXXXXXX.
 */
function normalizePhilippinePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) return '+63' + digits.slice(1);
  if (digits.startsWith('63') && digits.length === 12) return '+' + digits;
  if (raw.startsWith('+')) return raw.trim();
  return raw.trim();
}

function validateCreateDriverInput(
  input: CreateDriverInput,
): { valid: true } | { valid: false; error: string } {
  const trimmedName = input.fullName.trim();
  const trimmedEmail = input.email.trim();
  const trimmedPhone = input.phone.trim();
  if (!trimmedName || !trimmedEmail || !trimmedPhone || !input.password) {
    return { valid: false, error: REQUIRED_FIELDS_MESSAGE };
  }
  if (input.password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  return { valid: true };
}

function parseFullNameToFirstAndLast(
  fullName: string,
): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

async function createDriverUser(
  adminClient: SupabaseClient,
  params: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
  },
): Promise<{ userId: string } | { error: string }> {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: params.email,
    phone: params.phone,
    password: params.password,
    email_confirm: false,
    user_metadata: {
      role: 'driver',
      first_name: params.firstName,
      last_name: params.lastName,
      phone: params.phone,
    },
  });
  if (error || !data.user) {
    return { error: error?.message ?? AUTH_FAILED_MESSAGE };
  }
  return { userId: data.user.id };
}

async function getDriverProfileByUserId(
  adminClient: SupabaseClient,
  userId: string,
): Promise<{ id: string } | null> {
  const { data, error } = await adminClient
    .from('driver_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (error || !data) {
    return null;
  }
  return data as { id: string };
}

interface VehicleFields {
  plateNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
}

function isCompleteVehicleInfo(fields: VehicleFields): boolean {
  const plate = fields.plateNumber?.trim();
  const make = fields.vehicleMake?.trim();
  const model = fields.vehicleModel?.trim();
  const year = fields.vehicleYear;
  const color = fields.vehicleColor?.trim();
  if (!plate || !make || !model || !color) return false;
  if (year == null) return false;
  const numYear = Number(year);
  if (!Number.isFinite(numYear)) return false;
  if (numYear < YEAR_MIN || numYear > YEAR_MAX) return false;
  return true;
}

function clampVehicleYear(year: number): number {
  if (Number.isFinite(year) && year >= YEAR_MIN && year <= YEAR_MAX) {
    return year;
  }
  return new Date().getFullYear();
}

async function insertVehicleForDriver(
  adminClient: SupabaseClient,
  driverProfileId: string,
  vehicle: {
    plate_number: string;
    make: string;
    model: string;
    year: number;
    color: string;
    type: 'basic' | 'xl';
  },
): Promise<{ error: unknown } | null> {
  const { error } = await adminClient.from('vehicles').insert({
    driver_id: driverProfileId,
    plate_number: vehicle.plate_number,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    type: vehicle.type,
  });
  if (error) {
    console.error('[createDriver] vehicle insert failed:', error);
    return { error };
  }
  return null;
}

export async function createDriver(
  input: CreateDriverInput,
): Promise<CreateDriverResult> {
  const adminAuth = await requireAdmin();
  if ('error' in adminAuth) return failure(adminAuth.error);

  const validation = validateCreateDriverInput(input);
  if (!validation.valid) {
    return failure(validation.error);
  }

  const { firstName, lastName } = parseFullNameToFirstAndLast(input.fullName);
  const normalizedPhone = normalizePhilippinePhone(input.phone);
  const adminClient = createAdminClient();

  const authResult = await createDriverUser(adminClient, {
    email: input.email.trim(),
    phone: normalizedPhone,
    password: input.password,
    firstName,
    lastName,
  });

  if ('error' in authResult) {
    return failure(authResult.error);
  }
  const userId = authResult.userId;

  // Upsert users row to ensure phone is stored correctly regardless of trigger behavior
  await adminClient.from('users').upsert({
    id: userId,
    role: 'driver',
    first_name: firstName,
    last_name: lastName,
    email: input.email.trim(),
    phone: normalizedPhone,
    is_active: true,
  });

  const driverProfile = await getDriverProfileByUserId(adminClient, userId);
  if (!driverProfile) {
    await adminClient.auth.admin.deleteUser(userId);
    return failure(PROFILE_NOT_CREATED_MESSAGE);
  }

  const vehicleFields: VehicleFields = {
    plateNumber: input.plateNumber,
    vehicleMake: input.vehicleMake,
    vehicleModel: input.vehicleModel,
    vehicleYear: input.vehicleYear,
    vehicleColor: input.vehicleColor,
  };
  if (isCompleteVehicleInfo(vehicleFields)) {
    const year = clampVehicleYear(Number(input.vehicleYear));
    await insertVehicleForDriver(adminClient, driverProfile.id, {
      plate_number: input.plateNumber!.trim(),
      make: input.vehicleMake!.trim(),
      model: input.vehicleModel!.trim(),
      year,
      color: input.vehicleColor!.trim(),
      type: input.serviceType ?? 'basic',
    });
  }

  if (input.cityId) {
    await adminClient
      .from('driver_profiles')
      .update({ city_id: input.cityId })
      .eq('id', driverProfile.id);
  }

  revalidateDriversPath();
  return { success: true, driverId: driverProfile.id };
}
