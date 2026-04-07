---
name: blue-taxi-planner
description: "BLOCKING REQUIREMENT — Invoke this skill BEFORE planning or implementing ANY feature, fix, or change in the Blue Taxi platform, regardless of scope. Explores admin-web, drivers-mobile, and passengers-mobile in parallel and produces a structured cross-repo implementation plan with DB migrations, file-level changes, and verification steps."
---

# Blue Taxi Cross-Repo Planner

**Announce at start:** "Using blue-taxi-planner to create a cross-repo implementation plan."

## This skill is RIGID — follow every phase exactly, in order. No skipping, no improvising.

---

## Hard Stop

Do NOT write any code, create any files (other than the plan), or modify any repo until Phase 3 is complete and the plan file is written.

---

## Ecosystem Reference

All three repos share one Supabase backend. Always keep this in mind when planning.

### Repo Paths (hardcoded)
```
Admin Web:     D:\Blue Taxi Code\blue-taxi-admin-web
Driver App:    D:\Blue Taxi Code\blue-taxi-drivers-mobile
Passenger App: D:\Blue Taxi Code\blue-taxi-passengers-mobile
Supabase:      qmbwreizcwnxxfcpmdyr.supabase.co  (PostgreSQL 17, ap-southeast-2)
```

### Stack Per Repo
| Repo | Framework | UI | State | Routing |
|---|---|---|---|---|
| admin-web | Next.js 16, TypeScript | Shadcn/ui + Tailwind v4 | Server Actions + revalidatePath | App Router |
| drivers-mobile | Expo 54 + React Native | NativeWind 4 | TanStack Query + React Context | Expo Router |
| passengers-mobile | Expo 54 + React Native | NativeWind 4 | TanStack Query + React Context | Expo Router |

### Core DB Tables (20 total)
```
users                  passenger_profiles     driver_profiles
vehicles               driver_documents       driver_locations
rides                  ride_status_history    ride_routes
ride_ratings           conversations          messages
notifications          driver_earnings        driver_payouts
commission_rates       fare_rules             platform_fees
cities                 admin_audit_log
```

### Ride State Machine (11 states — shared across all 3 apps)
```
pending → accepted → navigating_to_pickup → arrived_at_pickup →
waiting_for_passenger → trip_in_progress → dropped_off →
input_fare → fare_confirmed → completed
                    ↘ cancelled (from most states)
```

### Key Conventions Per Repo

**Admin Web** (`blue-taxi-admin-web`):
- Pages: `app/(dashboard)/<page>/page.tsx` — thin, just renders a container
- UI logic: `containers/<domain>/<ComponentName>.tsx` — fat containers own all state
- Server actions: `app/actions/<action-name>.ts` — one function per file, `requireAdmin()` guard, return `ActionResult<T>`
- Types: `types/<domain>.ts`
- Always use `createAdminClient()` for write actions, server client for reads
- `revalidatePath()` after any mutation

**Driver & Passenger Mobile Apps** (same pattern for both):
- Routes: `app/<screen>.tsx` or `app/(tabs)/<tab>.tsx` — thin, render a screen component
- UI logic: `screens/<feature>/<FeatureScreen>.tsx`
- API hooks: `api/<domain>/use<Feature>.ts` — TanStack Query hooks wrapping Supabase calls
- Contexts: `contexts/<domain>/<Domain>Provider.tsx` — for cross-screen state
- Realtime: use `subscribePostgresChanges()` helper in `lib/supabase-realtime.ts`
- Validation: Zod schemas in `forms/schemas/`

### RLS Rule
- Use **server client** (`lib/supabase/server.ts` in admin; `lib/supabase.ts` in mobile) for user-scoped ops — RLS applies
- Use **admin client** (`lib/supabase/admin-client.ts`) only when elevated access is genuinely needed
- Index every FK column; cache `auth.uid()` in policies with a subselect

---

## Phase 1 — Parallel Exploration

Launch **3 Explore agents simultaneously** (single message, multiple Agent tool calls).

Give each agent:
1. The feature description (exactly as the user stated it)
2. Its specific repo path
3. The focused search questions below

