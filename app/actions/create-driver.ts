'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import type { SupabaseClient } from '@supabase/supabase-js';

import { failure, revalidateDriversPath } from '@/lib/actions/result';
import { requireAdmin } from '@/lib/auth/require-admin';

export interface CreateDriverInput {
  fullName: string;
  email: string;
  phone: string;
  plateNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  serviceType?: 'basic' | 'xl';
}

export type CreateDriverResult =
  | { success: true; driverId: string }
  | { success: false; error: string };

const REQUIRED_FIELDS_MESSAGE =
  'Full name, email, and phone are required.';
const PROFILE_NOT_CREATED_MESSAGE =
  'Driver profile was not created automatically. Please retry.';
const AUTH_CREATE_FAILED_MESSAGE = 'Failed to create auth user.';

const YEAR_MIN = 1990;
const YEAR_MAX = 2030;

function validateCreateDriverInput(
  input: CreateDriverInput,
): { valid: true } | { valid: false; error: string } {
  const trimmedName = input.fullName.trim();
  const trimmedEmail = input.email.trim();
  const trimmedPhone = input.phone.trim();
  if (!trimmedName || !trimmedEmail || !trimmedPhone) {
    return { valid: false, error: REQUIRED_FIELDS_MESSAGE };
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

async function createDriverAuthUser(
  adminClient: SupabaseClient,
  params: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  },
): Promise<{ userId: string } | { error: string }> {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: params.email,
    phone: params.phone,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: {
      role: 'driver',
      first_name: params.firstName,
      last_name: params.lastName,
      phone: params.phone,
    },
  });
  if (error || !data.user) {
    return { error: error?.message ?? AUTH_CREATE_FAILED_MESSAGE };
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
  const adminClient = createAdminClient();

  const authResult = await createDriverAuthUser(adminClient, {
    email: input.email,
    phone: input.phone,
    firstName,
    lastName,
  });

  if ('error' in authResult) {
    return failure(authResult.error);
  }
  const userId = authResult.userId;

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
    const vehicleError = await insertVehicleForDriver(
      adminClient,
      driverProfile.id,
      {
        plate_number: input.plateNumber!.trim(),
        make: input.vehicleMake!.trim(),
        model: input.vehicleModel!.trim(),
        year,
        color: input.vehicleColor!.trim(),
        type: input.serviceType ?? 'basic',
      },
    );
    if (vehicleError) {
      // Already logged in insertVehicleForDriver; continue without failing create
    }
  }

  revalidateDriversPath();
  return { success: true, driverId: driverProfile.id };
}
