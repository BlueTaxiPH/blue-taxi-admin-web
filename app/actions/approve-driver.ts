'use server';

import type { User } from '@supabase/supabase-js';

import { createAdminClient } from '@/lib/supabase/admin-client';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  failure,
  success,
  revalidateDriversPath,
} from '@/lib/actions/result';

export type ApproveDriverResult =
  | { success: true }
  | { success: false; error: string };

const AUTH_REQUIRED_MESSAGE =
  'You must be signed in to approve or reject drivers.';
const ADMIN_REQUIRED_MESSAGE =
  'Only admins can approve or reject drivers.';

async function getAuthenticatedUser(
  serverClient: SupabaseClient,
): Promise<{ user: User } | { error: string }> {
  const { data: { user }, error: authError } =
    await serverClient.auth.getUser();
  if (authError || !user) {
    return { error: AUTH_REQUIRED_MESSAGE };
  }
  return { user };
}

async function requireAdminRole(
  serverClient: SupabaseClient,
  userId: string,
): Promise<true | string> {
  const { data: caller } = await serverClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  if (!caller || caller.role !== 'admin') {
    return ADMIN_REQUIRED_MESSAGE;
  }
  return true;
}

function buildDriverVerificationUpdate(
  action: 'approve' | 'reject',
  userId: string,
): Record<string, unknown> {
  const verificationStatus = action === 'approve' ? 'approved' : 'rejected';
  const updatePayload: Record<string, unknown> = {
    verification_status: verificationStatus,
  };
  if (action === 'approve') {
    updatePayload.approved_at = new Date().toISOString();
    updatePayload.approved_by = userId;
  }
  return updatePayload;
}

export async function approveDriver(
  driverId: string,
  action: 'approve' | 'reject',
): Promise<ApproveDriverResult> {
  const serverClient = await createClient();

  const authResult = await getAuthenticatedUser(serverClient);
  if ('error' in authResult) {
    return failure(authResult.error);
  }
  const currentUser = authResult.user;

  const adminCheck = await requireAdminRole(serverClient, currentUser.id);
  if (adminCheck !== true) {
    return failure(adminCheck);
  }

  const updatePayload = buildDriverVerificationUpdate(action, currentUser.id);
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('driver_profiles')
    .update(updatePayload)
    .eq('id', driverId);

  if (error) {
    return failure(error.message);
  }

  revalidateDriversPath(driverId);
  return success();
}
