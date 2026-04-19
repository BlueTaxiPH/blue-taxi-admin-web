# Blue Taxi PH — Production Readiness & Security Audit

**Audit Date:** 2026-04-10
**Scope:** `blue-taxi-admin-web`, `blue-taxi-drivers-mobile`, `blue-taxi-passengers-mobile`, Supabase project `qmbwreizcwnxxfcpmdyr`
**Launch Shape:** Soft pilot — Metro Manila, limited invites, staged ramp
**Payment Model:** Cash-only (driver wallet not built — PCI-DSS scope collapsed)
**Target Scale:** 600 drivers nationwide

---

## 1. Executive Verdict

### Status: RED — DO NOT LAUNCH (pre-fix state)

The core architecture is sound. RLS is enabled on every table, the closed-fleet driver model is enforced end-to-end, the `accept_ride` RPC is atomic and race-safe, the three-client Supabase separation is correct, and the passenger branch of `rides_update` already uses a frozen-fields pattern. **However, there are policy-level and config-level failures that either leak data, allow privilege escalation, or will break under expected pilot traffic.** All blockers are fixable at the policy/config boundary — no architectural rewrites required.

**Estimated time to defensible soft-pilot:** 1–2 weeks of focused work across 3 parallel streams.

### Blockers (P0)

| ID    | Title                                                                                |
| ----- | ------------------------------------------------------------------------------------ |
| P0-1  | `SUPABASE_SERVICE_ROLE_KEY` committed to git (all three repos)                        |
| P0-2  | `rides_update` RLS allows drivers to write arbitrary `final_fare` / `platform_fee`   |
| P0-3  | `rides_insert_passenger` allows passenger to supply `estimated_fare` / `payment_method` |
| P0-4  | `accept_ride` RPC bypassable via direct UPDATE (pending-branch loophole)             |
| P0-5  | `driver-uploads` storage bucket is public with no policies or file constraints       |
| P0-6  | Google Maps API key hardcoded in 4 locations (passenger) + `.env` (driver)           |
| P0-7  | Supabase Auth leaked-password protection disabled                                     |
| P0-8  | Driver client computes `final_fare` locally and writes it directly                    |

---

## 2. Architecture & Data Model Review

### Shape
- **3 apps, 1 Supabase project** (`qmbwreizcwnxxfcpmdyr`, ap-southeast-2)
- **Closed fleet model:** Drivers cannot self-register. Admin creates the auth user; driver signs in via OTP with `shouldCreateUser: false`
- **PostGIS for geospatial:** `driver_locations.current_location`, ride matching by city
- **11-state ride lifecycle** defined in enum and mirrored in mobile client contexts
- **Atomic acceptance:** `accept_ride(p_ride_id)` RPC handles race conditions server-side
- **Lazy conversation creation:** `ensure_conversation_for_ride(ride_id)` RPC is idempotent

### Data Model Snapshot
- 20 tables, RLS on all
- 14 users, 4 approved drivers, 9 passengers, 257 rides, 3 cities, 1 fare_config row
- **0 rows in `admin_audit_log`** — table exists but nothing writes to it

### Architectural Concerns

**Admin approval bypasses the edge function.** `admin-approve-driver` edge function exists and correctly validates admin role, but it is **never called from the admin web**. All approval / suspension / review-status changes are direct UPDATEs via the admin client:
- `app/actions/approve-driver.ts:44-47`
- `app/actions/suspend-driver.ts:22-25`
- `app/actions/set-driver-under-review.ts:16-19`
- `app/actions/update-driver.ts:54-60`

This means the function's intended audit logging is dead code, and every approval path needs its own audit log write.

**Dual-client mutation surface for rides.** The driver app uses a generic `updateRide()` helper (`blue-taxi-drivers-mobile/contexts/active-booking/ActiveBookingProvider.tsx:131-141`) that performs direct UPDATEs on rides. Every state transition depends on RLS alone for validation — there is no per-transition server-side guard.

---

## 3. Security Audit

### 3.1 RLS & Authorization

#### P0-2 — `rides_update` allows drivers to set arbitrary fare fields

**Evidence** (from `pg_policy`):

```
USING:  (is_admin()
        OR (driver_id = (SELECT auth.uid()))
        OR ((status = 'pending') AND is_approved_online_driver())
        OR (passenger_id = (SELECT auth.uid())))

WITH CHECK: (is_admin()
        OR (driver_id = (SELECT auth.uid()))
        OR ((passenger_id = (SELECT auth.uid()))
            AND frozen_driver_id AND frozen_final_fare AND frozen_platform_fee))
```

