'use server';

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { success, failure } from '@/lib/actions/result';
import type { ActionResult } from '@/lib/actions/result';

export async function resendDriverInvite(email: string): Promise<ActionResult<void>> {
  const auth = await requireAdmin();
  if ('error' in auth) return failure(auth.error);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/driver-setup`,
  });

  if (error) return failure(error.message);
  return success();
}