**Admin-web agent prompt:**
> Explore `D:\Blue Taxi Code\blue-taxi-admin-web` for the context needed to plan: [FEATURE]. Find: (1) which containers/ and actions/ files are most relevant, (2) any existing patterns this feature should follow, (3) which DB tables it will read/write, (4) any types/ that need updating. Return specific file paths and what each will need to change.

**Driver-app agent prompt:**
> Explore `D:\Blue Taxi Code\blue-taxi-drivers-mobile` for the context needed to plan: [FEATURE]. Find: (1) which screens/ and api/ files are most relevant, (2) any existing TanStack Query hooks or context patterns to follow, (3) which DB tables it will read/write, (4) any realtime subscriptions needed. Return specific file paths and what each will need to change.

**Passenger-app agent prompt:**
> Explore `D:\Blue Taxi Code\blue-taxi-passengers-mobile` for the context needed to plan: [FEATURE]. Find: (1) which screens/ and api/ files are most relevant, (2) any existing TanStack Query hooks or context patterns to follow, (3) which DB tables it will read/write, (4) any realtime subscriptions needed. Return specific file paths and what each will need to change.

**Wait for all 3 agents to return before starting Phase 2.**

---

## Phase 2 — Scope & Plan Design

Synthesize the 3 agent reports:

1. **Which repos are affected?** A feature may only touch 1 or 2 repos. Mark unaffected repos explicitly as "No changes needed" — do not omit them.

2. **DB changes needed?** Identify:
   - New tables or columns (use `bigint generated always as identity` for IDs, `timestamptz` for timestamps, `numeric(10,2)` for money)
   - New indexes (always index FK columns)
   - RLS policy additions or updates (cache `auth.uid()` in a subselect)
   - New triggers or functions

3. **Build order** (always in this sequence):
   ```
   DB migration → Admin Web → Driver App → Passenger App
   ```
   If a repo is unaffected, skip it in the sequence.

4. **For each affected repo:** map the exact file paths and what changes at each (new file vs. modification, and what the change is).

---

## Phase 3 — Write Plan File

Write the plan to:
```
docs/superpowers/plans/YYYY-MM-DD-<feature-kebab-case>-plan.md
```
in the **invoking repo** (whichever repo the user called this skill from).

Use this exact template:

---

```markdown
# Plan: [Feature Name]

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds and why.]

**Architecture:** [2-3 sentences on the approach: what pattern it follows, which parts of each repo change, and the data flow.]

**Tech Stack:** [List the key libraries/patterns used, e.g. "Next.js server actions, Supabase admin client, shadcn/ui Dialog"]

---

## Affected Repos
- [ ] blue-taxi-admin-web
- [ ] blue-taxi-drivers-mobile
- [ ] blue-taxi-passengers-mobile

*(Unchecked = no changes needed for this feature)*

---

## File Structure

```
New Files:
  [list new files with one-line purpose]

Modified Files:
  [list modified files with one-line description of change]
```

---

## Database Changes

[List every schema change:
- New tables with columns + types + constraints
- New columns on existing tables
- New indexes
- RLS policy additions/updates
- New triggers or functions
If none: "None required."]

---

## Build Sequence

### Step 1: Database Migration

- [ ] [Task: write and apply the migration SQL]

```sql
-- [SQL here]
```

### Step 2: Admin Web

- [ ] [Task: server action file — what it does]
- [ ] [Task: container component — what it renders/handles]
- [ ] [Task: update page or existing container to include new UI]
- [ ] [Additional tasks as needed]

### Step 3: Driver App

- [ ] [Task: API hook — what query/mutation it wraps]
- [ ] [Task: screen component — what it displays/handles]
- [ ] [Task: route file — thin wrapper]
- [ ] [Additional tasks as needed]

### Step 4: Passenger App

- [ ] [Same pattern as Driver App]

---

## Verification

1. **DB:** [What to check after migration — e.g. rows created, constraints enforced]
2. **Admin Web:** [What flow to exercise in the browser — e.g. navigate to X, click Y, verify Z]
3. **Driver App:** [What flow to test in the simulator — e.g. open screen X, perform action Y]
4. **Passenger App:** [What flow to test in the simulator]
```

---

After writing the plan file, tell the user:
> "Plan written to `docs/superpowers/plans/<filename>.md`. Review it, then invoke `superpowers:executing-plans` to start implementation."
