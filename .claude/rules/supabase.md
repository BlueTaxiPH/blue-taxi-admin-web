# Supabase Client Selection

This project has three Supabase clients for different contexts. Using the wrong one causes auth failures or security issues.

## Which client to use

**`lib/supabase/client.ts`** — Browser-side. Marked `"use client"`. Uses the anon key and respects RLS. Use in React components that run in the browser (onClick handlers, useEffect, etc.).

**`lib/supabase/server.ts`** — Server-side with user context. Uses cookies to maintain the user's session, so RLS policies apply correctly. Use in Server Components, Server Actions, and Route Handlers where you need the current user's permissions.

**`lib/supabase/admin-client.ts`** — Service role key, bypasses RLS entirely. Use only when the operation genuinely requires elevated access (e.g., creating auth users, accessing data across users). Never import this in client-side code or expose the service role key.

The most common mistake is using the admin client when the server client would suffice. RLS exists for a reason — bypass it only when necessary.

## Shared Queries

Reusable query functions live in `lib/supabase/queries.ts`. Check there before writing a new query — the function you need may already exist.