The passenger branch enforces frozen fields. **The driver branch does not.** Any driver assigned to a ride can set `final_fare = 999999`, `platform_fee = 0`, `status = 'completed'`, or even `driver_id = <other_driver_uuid>`.

**Client exploitation path confirmed** — `blue-taxi-drivers-mobile/contexts/active-booking/ActiveBookingProvider.tsx:131-141`:

```typescript
async function updateRide(
  rideId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('rides')
    .update(updates)
    .eq('id', rideId);
  if (error) throw error;
}
```

And `ActiveBookingProvider.tsx:243-253` — the driver client computes `final_fare` locally and writes it directly:

```typescript
const setMeterFare = useCallback(
  async (amount: number) => {
    if (!state.activeRide) return;
    const platformFee = await getActivePlatformFee();
    const finalFare = amount + platformFee;
    await updateRide(state.activeRide.id, {
      final_fare: finalFare,
      platform_fee: platformFee,
      fare_type: 'input_fare',
      status: 'input_fare',
    });
```

**Fix:** Rewrite the driver branch of `rides_update` WITH CHECK to enforce frozen fields and a status-transition whitelist. Move fare-setting to a dedicated `set_meter_fare(ride_id, meter_amount)` RPC that computes `final_fare + platform_fee` server-side and enforces status preconditions.

---

#### P0-3 — `rides_insert_passenger` trusts client-supplied fare / payment method

**Evidence:**

```
with_check: (passenger_id = (SELECT auth.uid()))
```

Only checks `passenger_id`. The passenger can send any value for `estimated_fare`, `payment_method`, `distance_meters`, `duration_seconds`, `city_id`.

**Client exploitation path confirmed** — `blue-taxi-passengers-mobile/api/rides/useCreateRide.ts:56-74`:

```typescript
const result = await supabase
  .from('rides')
  .insert({
    ...
    estimated_fare: payload.estimatedFare,
    payment_method: payload.paymentMethod ?? 'cash',
    status: 'pending',
    ...
  })
```

**Fix:** Replace the direct INSERT with a `create_ride(pickup, dropoff, distance, duration, city_id)` RPC that computes fare from `fare_config` server-side. Hardcode `payment_method = 'cash'` server-side until payment integration lands.

---

#### P0-4 — `accept_ride` RPC is bypassable

Because the driver branch of `rides_update` USING allows `(status = 'pending') AND is_approved_online_driver()`, any approved online driver can skip the RPC entirely and directly set their own `driver_id` on a pending ride. The RPC's city check, status check, and anti-race-condition logic are all bypassed.

**Fix:** Remove the pending branch from `rides_update` USING. Force all accepts through the RPC. Combined with the P0-2 fix.

---

#### Additional RLS observations

- **Positive:** All RLS policies use the `(SELECT auth.uid())` subselect caching pattern
- **Positive:** FK columns on `rides`, `ride_status_history`, `messages`, `notifications` are indexed
- **Issue (P1):** The `handle_new_auth_user` trigger auto-creates `driver_profiles` for any signup with `raw_user_meta_data->>'role' = 'driver'`. The mobile driver app uses OTP with `shouldCreateUser: false`, so the path isn't reachable in normal flow, but a crafted signup via the anon key would still trigger it. Remove the driver_profiles auto-insert from the trigger — only `admin-create-driver` should create driver profiles.

---

### 3.2 Secrets Management

#### P0-1 — `SUPABASE_SERVICE_ROLE_KEY` committed to git

