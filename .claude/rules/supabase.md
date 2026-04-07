# Supabase Rules

- Use `lib/supabase/client.ts` (createClient) for browser-side client — marked "use client"
- Use `lib/supabase/server.ts` (createClient) for server-side client (Server Actions, Server Components)
- Use `lib/supabase/admin-client.ts` (createAdminClient) only when bypassing RLS is required — uses service role key
- RLS is enabled — all queries require proper auth context
- The `SUPABASE_SERVICE_ROLE_KEY` is server-only — never prefix with NEXT_PUBLIC_
- Shared queries live in `lib/supabase/queries.ts`