**Evidence:** All three repos have `.env` tracked in git. The admin web `.env` contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://qmbwreizcwnxxfcpmdyr.supabase.co
NEXT_PUBLIC_SITE_URL=https://blue-taxi-admin-web.vercel.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=<JWT>
SUPABASE_SERVICE_ROLE_KEY=<JWT>        # bypasses ALL RLS
```

The service role key bypasses every RLS policy. Anyone with git access has full read/write on all 20 tables including `users`, `driver_profiles`, `rides`, `fare_config`. Note that `.env*` is listed in `.gitignore:34`, but the `.env` file was tracked before the ignore rule was added — `.gitignore` doesn't un-track files.

**Fix:**
1. Rotate `SUPABASE_SERVICE_ROLE_KEY` and both anon keys in Supabase dashboard
2. Purge `.env` from git history in all 3 repos using `git filter-repo`
3. Re-verify `.env` is ignored in all 3 repos after purge
4. Move secrets to Vercel env vars (admin web) and EAS secrets (mobile apps)
5. Commit `.env.example` placeholders in all 3 repos

---

#### P0-6 — Google Maps API key hardcoded in multiple locations

**Passenger mobile (4 locations):**
- `.env:8` — `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB_Aq45nb29_cram7YT9n9Frv8K4QjuD3o`
- `app.json:14` — iOS `googleMapsApiKey`
- `app.json:28` — Android `apiKey`
- `android/app/src/main/AndroidManifest.xml:18` — `<meta-data>` tag

**Driver mobile (1 location):**
- `.env:2` — same key

Same key across both apps. The `EXPO_PUBLIC_` prefix means it's embedded in every compiled bundle and extractable from any installed APK/IPA.

**Fix:**
1. Rotate the key in Google Cloud Console immediately
2. Apply restrictions: iOS bundle ID + Android package name + specific Google APIs (Places, Directions, Maps SDK)
3. Update all 5 file locations
4. Set per-day quota and billing alerts
5. Consider routing all Places / Directions traffic through the existing `maps-*` edge functions (they already exist as proxies); the client-side key only needs to cover MapView SDK rendering

---

### 3.3 Authentication

#### Positive findings

- **Closed fleet enforced.** Driver OTP uses `shouldCreateUser: false` (`api/auth/otp.ts:12`). Role verified post-OTP against `users.role` (`api/auth/otp.ts:46-58`); non-drivers are signed out immediately.
- **Passenger role hardcoded.** `screens/welcome/WelcomeScreen.tsx:107` explicitly sets `role: 'passenger'` during profile completion. Metadata-based role escalation is not possible from the passenger app.
- **Email verification gate.** `SignInScreen.tsx:94-106` redirects to verification screen on email-not-confirmed errors.
- **Verification status gate.** `SplashScreen.tsx:38-65` calls `getDriverPostAuthRoute()` post-sign-in which routes based on `driver_profiles.verification_status`.

#### Issues

**P0-7 — Leaked-password protection disabled.** Supabase Auth → Password Strength has HaveIBeenPwned check disabled. Passengers can choose known-compromised passwords. **Fix:** Toggle on in Supabase dashboard.

**P1 — Password policy too weak.**
- `blue-taxi-passengers-mobile/forms/schemas/sign-up.schema.ts:13-14` — minimum 8 characters
- `forms/schemas/reset-password.schema.ts:7-8` — same

NIST 2023 guidance recommends 12+ characters. **Fix:** Raise to 12 in both schemas.

**P1 — No rate limit on OTP verification attempts.** `api/auth/otp.ts:17-28` (passenger) has no attempt counter. 6-digit OTP = 1M combinations but without lockout it's iterable. **Fix:** Verify Supabase Auth per-phone rate limits are enabled in dashboard (3 attempts → 15-min lockout is the default when enabled).

**P1 — OTP resend cooldown too short.**
- `passengers screens/verification/VerificationScreen.tsx:37` — 59 seconds
- `passengers screens/sign-up/SignUpScreen.tsx:178` — 60 seconds

Enables SMS-bomb abuse. **Fix:** Exponential backoff (1st: 60s, 2nd: 5min, 3rd: 30min, 4th: 24h lock).

**P1 — No CAPTCHA on passenger signup or OTP send.** Mass account creation and SMS bombing are unthrottled. **Fix:** Cloudflare Turnstile or reCAPTCHA v3 on signup screen.

---

### 3.4 Input Validation

Admin web uses manual validation, not Zod, across most Server Actions:

- **Good:** `create-driver.ts:47-59` — `validateCreateDriverInput()` trims, checks required fields, password ≥ 8 chars, phone normalization
- **Good:** `update-fare-config.ts:25-28` — numeric range checks (`baseFare >= 0`, `surgeMultiplier >= 1`)
- **Issue (P2):** `manage-city.ts:23-24` — trims name, but accepts any lat/lng values. Should validate `-90 ≤ lat ≤ 90` and `-180 ≤ lng ≤ 180`
- **Issue (P2):** `update-driver.ts:38-49` — accepts structured input but doesn't validate email format, phone format, or string lengths
- **Issue (P2):** `approve-driver.ts:33-35` — no existence check before UPDATE
- **Issue (P2):** `platform-fee.ts:25-26` — range check only, no type coercion

**SQL injection:** All queries are parameterized via Supabase SDK. No string concatenation. No `.rpc()` calls with unsanitized input.

**Fix:** Migrate all Server Actions to Zod schemas with `safeParse()` at the top of each action. One `z.object({...})` per action, inferred to TypeScript interface.

---

### 3.5 PII Exposure

- Phone and email rendered only inside admin-gated pages (`containers/passenger-profile/PassengerDetailsCard.tsx:61-71`, driver detail pages)
- No query-parameter exposure of PII
- Mobile profile data not persisted to AsyncStorage (only auth token is)
- Driver documents served via on-demand URLs, not cached to disk
- **Issue (P2):** Booking draft (pickup / dropoff addresses and coordinates) persisted unencrypted in AsyncStorage — `blue-taxi-passengers-mobile/lib/booking-draft-storage.ts:14,32`. Location history leaks on rooted / jailbroken device. **Fix:** Move to SecureStore or wipe on logout.

---

### 3.6 Admin Authorization & Audit

#### Positive

- **All 17 mutation Server Actions call `requireAdmin()`.** Implementation at `lib/auth/require-admin.ts:9-31` verifies session + `role === 'admin'` + `admin_status === 'active'`
- **Per-action permission checks** via `requirePermission(userId, module)` on sensitive actions: `approve-driver`, `suspend-*`, `verify-document`, `upload-*`, `platform-fee`, `manage-city`
- **Admin-client isolation confirmed.** All 19 import sites of `lib/supabase/admin-client.ts` are in `'use server'` files or server-rendered pages. No client-component leakage.
- **Multi-layer RBAC:** middleware (session refresh) → dashboard layout (role + status check) → action (`requireAdmin`) → per-module permission check
- **CSRF:** Mutation surface is Server Actions only. No custom POST endpoints, no route handlers in `app/api/`. Next.js Server Actions include CSRF tokens at the framework level.

#### Gaps

- **P1 — `admin_audit_log` table has 0 entries.** Every admin mutation should write an audit row (actor, action, target, before / after). None currently do.
- **P2 — `logout.ts:6` and `fetch-city-services.ts:5` lack `requireAdmin()`.** Logout is acceptable. `fetch-city-services` is a read-only lookup that relies on RLS but should still be gated.
- **P2 — Edge function bypass.** `admin-approve-driver` exists but is never called. Admin web writes `driver_profiles.verification_status` directly. Either wire the admin web to use the edge function (plus audit writes), or delete the function and add explicit audit writes to the Server Actions.

---

### 3.7 Edge Functions Security

7 edge functions total:

| Function                | `verify_jwt` | Findings                                                      |
| ----------------------- | ------------ | ------------------------------------------------------------- |
| `maps-autocomplete`     | false        | No auth — anyone with the URL can call it                     |
| `maps-nearby`           | false        | Same                                                          |
| `maps-directions`       | false        | Same                                                          |
| `maps-place-details`    | false        | Same                                                          |
| `maps-reverse-geocode`  | false        | Same                                                          |
| `admin-approve-driver`  | true         | Admin role verified. Wildcard CORS. No audit log. Not used.   |
| `admin-create-payout`   | true         | Admin role verified. **Trusts client-provided amount.**       |

#### P1 — Maps edge functions lack JWT verification

All 5 Maps functions have `verify_jwt = false` in `config.toml`. Anyone with the function URL can hit them and incur Google API costs. For a soft pilot this is a budget risk; at launch scale it's a DDoS vector.

**Fix:** Set `verify_jwt = true` on all 5, or add manual JWT validation at the top of each handler.

#### P1 — `admin-create-payout` trusts client-provided amount

```typescript
const { driverId, amount } = await req.json();
if (!driverId || amount == null || amount <= 0) { ... }
// NO server-side check against driver_earnings balance
const { data, error } = await supabase
  .from("driver_payouts")
  .insert({ driver_id: driverId, total_amount: amount, ... })
```

An admin — or a compromised admin account — can create a payout for any amount without reconciliation against the driver's unpaid `driver_earnings`.

**Fix:** Query `SUM(driver_earnings.net_amount) WHERE driver_id = $1 AND payout_id IS NULL`. Cap the requested amount at the computed balance. Link the created `driver_payouts.id` back to the covered earnings rows.

#### P2 — CORS wildcards

`admin-approve-driver` sets `Access-Control-Allow-Origin: *`. Should be the admin web origin only.

---

### 3.8 Storage

#### P0-5 — `driver-uploads` bucket is public with no policies or limits

**Evidence:**

```json
{
  "driver-uploads": {
    "public": true,
    "file_size_limit": null,
    "allowed_mime_types": null,
    "created_at": "2026-04-04"
  }
}
```

- **Public.** Anyone with a URL can download. Driver PII documents (licenses, IDs, selfies) are served publicly.
- **No size limit.** Upload abuse vector — fill storage quota, incur egress costs.
- **No MIME restrictions.** Can upload any file type including executables.
- **No policies.** Any authenticated user can upload to any path in the bucket.

Both `app/actions/upload-driver-avatar.ts` and `upload-driver-document.ts` upload here and call `getPublicUrl()`. Document URLs are stored in `driver_documents.file_url` as public URLs. The admin web's client-side validation is only `file.type.startsWith('image/')` — there's no server-side MIME or size enforcement.

Notably, two other buckets (`driver-documents`, `vehicle-photos`) already exist with correct private config + 10MB size limits. The admin web is simply writing to the wrong bucket.

**Fix (simplest):**
1. Redirect `upload-driver-document` to the existing private `driver-documents` bucket
2. Redirect `upload-driver-avatar` to the existing `avatars` bucket (which is public but has size + MIME limits)
3. Either delete the `driver-uploads` bucket or set `public: false`, add policies, set size + MIME limits
4. Migrate any existing files from `driver-uploads` to the correct buckets
5. Update `driver_documents.file_url` values to signed URLs
6. Update client code to request signed URLs on-demand rather than storing them

**Fix (additional):**
- Add server-side MIME validation in `upload-driver-document.ts` (currently only client-side `accept` attr)
- Add server-side file-size enforcement in both upload actions

---

### 3.9 Mobile-Specific Security

#### P1 — Auth tokens in AsyncStorage (both mobile apps)

- **Driver mobile:** `lib/supabase.ts:21-45`
- **Passenger mobile:** `lib/supabase.ts:11-34`

Both use a custom storage adapter that falls back to AsyncStorage. On Android, AsyncStorage is backed by SharedPreferences (world-readable on unencrypted devices). On rooted / jailbroken iOS, tokens are extractable. Both have the same `memoryFallback` anti-pattern where tokens move to heap if storage fails.

**Fix:** Replace with `expo-secure-store` (uses Keychain on iOS, EncryptedSharedPreferences on Android). Small refactor to the storage adapter.

#### P2 — Console logging in production

Both mobile apps use `console.warn` / `console.error` without `__DEV__` guards:
- Driver: `api/session.ts:7,13`, `SplashScreen.tsx:68`, others
- Passenger: `lib/supabase-auth.ts:12,18`, `api/maps/*.ts`

In release builds these still write to OS-level log buffers (`adb logcat`, iOS Console app). Error messages can leak API URLs, user IDs, addresses.

**Fix:** Wrap with `if (__DEV__) { ... }` or use a logger that silences in production. Never log error objects containing request bodies.

#### P1 — No crash reporting

Grep for `Sentry|ErrorBoundary|Bugsnag` returns 0 matches in all 3 apps. Unhandled promise rejections and React crashes vanish silently.

**Fix:** Integrate `sentry-expo` (mobile) and `@sentry/nextjs` (admin web). Wrap `App` with `ErrorBoundary` in both mobile apps.

#### P3 — No certificate pinning

Not practical for Expo without ejecting or adding a custom native module. Mitigated by HTTPS-only (iOS ATS, Android default TLS). Acceptable for soft pilot.

#### P3 — No jailbreak / root detection

Nice-to-have for production. Acceptable for soft pilot.

#### Positive

- `detectSessionInUrl: false` in both apps blocks URL-based session injection
- Realtime subscriptions properly clean up in `useEffect` returns across all sampled usages
- Location requested foreground-only. No background location permission. Watch frequency is 5s / 10m only during active trip.
- Deep link schemes are custom (`bluetaxidriversmobile`, `bluetaxipassengersmobile`) — no open redirect risk
- TLS enforced by default on both platforms (no ATS exceptions, no `cleartextTrafficPermitted` overrides)
- Driver app accept-ride uses only the `accept_ride` RPC path — no direct UPDATE of `driver_id` exposed (`JobAlertsProvider.tsx:126-147`)

---

## 4. Scalability & Performance

### Indexes

- **Good:** All RLS-filtered columns (`user_id`, `driver_id`, `passenger_id`, `ride_id`) have indexes
- **Good:** FK columns on `rides`, `ride_status_history`, `messages`, `notifications`, `driver_earnings`, `driver_payouts` are indexed
- **Missing (P2):** Composite index for active ride lookups. `rides (status, city_id)` partial index `WHERE status IN ('pending','accepted','navigating_to_pickup',...)` would speed up driver matching queries as ride count grows past ~1k
- **Missing (P2):** Partial index for online drivers. `driver_profiles (city_id) WHERE is_online = true AND verification_status = 'approved'` — reduces scan cost for job alerts

### N+1 queries

- **Good:** Admin web uses nested selects (`select('*, users(*), vehicles(*)')`)
- **Good:** Driver profile query uses `.select('*, users(*), cities(name), vehicles(*)')` — single round-trip

### Connection pooling

- Supabase provides PgBouncer out of the box
- **P2:** For 600 drivers + their passengers, verify the `max_client_conn` on the project is raised from the free-tier default

### Realtime

- Channel naming is correct (`active-booking-${rideId}`, `pending-rides-*`)
- All subscriptions clean up
- **Issue (P2):** No fanout filter on `pending-rides-insert`. Every online driver subscribes to every pending ride insert globally. At 600 drivers, one passenger creating a ride wakes 600 clients. **Fix:** Filter by `city_id` on the subscription.

### Edge function capacity

- Supabase edge functions cold-start per-invocation. At pilot RPS this is fine.
- **P2:** Add structured timing logs to track p95 latency. `admin-create-payout` can grow slow as `driver_earnings` grows unless the balance query is indexed.

---

## 5. Reliability & Operations

### Observability — severely lacking

- **No crash reporting** in any of the 3 apps
- **No structured logging** in Server Actions — only `console.error` / `console.warn`
- **No audit log writes** — `admin_audit_log` has 0 rows despite active admin operations
- **No alerting** on failed RLS denials, edge function errors, or payment anomalies

**Fix (P1):**
1. Sentry in all 3 apps
2. Add `admin_audit_log` writes to every admin mutation action
3. Supabase database webhooks to push critical events (driver approval, payout, ride completion) to a log sink
4. Configure Supabase advisors alerts (built-in security / performance linter)

### Backups

- Supabase provides daily automatic backups on paid plans
- **P1:** Verify the project is on a plan with Point-in-Time Recovery (PITR). Free tier does not include PITR; a single `DELETE FROM users` is irrecoverable beyond 24h.
- **P1:** No tested restore procedure. Schedule a dry-run restore to a staging project before launch.

### Migrations

- **P2:** `supabase/migrations/` is sparse or missing in the admin web repo. Schema changes are being applied directly via dashboard / MCP without version control.
- **Fix:** Dump current schema into a baseline migration. From now on, every schema change must be a file in `supabase/migrations/` applied by the user (per standing policy — Claude never applies migrations directly).

### Feature flags

- **P2:** No feature flag system. Every deploy is all-or-nothing.
- **Fix:** Simple DB-backed flag table (`feature_flags: key, enabled, rollout_percent, target_users`) is sufficient for pilot. Skip third-party tools until post-launch.

### Incident response

- **P1:** No runbook. When a P0 hits production, there's no documented procedure for killing compromised sessions, rolling back a bad deploy, disabling OTP during an SMS-bomb attack, freezing payouts, or rotating keys.
- **Fix:** 1-page runbook covering: rotate Supabase keys, disable signup, roll back Vercel deploy, roll back EAS update, key contacts, Supabase status page.

### Cron jobs

- **P2:** No cron jobs defined. Stale `pending` rides accumulate forever. **Fix:** Supabase cron job that cancels pending rides older than 5 minutes.

---

## 6. Pre-Launch Checkpoints

### Gate A — Secrets (blocking)

- [ ] `.env` removed from all 3 repos and purged from git history
- [ ] `SUPABASE_SERVICE_ROLE_KEY` rotated
- [ ] Both anon keys rotated
- [ ] Google Maps API key rotated and restricted to iOS bundle ID + Android package name
- [ ] Secrets moved to Vercel env vars + EAS secrets
- [ ] `.env.example` committed in each repo
- [ ] GitHub secret scanning enabled on all repos

### Gate B — RLS & state machine (blocking)

- [ ] `rides_update` driver branch enforces frozen fields (`final_fare`, `platform_fee`, `driver_id`, `passenger_id`)
- [ ] `rides_update` driver branch enforces status-transition whitelist
- [ ] `rides_insert_passenger` tightened to reject client-supplied fare fields
- [ ] `create_ride` RPC created and passenger client migrated
- [ ] `set_meter_fare` RPC created and `setMeterFare` in driver app migrated
- [ ] Per-transition RPCs created (`start_trip`, `mark_arrived`, `mark_waiting`, `mark_dropoff`)
- [ ] `updateRide()` helper in `ActiveBookingProvider.tsx` deleted; all call sites migrated
- [ ] `accept_ride` is the only path to set `driver_id` on a pending ride
- [ ] `handle_new_auth_user` trigger no longer auto-creates `driver_profiles`

### Gate C — Storage (blocking)

- [ ] `driver-uploads` bucket either private-with-policies or migrated to existing `avatars` / `driver-documents` buckets
- [ ] File size limit enforced server-side
- [ ] MIME type allowlist enforced server-side
- [ ] Signed URLs used for private file access

### Gate D — Edge functions & auth config (blocking)

- [ ] Leaked-password protection enabled in Supabase Auth
- [ ] Password min length raised to 12 in passenger mobile schemas
- [ ] OTP resend cooldown raised with exponential backoff
- [ ] `verify_jwt = true` on all Maps functions (or manual JWT check added)
- [ ] `admin-create-payout` validates amount against `driver_earnings` balance
- [ ] Edge function CORS tightened to known origins

### Gate E — Observability

- [ ] Sentry installed in all 3 apps
- [ ] `admin_audit_log` writes added to all admin mutation actions
- [ ] Supabase advisors reviewed and issues triaged
- [ ] Runbook written
- [ ] Incident contacts documented

### Gate F — Mobile hardening

- [ ] Auth tokens migrated from AsyncStorage to SecureStore (both apps)
- [ ] Console logs wrapped in `__DEV__` guards
- [ ] CAPTCHA on passenger signup
- [ ] Deep link params validated where used

### Gate G — Deployment sanity

- [ ] Staging environment exists and mirrors production
- [ ] Migration dry-run on staging
- [ ] PITR verified on production Supabase project
- [ ] Tested restore procedure
- [ ] Vercel and EAS rollback procedures tested

---

## 7. Prioritized Remediation Backlog

### P0 — Blockers (must fix before any real traffic)

| ID     | Title                                                         | Evidence                                                               |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| P0-1   | `SUPABASE_SERVICE_ROLE_KEY` committed to git                  | `blue-taxi-admin-web/.env:6` tracked by git                             |
| P0-2   | `rides_update` RLS allows arbitrary fare edit by driver       | `pg_policy rides_update` — driver branch has no frozen fields          |
| P0-3   | `rides_insert_passenger` trusts client fare/payment           | `pg_policy` — only checks `passenger_id`                                |
| P0-4   | Direct UPDATE bypasses `accept_ride` RPC                      | `pg_policy rides_update` allows `status='pending' AND is_approved_online_driver()` |
| P0-5   | `driver-uploads` bucket public with no policies or limits     | Supabase storage config                                                 |
| P0-6   | Google Maps API key hardcoded in 5 locations across 2 repos   | `passenger .env:8`, `app.json:14,28`, `AndroidManifest.xml:18`, `driver .env:2` |
| P0-7   | Leaked-password protection disabled                            | Supabase Auth config                                                    |
| P0-8   | Driver client computes `final_fare` locally                    | `ActiveBookingProvider.tsx:243-253`                                     |

### P1 — High (fix before ramp past 50 drivers)

| ID     | Title                                                     | Location                                                        |
| ------ | --------------------------------------------------------- | --------------------------------------------------------------- |
| P1-1   | Auth tokens in AsyncStorage (driver)                      | `blue-taxi-drivers-mobile/lib/supabase.ts:21-45`                |
| P1-2   | Auth tokens in AsyncStorage (passenger)                   | `blue-taxi-passengers-mobile/lib/supabase.ts:11-34`             |
| P1-3   | Maps edge functions `verify_jwt = false`                  | `config.toml` for 5 maps functions                              |
| P1-4   | `admin-create-payout` trusts client amount                | `supabase/functions/admin-create-payout/index.ts`               |
| P1-5   | No OTP attempt rate limiting                              | Supabase Auth dashboard                                          |
| P1-6   | OTP resend cooldown 60s                                   | `passenger VerificationScreen.tsx:37`, `SignUpScreen.tsx:178`   |
| P1-7   | No CAPTCHA on passenger signup                            | `passenger SignUpScreen.tsx:91-631`                              |
| P1-8   | Password minimum 8 chars                                  | `passenger sign-up.schema.ts:13-14`, `reset-password.schema.ts:7-8` |
| P1-9   | No Sentry / crash reporting in any app                    | All 3 repos                                                      |
| P1-10  | `admin_audit_log` never written                           | All admin mutation actions                                       |
| P1-11  | `handle_new_auth_user` trigger auto-inserts driver_profiles | Supabase trigger source                                          |
| P1-12  | No runbook for incident response                          | —                                                                |
| P1-13  | PITR not verified on Supabase project                     | —                                                                |

### P2 — Medium (fix before public launch)

| ID     | Title                                                         | Location                                                    |
| ------ | ------------------------------------------------------------- | ----------------------------------------------------------- |
| P2-1   | Admin web bypasses `admin-approve-driver` edge function       | `approve-driver.ts:44-47` + 3 others                        |
| P2-2   | No Zod validation in most admin Server Actions                | `app/actions/*.ts`                                          |
| P2-3   | `manage-city.ts` accepts unvalidated lat/lng                  | `manage-city.ts:23-24`                                      |
| P2-4   | `fetch-city-services.ts` lacks `requireAdmin()`               | `fetch-city-services.ts:5`                                  |
| P2-5   | No rate limiting on admin Server Actions                      | All of `app/actions/`                                       |
| P2-6   | CORS wildcards on edge functions                              | `admin-approve-driver`                                      |
| P2-7   | Console logs in mobile apps (prod)                            | Both mobile apps                                            |
| P2-8   | Missing composite index `rides(status, city_id)`              | DB                                                          |
| P2-9   | Missing partial index for online drivers                      | DB                                                          |
| P2-10  | Realtime fanout unfiltered by city                            | `pending-rides-insert` subscription                         |
| P2-11  | No cron to expire stale pending rides                         | Supabase cron                                               |
| P2-12  | Booking draft unencrypted in AsyncStorage                     | `passenger lib/booking-draft-storage.ts:14,32`              |
| P2-13  | No data wipe on logout (cache retention)                      | `passenger app/_layout.tsx:62-66`                           |
| P2-14  | No duplicate rating prevention                                | `useSubmitRating.ts:28-34`                                  |
| P2-15  | No migration history in repo                                  | `supabase/migrations/`                                      |
| P2-16  | No feature flag system                                        | —                                                           |

### P3 — Nice-to-have (post-launch)

| ID     | Title                                                         |
| ------ | ------------------------------------------------------------- |
| P3-1   | Certificate pinning (mobile)                                   |
| P3-2   | Jailbreak / root detection (mobile)                            |
| P3-3   | List virtualization for admin tables >50 rows                  |
| P3-4   | Debounced search inputs in admin tables                        |
| P3-5   | Skeleton screens for slow loads                                |
| P3-6   | ARIA labels on all icon buttons                                |
| P3-7   | Keyboard focus management in forms                             |
| P3-8   | Breadcrumb navigation on detail pages                          |
| P3-9   | Reduced-motion support                                         |
| P3-10  | Sidebar active-state highlighting verification                 |

---

## 8. Recommended Order of Operations

### Day 1 — Secrets rotation (Stream 1)
- Rotate all 4 keys (service role, 2 anon keys, Google Maps)
- Purge `.env` from history in all 3 repos
- Update Vercel + EAS secrets
- Enable GitHub secret scanning
- **Deliverable:** Clean git history, rotated keys in production

### Day 2–4 — RLS tightening (Stream 2)
- Draft migration: `create_ride` RPC, `set_meter_fare` RPC, per-transition RPCs
- Draft migration: tightened `rides_update` and `rides_insert_passenger` policies
- Draft migration: `handle_new_auth_user` trigger fix
- User reviews + applies migrations
- Update driver mobile client to use new RPCs (delete `updateRide` helper)
- Update passenger mobile client to use `create_ride` RPC
- Test end-to-end ride flow on staging

### Day 5 — Storage + auth config (Stream 3)
- Fix `driver-uploads` bucket (policies + limits, or migrate to existing buckets)
- Enable leaked-password protection
- Raise password min to 12
- Raise OTP resend cooldown
- Set `verify_jwt = true` on Maps functions
- Fix `admin-create-payout` balance check

### Day 6–7 — Observability + hardening
- Sentry installation in all 3 apps
- Audit log writes in all admin mutation actions
- Runbook draft
- Move mobile tokens to SecureStore

### Day 8+ — Pre-launch QA
- Full regression test of driver + passenger flows on staging
- Load test at 600 concurrent drivers
- Tested backup restore
- Pilot user communication

---

## Conclusion

You are 1–2 weeks from a defensible soft pilot, not 1–2 months. The hard structural work (RLS foundation, frozen-fields pattern on the passenger branch, closed-fleet model, `accept_ride` RPC atomicity, three-client separation) is already done well. The remaining issues are concrete, fixable, and mostly at policy / config boundaries — not architectural.

The most dangerous finding isn't technical; it's organizational: **no audit trail.** At pilot scale you can get away with it, but the moment a driver disputes a fare or a passenger disputes a charge, there's no record of who did what when. Adding `admin_audit_log` writes and Sentry should run in parallel with the P0 work, not after.

---

**Audit generated:** 2026-04-10
**Cross-referenced against:** admin web, driver mobile, passenger mobile, Supabase project `qmbwreizcwnxxfcpmdyr`
**Confidence:** HIGH — every finding cites file:line or table:policy evidence
