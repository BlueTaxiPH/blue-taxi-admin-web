# Blue Taxi PH — Database Infrastructure

> **Project:** Blue Taxi PH
> **Supabase Project ID:** `qmbwreizcwnxxfcpmdyr`
> **Region:** `ap-southeast-2` (Sydney)
> **PostgreSQL Version:** 17.6
> **Last Documented:** April 2026
>
> **Driver accounts:** Only admins can create driver accounts (Admin Dashboard server action with service role). The Driver App is sign-in only; RLS INSERT policies on `driver_profiles`, `vehicles`, and `driver_documents` were removed to prevent self-registration.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Ecosystem Components](#2-ecosystem-components)
3. [Database Configuration](#3-database-configuration)
4. [Extensions](#4-extensions)
5. [Enums](#5-enums)
6. [Table Reference](#6-table-reference)
7. [Indexes](#7-indexes)
8. [Foreign Key Constraints](#8-foreign-key-constraints)
9. [Database Functions](#9-database-functions)
10. [Triggers](#10-triggers)
11. [Row Level Security (RLS)](#11-row-level-security-rls)
12. [Edge Functions](#12-edge-functions)
13. [Realtime Architecture](#13-realtime-architecture)
14. [Data Flow: Ride Lifecycle](#14-data-flow-ride-lifecycle)
15. [Data Flow: Driver Onboarding](#15-data-flow-driver-onboarding)
16. [Data Flow: Driver Earnings & Payouts](#16-data-flow-driver-earnings--payouts)
17. [Security Model](#17-security-model)
18. [Environment Variables](#18-environment-variables)
19. [Known Issues & Recommendations](#19-known-issues--recommendations)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                              │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Passenger App   │  │   Driver App     │  │Admin Dashboard│ │
│  │  (React Native / │  │  (React Native / │  │  (Web App)   │  │
│  │   Expo Router)   │  │   Expo Router)   │  │              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
└───────────┼──────────────────── ┼────────────────────┼──────────┘
            │                     │                    │
            │         Supabase JS Client SDK           │
            │         (anon key / user JWT)            │
            ▼                     ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth (JWT)  │  │  REST API    │  │  Realtime (WebSocket)│  │
│  │  (GoTrue)    │  │  (PostgREST) │  │  (Phoenix Channels)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         ▼                 ▼                      ▼              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL 17 Database                       │   │
│  │  (RLS Policies · Triggers · Functions · PostGIS)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Edge Functions (Deno)                    │   │
│  │  maps-autocomplete · maps-nearby · maps-directions        │   │
│  │  maps-place-details · admin-approve-driver                │   │
│  │  admin-create-payout                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              External Services                            │   │
│  │  Google Maps Platform (Places API v2, Directions API)    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Ecosystem Components

### 2.1 Passenger App

- **Stack:** React Native, Expo Router, NativeWind, TanStack Query
- **Auth:** Supabase Auth (phone OTP or email/password)
- **Key operations:**
  - Browse and select pickup/dropoff locations via Maps Edge Functions
  - Create ride requests (INSERT into `rides`)
  - Receive real-time ride status updates via Supabase Realtime on `rides`
  - Chat with driver via `conversations` and `messages`
  - Rate completed rides via `ride_ratings`
  - View ride history and notifications

### 2.2 Driver App

- **Stack:** React Native, Expo Router, NativeWind, TanStack Query
- **Auth:** Supabase Auth — **sign-in only** (email/password). No sign-up or self-registration; driver accounts are created exclusively by admins.
- **Key operations:**
  - Sign in with credentials issued by admin (role check: only `role = 'driver'` may use the app)
  - Upload documents and register vehicles for an **existing** driver profile (created by admin)
  - Toggle online/offline status (`driver_profiles.is_online`)
  - Update current GPS location (`driver_locations`)
  - Accept pending rides via `accept_ride` RPC (atomic, race-condition-safe)
  - Progress through ride statuses (navigating → arrived → in-progress → dropped_off → input_fare → fare_confirmed → completed)
  - View earnings via `driver_earnings`
  - Chat with passenger via `conversations` and `messages` (lazy creation via `ensure_conversation_for_ride` RPC)

### 2.3 Admin Dashboard

- **Stack:** Web application (Next.js)
- **Auth:** Supabase Auth with `role = 'admin'` in `users`
- **Key operations:**
  - **Create driver accounts** — server action using service role: creates auth user (`auth.admin.createUser` with `user_metadata.role = 'driver'`), which fires `handle_new_auth_user` to create `users` + `driver_profiles`; optionally inserts initial `vehicles` row. Drivers then sign in with credentials shared or reset by admin.
  - Review and approve/reject driver applications via `admin-approve-driver` Edge Function
  - View and manage all rides, users, documents
  - Create driver payouts via `admin-create-payout` Edge Function
  - Configure commission rates and fare rules
  - Monitor system activity via `admin_audit_log`

### 2.4 Supabase Database

- PostgreSQL 17 with PostGIS, pgmq, pg_cron, pg_net
- 20 tables, all with RLS enabled
- 10 custom enums
- 14 functions (including 2 RPCs)
- 15 triggers across 8 tables

### 2.5 Edge Functions

- 6 active Deno functions (see [Section 12](#12-edge-functions))
- 4 Maps proxy functions (JWT verification disabled — rely on API key secrecy)
- 2 Admin functions (JWT verification enabled — require authenticated admin token)

---

## 3. Database Configuration

| Property             | Value                                  |
| -------------------- | -------------------------------------- |
| Engine               | PostgreSQL 17                          |
| Host                 | `db.qmbwreizcwnxxfcpmdyr.supabase.co`  |
| Release Channel      | GA (Generally Available)               |
| Schema               | `public`                               |
| Auth Schema          | `auth` (managed by Supabase)           |
| Realtime Publication | `supabase_realtime` (6 tables)         |

---

## 4. Extensions

| Extension            | Version | Purpose                                                                                                    |
| -------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `postgis`            | 3.3.7   | Geospatial data types (`geography`) and spatial indexing (`GIST`) for driver location and ride coordinates |
| `pg_cron`            | 1.6.4   | Scheduled database jobs (notifications cleanup)                                                            |
| `pg_net`             | 0.19.5  | Async HTTP requests from within PostgreSQL functions                                                       |
| `pg_stat_statements` | 1.11    | Query performance tracking and slow query detection                                                        |
| `pgmq`               | 1.5.1   | Postgres Message Queue for async job processing (installed, no queues defined yet)                         |
| `pgcrypto`           | 1.3     | Cryptographic functions                                                                                    |
| `pg_graphql`         | 1.5.11  | Automatic GraphQL API generation from schema                                                               |
| `supabase_vault`     | 0.3.1   | Encrypted secrets storage                                                                                  |
| `uuid-ossp`          | 1.1     | UUID generation (supplemented by `gen_random_uuid()`)                                                      |
| `plpgsql`            | 1.0     | PL/pgSQL procedural language                                                                               |

---

## 5. Enums

All enums are defined in the `public` schema.

### `user_role`

Assigned to every row in `users`. Drives RLS policy branching across the entire schema.

| Value       | Description                                   |
| ----------- | --------------------------------------------- |
| `passenger` | Regular ride-booking user                     |
| `driver`    | Driver subject to verification workflow       |
| `admin`     | Platform operator with full read/write access |

### `driver_verification_status`

Tracks a driver's onboarding approval state.

| Value          | Description                                 |
| -------------- | ------------------------------------------- |
| `pending`      | Freshly registered, no documents submitted  |
| `under_review` | Documents submitted, awaiting admin review  |
| `approved`     | Cleared to go online and accept rides       |
| `rejected`     | Application denied by admin                 |
| `suspended`    | Previously approved, now suspended by admin |

### `ride_status`

The full state machine for a single ride (11 values).

| Value                   | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `pending`               | Ride created, awaiting driver acceptance           |
| `accepted`              | A driver has accepted the ride                     |
| `navigating_to_pickup`  | Driver en route to passenger pickup location       |
| `arrived_at_pickup`     | Driver has reached the pickup location             |
| `waiting_for_passenger` | Driver is waiting at the pickup point              |
| `trip_in_progress`      | Passenger is in the vehicle, trip underway         |
| `dropped_off`           | Passenger dropped off, awaiting fare input         |
| `input_fare`            | Driver entering meter fare amount                  |
| `fare_confirmed`        | Fare confirmed, awaiting payment completion        |
| `completed`             | Trip finished successfully                         |
| `cancelled`             | Ride was cancelled by passenger, driver, or system |

### `cancellation_actor`

Records who cancelled a ride.

| Value       |
| ----------- |
| `passenger` |
| `driver`    |
| `system`    |

### `vehicle_type`

Vehicle category affecting fare calculation and commission rates.

| Value   | Description                |
| ------- | -------------------------- |
| `basic` | Standard 4-seater          |
| `xl`    | Larger vehicle (SUV / van) |

### `driver_document_type`

Document categories required for driver verification (Philippines-specific).

| Value             | Description                     |
| ----------------- | ------------------------------- |
| `drivers_license` | LTO Driver's License            |
| `lto_or`          | LTO Official Receipt            |
| `lto_cr`          | LTO Certificate of Registration |
| `nbi_clearance`   | NBI Clearance                   |
| `vehicle_photo`   | Photo of the vehicle            |
| `selfie_with_id`  | Selfie with valid government ID |

### `fare_type`

| Value        | Description                                   |
| ------------ | --------------------------------------------- |
| `metered`    | Fare calculated by distance/time meter        |
| `input_fare` | Driver manually inputs the fare amount        |
| `estimated`  | Upfront estimated fare shown before booking   |

### `payment_method`

| Value   |
| ------- |
| `cash`  |
| `gcash` |
| `maya`  |
| `card`  |

### `notification_type`

| Value              |
| ------------------ |
| `ride_request`     |
| `ride_accepted`    |
| `ride_cancelled`   |
| `trip_completed`   |
| `message_received` |
| `payout_processed` |
| `system`           |

### `payout_status`

| Value        |
| ------------ |
| `pending`    |
| `processing` |
| `paid`       |
| `failed`     |

---

## 6. Table Reference

### `users`

Central identity table. Every authenticated user in `auth.users` has exactly one corresponding row here. (11 rows)

| Column       | Type          | Nullable | Default | Notes                                       |
| ------------ | ------------- | -------- | ------- | ------------------------------------------- |
| `id`         | `uuid`        | NO       | —       | PK; FK → `auth.users(id)` ON DELETE CASCADE |
| `role`       | `user_role`   | NO       | —       | `passenger`, `driver`, or `admin`           |
| `first_name` | `text`        | NO       | —       |                                             |
| `last_name`  | `text`        | NO       | —       |                                             |
| `email`      | `text`        | NO       | —       | UNIQUE                                      |
| `phone`      | `text`        | NO       | —       | UNIQUE                                      |
| `photo_url`  | `text`        | YES      | —       | Profile photo URL (Supabase Storage)        |
| `is_active`  | `boolean`     | NO       | `true`  | Soft-disable account                        |
| `created_at` | `timestamptz` | NO       | `now()` |                                             |
| `updated_at` | `timestamptz` | NO       | `now()` | Maintained by `set_updated_at` trigger      |

**Indexes:** `users_pkey` (id), `users_email_key` (email UNIQUE), `users_phone_key` (phone UNIQUE)

---

### `driver_profiles`

One-to-one extension of `users` for driver-specific data, including online session tracking. (4 rows)

| Column                | Type                         | Nullable | Default             | Notes                                                     |
| --------------------- | ---------------------------- | -------- | ------------------- | --------------------------------------------------------- |
| `id`                  | `uuid`                       | NO       | `gen_random_uuid()` | PK                                                        |
| `user_id`             | `uuid`                       | NO       | —                   | UNIQUE FK → `users(id)` ON DELETE CASCADE                 |
| `verification_status` | `driver_verification_status` | NO       | `'pending'`         |                                                           |
| `is_online`           | `boolean`                    | NO       | `false`             | Driver available to receive rides                         |
| `avg_rating`          | `numeric`                    | NO       | `0.00`              | Updated by `update_avg_rating` trigger (incremental)      |
| `rating_count`        | `integer`                    | NO       | `0`                 | Number of ratings received; used for incremental avg calc |
| `total_rides`         | `integer`                    | NO       | `0`                 | Updated by `create_driver_earnings_on_completion` trigger |
| `approved_at`         | `timestamptz`                | YES      | —                   | Set when admin approves                                   |
| `approved_by`         | `uuid`                       | YES      | —                   | FK → `users(id)`                                          |
| `current_location`    | `geography(Point, 4326)`     | YES      | —                   | Live GPS position; updated by Driver App                  |
| `online_started_at`   | `timestamptz`                | YES      | —                   | Timestamp when current online session started. NULL when offline |
| `created_at`          | `timestamptz`                | NO       | `now()`             |                                                           |
| `updated_at`          | `timestamptz`                | NO       | `now()`             |                                                           |

**Indexes:** `driver_profiles_pkey` (id), `driver_profiles_user_id_key` (user_id UNIQUE), `driver_profiles_location_idx` GIST (current_location), `driver_profiles_approved_by_idx` (approved_by), `driver_profiles_online_approved_idx` (user_id WHERE is_online = true AND verification_status = 'approved')

---

### `passenger_profiles`

One-to-one extension of `users` for passenger-specific data. (6 rows)

| Column         | Type          | Nullable | Default             | Notes                                                     |
| -------------- | ------------- | -------- | ------------------- | --------------------------------------------------------- |
| `id`           | `uuid`        | NO       | `gen_random_uuid()` | PK                                                        |
| `user_id`      | `uuid`        | NO       | —                   | UNIQUE FK → `users(id)` ON DELETE CASCADE                 |
| `avg_rating`   | `numeric`     | NO       | `0.00`              | Updated by `update_avg_rating` trigger (incremental)      |
| `rating_count` | `integer`     | NO       | `0`                 | Number of ratings received; used for incremental avg calc |
| `total_rides`  | `integer`     | NO       | `0`                 | Updated by `create_driver_earnings_on_completion` trigger |
| `created_at`   | `timestamptz` | NO       | `now()`             |                                                           |
| `updated_at`   | `timestamptz` | NO       | `now()`             |                                                           |

**Indexes:** `passenger_profiles_pkey` (id), `passenger_profiles_user_id_key` (user_id UNIQUE)

---

### `vehicles`

A driver may register multiple vehicles but only one can be active at a time (enforced by partial unique index). (3 rows)

| Column         | Type           | Nullable | Default             | Notes                                         |
| -------------- | -------------- | -------- | ------------------- | --------------------------------------------- |
| `id`           | `uuid`         | NO       | `gen_random_uuid()` | PK                                            |
| `driver_id`    | `uuid`         | NO       | —                   | FK → `driver_profiles(id)` ON DELETE CASCADE  |
| `type`         | `vehicle_type` | NO       | —                   | `basic` or `xl`                               |
| `plate_number` | `text`         | NO       | —                   | UNIQUE across all vehicles                    |
| `make`         | `text`         | NO       | —                   | e.g., "Toyota"                                |
| `model`        | `text`         | NO       | —                   | e.g., "Vios"                                  |
| `year`         | `smallint`     | NO       | —                   | CHECK: year >= 1990 AND year <= current year + 1 |
| `color`        | `text`         | NO       | —                   |                                               |
| `is_active`    | `boolean`      | NO       | `true`              | At most one active vehicle per driver         |
| `is_verified`  | `boolean`      | NO       | `false`             | Set true by admin after document verification |
| `created_at`   | `timestamptz`  | NO       | `now()`             |                                               |
| `updated_at`   | `timestamptz`  | NO       | `now()`             |                                               |

**Indexes:** `vehicles_pkey`, `vehicles_plate_number_key` (UNIQUE), `vehicles_one_active_per_driver` (UNIQUE on `driver_id` WHERE `is_active = true`)

---

### `driver_documents`

Stores the uploaded document URLs for driver verification. Each document type maps to a file in Supabase Storage. (1 row)

| Column             | Type                   | Nullable | Default             | Notes                                        |
| ------------------ | ---------------------- | -------- | ------------------- | -------------------------------------------- |
| `id`               | `uuid`                 | NO       | `gen_random_uuid()` | PK                                           |
| `driver_id`        | `uuid`                 | NO       | —                   | FK → `driver_profiles(id)` ON DELETE CASCADE |
| `document_type`    | `driver_document_type` | NO       | —                   |                                              |
| `file_url`         | `text`                 | NO       | —                   | Supabase Storage URL                         |
| `is_verified`      | `boolean`              | NO       | `false`             | Set true by admin                            |
| `verified_by`      | `uuid`                 | YES      | —                   | FK → `users(id)`                             |
| `verified_at`      | `timestamptz`          | YES      | —                   |                                              |
| `rejection_reason` | `text`                 | YES      | —                   | Admin rejection note                         |
| `created_at`       | `timestamptz`          | NO       | `now()`             |                                              |
| `updated_at`       | `timestamptz`          | NO       | `now()`             |                                              |

**Indexes:** `driver_documents_pkey`, `driver_documents_driver_id_idx` (driver_id), `driver_documents_verified_by_idx` (verified_by)

---

### `rides`

The core operational table. Contains the complete record of every ride request from creation through completion or cancellation. `pickup_location` and `dropoff_location` are generated columns computed from their respective lat/lng pairs. (228 rows)

| Column                 | Type                     | Nullable | Default             | Notes                                      |
| ---------------------- | ------------------------ | -------- | ------------------- | ------------------------------------------ |
| `id`                   | `uuid`                   | NO       | `gen_random_uuid()` | PK                                         |
| `passenger_id`         | `uuid`                   | NO       | —                   | FK → `users(id)` ON DELETE RESTRICT        |
| `driver_id`            | `uuid`                   | YES      | —                   | FK → `users(id)` — set on acceptance       |
| `vehicle_id`           | `uuid`                   | YES      | —                   | FK → `vehicles(id)` — set on acceptance    |
| `status`               | `ride_status`            | NO       | `'pending'`         | Full ride state machine (11 values)        |
| `pickup_address`       | `text`                   | NO       | —                   | Human-readable address                     |
| `pickup_lat`           | `numeric`                | NO       | —                   |                                            |
| `pickup_lng`           | `numeric`                | NO       | —                   |                                            |
| `pickup_place_id`      | `text`                   | YES      | —                   | Google Place ID                            |
| `pickup_note`          | `text`                   | YES      | —                   | Passenger instructions                     |
| `dropoff_address`      | `text`                   | NO       | —                   |                                            |
| `dropoff_lat`          | `numeric`                | NO       | —                   |                                            |
| `dropoff_lng`          | `numeric`                | NO       | —                   |                                            |
| `dropoff_place_id`     | `text`                   | YES      | —                   | Google Place ID                            |
| `distance_meters`      | `integer`                | YES      | —                   | CHECK: >= 0. Route distance from Directions API |
| `duration_seconds`     | `integer`                | YES      | —                   | CHECK: >= 0. Estimated trip duration       |
| `route_polyline`       | `text`                   | YES      | —                   | Nullified on INSERT; extracted to `ride_routes` by trigger |
| `fare_type`            | `fare_type`              | YES      | —                   | `metered`, `input_fare`, or `estimated`    |
| `estimated_fare`       | `numeric`                | YES      | —                   | CHECK: > 0. Pre-trip fare estimate         |
| `final_fare`           | `numeric`                | YES      | —                   | CHECK: > 0. Actual fare = meter input + platform_fee |
| `platform_fee`         | `numeric`                | YES      | —                   | Platform fee frozen at ride completion     |
| `payment_method`       | `payment_method`         | YES      | —                   |                                            |
| `commission_rate_id`   | `uuid`                   | YES      | —                   | FK → `commission_rates(id)`                |
| `fare_rule_id`         | `uuid`                   | YES      | —                   | FK → `fare_rules(id)`                      |
| `accepted_at`          | `timestamptz`            | YES      | —                   | When driver accepted                       |
| `arrived_at_pickup_at` | `timestamptz`            | YES      | —                   | When driver arrived                        |
| `trip_started_at`      | `timestamptz`            | YES      | —                   | When trip began                            |
| `dropped_off_at`       | `timestamptz`            | YES      | —                   | When passenger was dropped off             |
| `trip_completed_at`    | `timestamptz`            | YES      | —                   | When trip ended                            |
| `cancelled_at`         | `timestamptz`            | YES      | —                   |                                            |
| `cancelled_by`         | `cancellation_actor`     | YES      | —                   | `passenger`, `driver`, or `system`         |
| `cancellation_reason`  | `text`                   | YES      | —                   | Free-text reason                           |
| `created_at`           | `timestamptz`            | NO       | `now()`             |                                            |
| `updated_at`           | `timestamptz`            | NO       | `now()`             |                                            |
| `pickup_location`      | `geography(Point, 4326)` | YES      | GENERATED           | Computed from `pickup_lat`, `pickup_lng`   |
| `dropoff_location`     | `geography(Point, 4326)` | YES      | GENERATED           | Computed from `dropoff_lat`, `dropoff_lng` |

**Indexes:** `rides_pkey`, `rides_passenger_id_idx`, `rides_driver_id_idx`, `rides_vehicle_id_idx`, `rides_status_idx`, `rides_created_at_idx` (created_at DESC), `rides_pickup_location_idx` (GIST), `rides_pending_pickup_location_idx` (GIST on pickup_location WHERE status = 'pending')
**Realtime:** YES — included in `supabase_realtime` publication

---

### `ride_status_history`

Append-only audit log. One row is written for every ride status transition. The initial `pending` status is also recorded on ride creation. (1,084 rows)

| Column       | Type          | Nullable | Default             | Notes                                                  |
| ------------ | ------------- | -------- | ------------------- | ------------------------------------------------------ |
| `id`         | `uuid`        | NO       | `gen_random_uuid()` | PK                                                     |
| `ride_id`    | `uuid`        | NO       | —                   | FK → `rides(id)` ON DELETE CASCADE                     |
| `status`     | `ride_status` | NO       | —                   | The new status                                         |
| `changed_by` | `uuid`        | YES      | —                   | FK → `users(id)` — `NULL` for system-triggered changes |
| `changed_at` | `timestamptz` | NO       | `now()`             |                                                        |

**Indexes:** `ride_status_history_pkey`, `ride_status_history_ride_id_idx`, `ride_status_history_changed_at_idx` (changed_at DESC), `ride_status_history_changed_by_idx` (changed_by)

---

### `ride_routes`

Stores route polylines extracted from `rides` on INSERT by a trigger pair. Keeps large polyline data out of the main `rides` row to reduce Realtime payload size. (0 rows)

| Column       | Type          | Nullable | Default             | Notes                      |
| ------------ | ------------- | -------- | ------------------- | -------------------------- |
| `ride_id`    | `uuid`        | NO       | —                   | PK; FK → `rides(id)` ON DELETE CASCADE |
| `polyline`   | `text`        | NO       | —                   | Encoded Google Maps polyline |
| `created_at` | `timestamptz` | NO       | `now()`             |                            |

**Indexes:** `ride_routes_pkey` (ride_id)

---

### `job_alerts`

Driver-defined geographic zones. When a new ride is created in an alert area, the driver can be notified. (0 rows)

| Column       | Type          | Nullable | Default             | Notes                                        |
| ------------ | ------------- | -------- | ------------------- | -------------------------------------------- |
| `id`         | `uuid`        | NO       | `gen_random_uuid()` | PK                                           |
| `driver_id`  | `uuid`        | NO       | —                   | FK → `driver_profiles(id)` ON DELETE CASCADE |
| `label`      | `text`        | NO       | —                   | Display name for the alert zone              |
| `area_lat`   | `numeric`     | YES      | —                   | Center latitude of alert zone                |
| `area_lng`   | `numeric`     | YES      | —                   | Center longitude of alert zone               |
| `radius_km`  | `numeric`     | NO       | `5.0`               | Alert radius in kilometers                   |
| `is_active`  | `boolean`     | NO       | `true`              |                                              |
| `created_at` | `timestamptz` | NO       | `now()`             |                                              |
| `updated_at` | `timestamptz` | NO       | `now()`             |                                              |
| `deleted_at` | `timestamptz` | YES      | —                   | Soft-delete timestamp                        |

**Indexes:** `job_alerts_pkey`, `job_alerts_driver_id_idx`, `job_alerts_active_driver_idx` (driver_id WHERE deleted_at IS NULL AND is_active = true)

---

### `ride_ratings`

Bidirectional rating system. After a ride is completed, both the passenger and driver can rate each other. One rating per person per ride (enforced by unique constraint on `ride_id, rater_id`). (52 rows)

| Column       | Type          | Nullable | Default             | Notes                                 |
| ------------ | ------------- | -------- | ------------------- | ------------------------------------- |
| `id`         | `uuid`        | NO       | `gen_random_uuid()` | PK                                    |
| `ride_id`    | `uuid`        | NO       | —                   | FK → `rides(id)` ON DELETE CASCADE    |
| `rater_id`   | `uuid`        | NO       | —                   | FK → `users(id)` — who is rating      |
| `ratee_id`   | `uuid`        | NO       | —                   | FK → `users(id)` — who is being rated |
| `rating`     | `smallint`    | NO       | —                   | 1–5 (enforced by CHECK constraint)    |
| `comments`   | `text`        | YES      | —                   | Optional free-text feedback           |
| `created_at` | `timestamptz` | NO       | `now()`             |                                       |

**Constraints:** `CHECK (rating >= 1 AND rating <= 5)`, UNIQUE `(ride_id, rater_id)`
**Indexes:** `ride_ratings_pkey`, `ride_ratings_ride_id_rater_id_key`, `ride_ratings_ratee_id_idx`, `ride_ratings_rater_id_idx`

---

### `conversations`

One conversation record per ride. Created lazily via `ensure_conversation_for_ride` RPC when either party sends a message. Links the passenger and driver for in-app chat. (30 rows)

| Column            | Type          | Nullable | Default             | Notes                                    |
| ----------------- | ------------- | -------- | ------------------- | ---------------------------------------- |
| `id`              | `uuid`        | NO       | `gen_random_uuid()` | PK                                       |
| `passenger_id`    | `uuid`        | NO       | —                   | FK → `users(id)`                         |
| `driver_id`       | `uuid`        | NO       | —                   | FK → `users(id)`                         |
| `ride_id`         | `uuid`        | YES      | —                   | UNIQUE FK → `rides(id)`                  |
| `last_message_at` | `timestamptz` | YES      | —                   | Updated by `on_message_inserted` trigger |
| `created_at`      | `timestamptz` | NO       | `now()`             |                                          |

**Constraints:** UNIQUE `(passenger_id, driver_id, ride_id)`, UNIQUE `(ride_id)`
**Indexes:** `conversations_pkey`, `conversations_passenger_id_idx`, `conversations_driver_id_idx`, `conversations_ride_id_key`, `conversations_passenger_id_driver_id_ride_id_key`
**Realtime:** YES

---

### `messages`

Individual chat messages within a conversation. (37 rows)

| Column            | Type          | Nullable | Default             | Notes                                      |
| ----------------- | ------------- | -------- | ------------------- | ------------------------------------------ |
| `id`              | `uuid`        | NO       | `gen_random_uuid()` | PK                                         |
| `conversation_id` | `uuid`        | NO       | —                   | FK → `conversations(id)` ON DELETE CASCADE |
| `sender_id`       | `uuid`        | NO       | —                   | FK → `users(id)`                           |
| `text`            | `text`        | NO       | —                   | Message body                               |
| `read_at`         | `timestamptz` | YES      | —                   | When the recipient read the message        |
| `created_at`      | `timestamptz` | NO       | `now()`             |                                            |

**Indexes:** `messages_pkey`, `messages_conversation_id_idx`, `messages_created_at_idx`, `messages_sender_id_idx`
**Realtime:** YES

---

### `notifications`

Persistent record of all notifications sent to users. The `data` JSONB field carries context-specific payload per notification type. (0 rows)

| Column       | Type                | Nullable | Default             | Notes                                                |
| ------------ | ------------------- | -------- | ------------------- | ---------------------------------------------------- |
| `id`         | `uuid`              | NO       | `gen_random_uuid()` | PK                                                   |
| `user_id`    | `uuid`              | NO       | —                   | FK → `users(id)` ON DELETE CASCADE                   |
| `type`       | `notification_type` | NO       | —                   | Categorizes the notification                         |
| `title`      | `text`              | NO       | —                   | Notification title                                   |
| `body`       | `text`              | NO       | —                   | Notification body text                               |
| `data`       | `jsonb`             | YES      | —                   | Type-specific context (e.g., `ride_id`, `payout_id`) |
| `read_at`    | `timestamptz`       | YES      | —                   | NULL = unread                                        |
| `created_at` | `timestamptz`       | NO       | `now()`             |                                                      |

**Indexes:** `notifications_pkey`, `notifications_user_id_idx`, `notifications_read_at_idx` (partial: on `(user_id, read_at)` WHERE `read_at IS NULL`)
**Realtime:** YES

---

### `driver_locations`

Dedicated table for high-frequency driver position writes. Separated from `driver_profiles` to avoid write contention on a heavily-read table. (0 rows)

| Column      | Type                     | Nullable | Default | Notes                                                |
| ----------- | ------------------------ | -------- | ------- | ---------------------------------------------------- |
| `driver_id` | `uuid`                   | NO       | —       | PK; FK → `driver_profiles(id)` ON DELETE CASCADE     |
| `location`  | `geography(Point, 4326)` | NO       | —       | Current GPS position                                 |
| `bearing`   | `numeric`                | YES      | —       | Heading in degrees                                   |
| `speed_kmh` | `numeric`                | YES      | —       | Current speed in km/h                                |
| `updated_at`| `timestamptz`            | NO       | `now()` |                                                      |

**Indexes:** `driver_locations_pkey` (driver_id), `driver_locations_location_idx` (GIST on location)
**Realtime:** YES

---

### `driver_earnings`

One earnings record per completed ride. Created automatically by the `on_ride_completed` trigger. Uses `platform_fee` from the ride (frozen at completion). (60 rows)

| Column              | Type            | Nullable | Default             | Notes                                                     |
| ------------------- | --------------- | -------- | ------------------- | --------------------------------------------------------- |
| `id`                | `uuid`          | NO       | `gen_random_uuid()` | PK                                                        |
| `driver_id`         | `uuid`          | NO       | —                   | FK → `driver_profiles(id)`                                |
| `ride_id`           | `uuid`          | NO       | —                   | UNIQUE FK → `rides(id)`                                   |
| `gross_amount`      | `numeric`       | NO       | —                   | Total fare amount (`final_fare`)                          |
| `commission_rate`   | `numeric`       | NO       | —                   | CHECK: 0–1. Currently 0 (platform_fee model)             |
| `commission_amount` | `numeric`       | NO       | —                   | Equal to `platform_fee` from ride                         |
| `net_amount`        | `numeric`       | NO       | —                   | `gross_amount − commission_amount`                        |
| `payout_status`     | `payout_status` | NO       | `'pending'`         |                                                           |
| `payout_id`         | `uuid`          | YES      | —                   | FK → `driver_payouts(id)` — set when included in a payout |
| `created_at`        | `timestamptz`   | NO       | `now()`             |                                                           |

**Indexes:** `driver_earnings_pkey`, `driver_earnings_ride_id_key` (UNIQUE), `driver_earnings_driver_id_idx`, `driver_earnings_payout_status_idx`, `driver_earnings_payout_id_idx`

---

### `driver_payouts`

Payout batch records created by admin. After creating a payout, the admin links individual `driver_earnings` rows to it by updating `driver_earnings.payout_id`. (0 rows)

| Column             | Type             | Nullable | Default             | Notes                                  |
| ------------------ | ---------------- | -------- | ------------------- | -------------------------------------- |
| `id`               | `uuid`           | NO       | `gen_random_uuid()` | PK                                     |
| `driver_id`        | `uuid`           | NO       | —                   | FK → `driver_profiles(id)`             |
| `total_amount`     | `numeric`        | NO       | —                   | Total payout amount                    |
| `status`           | `payout_status`  | NO       | `'pending'`         |                                        |
| `payment_method`   | `payment_method` | YES      | —                   | Uses `payment_method` enum             |
| `reference_number` | `text`           | YES      | —                   | External payment reference             |
| `processed_by`     | `uuid`           | YES      | —                   | FK → `users(id)` — admin who processed |
| `processed_at`     | `timestamptz`    | YES      | —                   |                                        |
| `created_at`       | `timestamptz`    | NO       | `now()`             |                                        |

**Indexes:** `driver_payouts_pkey`, `driver_payouts_driver_id_idx`, `driver_payouts_status_idx`, `driver_payouts_processed_by_idx`

---

### `commission_rates`

Admin-configurable commission rates per vehicle type. Uses `effective_from`/`effective_to` for temporal versioning. (2 rows)

| Column           | Type           | Nullable | Default             | Notes                                |
| ---------------- | -------------- | -------- | ------------------- | ------------------------------------ |
| `id`             | `uuid`         | NO       | `gen_random_uuid()` | PK                                   |
| `vehicle_type`   | `vehicle_type` | NO       | —                   | `basic` or `xl`                      |
| `rate`           | `numeric`      | NO       | —                   | CHECK: > 0 AND < 1                   |
| `effective_from` | `timestamptz`  | NO       | `now()`             |                                      |
| `effective_to`   | `timestamptz`  | YES      | —                   | NULL = currently active              |
| `created_by`     | `uuid`         | YES      | —                   | FK → `users(id)` — admin who created |
| `created_at`     | `timestamptz`  | NO       | `now()`             |                                      |

**Indexes:** `commission_rates_pkey`, `commission_rates_vehicle_type_effective_idx` (vehicle_type, effective_from DESC)

---

### `fare_rules`

Admin-configurable fare calculation rules per vehicle type. Uses temporal versioning. (0 rows)

| Column            | Type           | Nullable | Default             | Notes                                |
| ----------------- | -------------- | -------- | ------------------- | ------------------------------------ |
| `id`              | `uuid`         | NO       | `gen_random_uuid()` | PK                                   |
| `vehicle_type`    | `vehicle_type` | NO       | —                   | `basic` or `xl`                      |
| `base_fare`       | `numeric`      | NO       | —                   | CHECK: >= 0                          |
| `per_km_rate`     | `numeric`      | NO       | —                   | CHECK: >= 0                          |
| `per_minute_rate` | `numeric`      | NO       | —                   | CHECK: >= 0                          |
| `minimum_fare`    | `numeric`      | NO       | —                   | CHECK: >= 0                          |
| `effective_from`  | `timestamptz`  | NO       | `now()`             |                                      |
| `effective_to`    | `timestamptz`  | YES      | —                   | NULL = currently active              |
| `created_by`      | `uuid`         | YES      | —                   | FK → `users(id)` — admin who created |
| `created_at`      | `timestamptz`  | NO       | `now()`             |                                      |

**Indexes:** `fare_rules_pkey`, `fare_rules_vehicle_type_effective_idx` (vehicle_type, effective_from DESC)

---

### `platform_fees`

Admin-configurable platform fee. Only one row may be active at a time (enforced by partial unique index). (1 row)

| Column       | Type          | Nullable | Default             | Notes                                  |
| ------------ | ------------- | -------- | ------------------- | -------------------------------------- |
| `id`         | `uuid`        | NO       | `gen_random_uuid()` | PK                                     |
| `fee_amount` | `numeric`     | NO       | —                   | CHECK: >= 0                            |
| `label`      | `text`        | NO       | `'Platform Fee'`    | Display label                          |
| `is_active`  | `boolean`     | NO       | `false`             | Only one row can be active             |
| `created_by` | `uuid`        | YES      | —                   | FK → `users(id)` — admin who created   |
| `created_at` | `timestamptz` | NO       | `now()`             |                                        |
| `updated_at` | `timestamptz` | NO       | `now()`             |                                        |

**Indexes:** `platform_fees_pkey`, `platform_fees_one_active` (UNIQUE on is_active WHERE is_active = true)

---

### `admin_audit_log`

Audit trail for admin operations with before/after JSONB snapshots. (0 rows)

| Column       | Type          | Nullable | Default             | Notes                             |
| ------------ | ------------- | -------- | ------------------- | --------------------------------- |
| `id`         | `uuid`        | NO       | `gen_random_uuid()` | PK                                |
| `admin_id`   | `uuid`        | NO       | —                   | FK → `users(id)`                  |
| `action`     | `text`        | NO       | —                   | Action description                |
| `table_name` | `text`        | NO       | —                   | Affected table                    |
| `record_id`  | `uuid`        | NO       | —                   | Affected row ID                   |
| `old_value`  | `jsonb`       | YES      | —                   | Before state                      |
| `new_value`  | `jsonb`       | YES      | —                   | After state                       |
| `ip_address` | `text`        | YES      | —                   | Caller IP                         |
| `created_at` | `timestamptz` | NO       | `now()`             |                                   |

**Indexes:** `admin_audit_log_pkey`, `admin_audit_log_admin_id_idx`, `admin_audit_log_created_at_idx` (created_at DESC), `admin_audit_log_table_record_idx` (table_name, record_id)

---

## 7. Indexes

### Complete Index Inventory

| Table                 | Index Name                                         | Type         | Columns                              | Partial?                                                 |
| --------------------- | -------------------------------------------------- | ------------ | ------------------------------------ | -------------------------------------------------------- |
| `admin_audit_log`     | `admin_audit_log_pkey`                             | BTREE UNIQUE | `id`                                 | —                                                        |
| `admin_audit_log`     | `admin_audit_log_admin_id_idx`                     | BTREE        | `admin_id`                           | —                                                        |
| `admin_audit_log`     | `admin_audit_log_created_at_idx`                   | BTREE        | `created_at DESC`                    | —                                                        |
| `admin_audit_log`     | `admin_audit_log_table_record_idx`                 | BTREE        | `(table_name, record_id)`            | —                                                        |
| `commission_rates`    | `commission_rates_pkey`                            | BTREE UNIQUE | `id`                                 | —                                                        |
| `commission_rates`    | `commission_rates_vehicle_type_effective_idx`       | BTREE        | `(vehicle_type, effective_from DESC)` | —                                                        |
| `conversations`       | `conversations_pkey`                               | BTREE UNIQUE | `id`                                 | —                                                        |
| `conversations`       | `conversations_passenger_id_idx`                   | BTREE        | `passenger_id`                       | —                                                        |
| `conversations`       | `conversations_driver_id_idx`                      | BTREE        | `driver_id`                          | —                                                        |
| `conversations`       | `conversations_ride_id_key`                        | BTREE UNIQUE | `ride_id`                            | —                                                        |
| `conversations`       | `conversations_passenger_id_driver_id_ride_id_key` | BTREE UNIQUE | `(passenger_id, driver_id, ride_id)` | —                                                        |
| `driver_documents`    | `driver_documents_pkey`                            | BTREE UNIQUE | `id`                                 | —                                                        |
| `driver_documents`    | `driver_documents_driver_id_idx`                   | BTREE        | `driver_id`                          | —                                                        |
| `driver_documents`    | `driver_documents_verified_by_idx`                 | BTREE        | `verified_by`                        | —                                                        |
| `driver_earnings`     | `driver_earnings_pkey`                             | BTREE UNIQUE | `id`                                 | —                                                        |
| `driver_earnings`     | `driver_earnings_ride_id_key`                      | BTREE UNIQUE | `ride_id`                            | —                                                        |
| `driver_earnings`     | `driver_earnings_driver_id_idx`                    | BTREE        | `driver_id`                          | —                                                        |
| `driver_earnings`     | `driver_earnings_payout_status_idx`                | BTREE        | `payout_status`                      | —                                                        |
| `driver_earnings`     | `driver_earnings_payout_id_idx`                    | BTREE        | `payout_id`                          | —                                                        |
| `driver_locations`    | `driver_locations_pkey`                            | BTREE UNIQUE | `driver_id`                          | —                                                        |
| `driver_locations`    | `driver_locations_location_idx`                    | GIST         | `location`                           | —                                                        |
| `driver_payouts`      | `driver_payouts_pkey`                              | BTREE UNIQUE | `id`                                 | —                                                        |
| `driver_payouts`      | `driver_payouts_driver_id_idx`                     | BTREE        | `driver_id`                          | —                                                        |
| `driver_payouts`      | `driver_payouts_status_idx`                        | BTREE        | `status`                             | —                                                        |
| `driver_payouts`      | `driver_payouts_processed_by_idx`                  | BTREE        | `processed_by`                       | —                                                        |
| `driver_profiles`     | `driver_profiles_pkey`                             | BTREE UNIQUE | `id`                                 | —                                                        |
| `driver_profiles`     | `driver_profiles_user_id_key`                      | BTREE UNIQUE | `user_id`                            | —                                                        |
| `driver_profiles`     | `driver_profiles_location_idx`                     | GIST         | `current_location`                   | —                                                        |
| `driver_profiles`     | `driver_profiles_approved_by_idx`                  | BTREE        | `approved_by`                        | —                                                        |
| `driver_profiles`     | `driver_profiles_online_approved_idx`              | BTREE        | `user_id`                            | `WHERE is_online = true AND verification_status = 'approved'` |
| `fare_rules`          | `fare_rules_pkey`                                  | BTREE UNIQUE | `id`                                 | —                                                        |
| `fare_rules`          | `fare_rules_vehicle_type_effective_idx`             | BTREE        | `(vehicle_type, effective_from DESC)` | —                                                        |
| `job_alerts`          | `job_alerts_pkey`                                  | BTREE UNIQUE | `id`                                 | —                                                        |
| `job_alerts`          | `job_alerts_driver_id_idx`                         | BTREE        | `driver_id`                          | —                                                        |
| `job_alerts`          | `job_alerts_active_driver_idx`                     | BTREE        | `driver_id`                          | `WHERE deleted_at IS NULL AND is_active = true`          |
| `messages`            | `messages_pkey`                                    | BTREE UNIQUE | `id`                                 | —                                                        |
| `messages`            | `messages_conversation_id_idx`                     | BTREE        | `conversation_id`                    | —                                                        |
| `messages`            | `messages_created_at_idx`                          | BTREE        | `created_at`                         | —                                                        |
| `messages`            | `messages_sender_id_idx`                           | BTREE        | `sender_id`                          | —                                                        |
| `notifications`       | `notifications_pkey`                               | BTREE UNIQUE | `id`                                 | —                                                        |
| `notifications`       | `notifications_user_id_idx`                        | BTREE        | `user_id`                            | —                                                        |
| `notifications`       | `notifications_read_at_idx`                        | BTREE        | `(user_id, read_at)`                 | `WHERE read_at IS NULL`                                  |
| `passenger_profiles`  | `passenger_profiles_pkey`                          | BTREE UNIQUE | `id`                                 | —                                                        |
| `passenger_profiles`  | `passenger_profiles_user_id_key`                   | BTREE UNIQUE | `user_id`                            | —                                                        |
| `platform_fees`       | `platform_fees_pkey`                               | BTREE UNIQUE | `id`                                 | —                                                        |
| `platform_fees`       | `platform_fees_one_active`                         | BTREE UNIQUE | `is_active`                          | `WHERE is_active = true`                                 |
| `ride_ratings`        | `ride_ratings_pkey`                                | BTREE UNIQUE | `id`                                 | —                                                        |
| `ride_ratings`        | `ride_ratings_ride_id_rater_id_key`                | BTREE UNIQUE | `(ride_id, rater_id)`                | —                                                        |
| `ride_ratings`        | `ride_ratings_ratee_id_idx`                        | BTREE        | `ratee_id`                           | —                                                        |
| `ride_ratings`        | `ride_ratings_rater_id_idx`                        | BTREE        | `rater_id`                           | —                                                        |
| `ride_routes`         | `ride_routes_pkey`                                 | BTREE UNIQUE | `ride_id`                            | —                                                        |
| `ride_status_history` | `ride_status_history_pkey`                         | BTREE UNIQUE | `id`                                 | —                                                        |
| `ride_status_history` | `ride_status_history_ride_id_idx`                  | BTREE        | `ride_id`                            | —                                                        |
| `ride_status_history` | `ride_status_history_changed_at_idx`               | BTREE        | `changed_at DESC`                    | —                                                        |
| `ride_status_history` | `ride_status_history_changed_by_idx`               | BTREE        | `changed_by`                         | —                                                        |
| `rides`               | `rides_pkey`                                       | BTREE UNIQUE | `id`                                 | —                                                        |
| `rides`               | `rides_passenger_id_idx`                           | BTREE        | `passenger_id`                       | —                                                        |
| `rides`               | `rides_driver_id_idx`                              | BTREE        | `driver_id`                          | —                                                        |
| `rides`               | `rides_vehicle_id_idx`                             | BTREE        | `vehicle_id`                         | —                                                        |
| `rides`               | `rides_status_idx`                                 | BTREE        | `status`                             | —                                                        |
| `rides`               | `rides_created_at_idx`                             | BTREE        | `created_at DESC`                    | —                                                        |
| `rides`               | `rides_pickup_location_idx`                        | GIST         | `pickup_location`                    | —                                                        |
| `rides`               | `rides_pending_pickup_location_idx`                | GIST         | `pickup_location`                    | `WHERE status = 'pending'`                               |
| `users`               | `users_pkey`                                       | BTREE UNIQUE | `id`                                 | —                                                        |
| `users`               | `users_email_key`                                  | BTREE UNIQUE | `email`                              | —                                                        |
| `users`               | `users_phone_key`                                  | BTREE UNIQUE | `phone`                              | —                                                        |
| `vehicles`            | `vehicles_pkey`                                    | BTREE UNIQUE | `id`                                 | —                                                        |
| `vehicles`            | `vehicles_plate_number_key`                        | BTREE UNIQUE | `plate_number`                       | —                                                        |
| `vehicles`            | `vehicles_one_active_per_driver`                   | BTREE UNIQUE | `driver_id`                          | `WHERE is_active = true`                                 |

---

## 8. Foreign Key Constraints

| Constraint                            | Source                           | Target                 | On Delete |
| ------------------------------------- | -------------------------------- | ---------------------- | --------- |
| `users_id_fkey`                       | `users.id`                       | `auth.users.id`        | CASCADE   |
| `driver_profiles_user_id_fkey`        | `driver_profiles.user_id`        | `users.id`             | CASCADE   |
| `driver_profiles_approved_by_fkey`    | `driver_profiles.approved_by`    | `users.id`             | RESTRICT  |
| `passenger_profiles_user_id_fkey`     | `passenger_profiles.user_id`     | `users.id`             | CASCADE   |
| `vehicles_driver_id_fkey`             | `vehicles.driver_id`             | `driver_profiles.id`   | CASCADE   |
| `driver_documents_driver_id_fkey`     | `driver_documents.driver_id`     | `driver_profiles.id`   | CASCADE   |
| `driver_documents_verified_by_fkey`   | `driver_documents.verified_by`   | `users.id`             | RESTRICT  |
| `rides_passenger_id_fkey`             | `rides.passenger_id`             | `users.id`             | RESTRICT  |
| `rides_driver_id_fkey`                | `rides.driver_id`                | `users.id`             | RESTRICT  |
| `rides_vehicle_id_fkey`               | `rides.vehicle_id`               | `vehicles.id`          | RESTRICT  |
| `rides_commission_rate_id_fkey`       | `rides.commission_rate_id`       | `commission_rates.id`  | —         |
| `rides_fare_rule_id_fkey`             | `rides.fare_rule_id`             | `fare_rules.id`        | —         |
| `ride_status_history_ride_id_fkey`    | `ride_status_history.ride_id`    | `rides.id`             | CASCADE   |
| `ride_status_history_changed_by_fkey` | `ride_status_history.changed_by` | `users.id`             | RESTRICT  |
| `ride_routes_ride_id_fkey`            | `ride_routes.ride_id`            | `rides.id`             | CASCADE   |
| `job_alerts_driver_id_fkey`           | `job_alerts.driver_id`           | `driver_profiles.id`   | CASCADE   |
| `ride_ratings_ride_id_fkey`           | `ride_ratings.ride_id`           | `rides.id`             | CASCADE   |
| `ride_ratings_rater_id_fkey`          | `ride_ratings.rater_id`          | `users.id`             | RESTRICT  |
| `ride_ratings_ratee_id_fkey`          | `ride_ratings.ratee_id`          | `users.id`             | RESTRICT  |
| `conversations_ride_id_fkey`          | `conversations.ride_id`          | `rides.id`             | RESTRICT  |
| `conversations_passenger_id_fkey`     | `conversations.passenger_id`     | `users.id`             | RESTRICT  |
| `conversations_driver_id_fkey`        | `conversations.driver_id`        | `users.id`             | RESTRICT  |
| `messages_conversation_id_fkey`       | `messages.conversation_id`       | `conversations.id`     | CASCADE   |
| `messages_sender_id_fkey`             | `messages.sender_id`             | `users.id`             | RESTRICT  |
| `notifications_user_id_fkey`          | `notifications.user_id`          | `users.id`             | CASCADE   |
| `driver_locations_driver_id_fkey`     | `driver_locations.driver_id`     | `driver_profiles.id`   | CASCADE   |
| `driver_payouts_driver_id_fkey`       | `driver_payouts.driver_id`       | `driver_profiles.id`   | RESTRICT  |
| `driver_payouts_processed_by_fkey`    | `driver_payouts.processed_by`    | `users.id`             | RESTRICT  |
| `driver_earnings_driver_id_fkey`      | `driver_earnings.driver_id`      | `driver_profiles.id`   | RESTRICT  |
| `driver_earnings_ride_id_fkey`        | `driver_earnings.ride_id`        | `rides.id`             | RESTRICT  |
| `driver_earnings_payout_id_fkey`      | `driver_earnings.payout_id`      | `driver_payouts.id`    | RESTRICT  |
| `commission_rates_created_by_fkey`    | `commission_rates.created_by`    | `users.id`             | —         |
| `fare_rules_created_by_fkey`          | `fare_rules.created_by`          | `users.id`             | —         |
| `platform_fees_created_by_fkey`       | `platform_fees.created_by`       | `users.id`             | —         |
| `admin_audit_log_admin_id_fkey`       | `admin_audit_log.admin_id`       | `users.id`             | —         |

---

## 9. Database Functions

All functions use `SECURITY DEFINER` and pin `search_path` to prevent search path injection attacks.

---

### `is_admin() → boolean`

**Volatility:** STABLE

Checks if the currently authenticated user has the `admin` role. Used as the guard condition in all admin RLS policies.

```sql
SELECT EXISTS (
  SELECT 1 FROM public.users
  WHERE id = auth.uid() AND role = 'admin'
);
```

**Used in RLS policies for:** `admin_audit_log`, `commission_rates`, `driver_documents`, `driver_earnings`, `driver_locations`, `driver_payouts`, `driver_profiles`, `fare_rules`, `job_alerts`, `notifications`, `passenger_profiles`, `ride_ratings`, `ride_routes`, `ride_status_history`, `rides`, `users`, `vehicles`

---

### `is_approved_online_driver() → boolean`

**Volatility:** STABLE

Checks if the currently authenticated user is a driver who is both `approved` and currently `is_online = true`. Used as the gate for drivers to see and accept pending rides.

```sql
SELECT EXISTS (
  SELECT 1 FROM driver_profiles dp
  WHERE dp.user_id = auth.uid()
    AND dp.verification_status = 'approved'
    AND dp.is_online = true
);
```

**Used in RLS policies:** `rides_select_driver_pending`, `rides_update_driver`

---

### `get_active_platform_fee() → numeric`

**Volatility:** STABLE

Returns the current active platform fee amount. Used by client apps to display the fee before ride completion.

```sql
SELECT fee_amount FROM public.platform_fees WHERE is_active = true LIMIT 1;
```

---

### `accept_ride(p_ride_id uuid) → boolean`

**Type:** RPC (callable via `supabase.rpc('accept_ride', { p_ride_id })`)

Atomic ride acceptance with race-condition protection. Checks caller is an approved online driver, then performs an atomic UPDATE with `WHERE status = 'pending' AND driver_id IS NULL`. Returns `true` if successful, `false` if the ride was already taken.

```sql
UPDATE public.rides
SET driver_id = auth.uid(), status = 'accepted', accepted_at = now()
WHERE id = p_ride_id AND status = 'pending' AND driver_id IS NULL;
-- Returns ROW_COUNT > 0
```

---

### `ensure_conversation_for_ride(p_ride_id uuid) → uuid`

**Type:** RPC (callable via `supabase.rpc('ensure_conversation_for_ride', { p_ride_id })`)

Lazy conversation creation. Called when either party wants to chat during a ride. Returns the conversation ID — either existing or newly created. Uses `ON CONFLICT (ride_id) DO NOTHING` for idempotency. Validates that the caller is a participant of the ride and that a driver has been assigned.

---

### `handle_new_auth_user() → trigger`

**Trigger:** `AFTER INSERT ON auth.users` (managed by Supabase Auth schema)

Automatically provisions a `users` row and optionally a `driver_profiles` row when a new user is created in `auth.users`. Reads `role` from `raw_user_meta_data`. **Only whitelists `driver` — all other values (including `admin`) default to `passenger`.** Driver accounts are only created by admins via the Admin Dashboard.

```
auth.users INSERT (e.g. auth.admin.createUser from Admin Dashboard)
  └─ reads raw_user_meta_data.role
      ├─ 'passenger' → skip (Passenger App Welcome screen handles upsert)
      └─ 'driver'    → INSERT into users + INSERT into driver_profiles (verification_status = 'pending')
```

---

### `set_updated_at() → trigger`

**Volatility:** VOLATILE

Generic trigger function used across multiple tables to automatically update `updated_at = now()` before each UPDATE.

**Applied to:** `users`, `driver_profiles`, `driver_documents`, `passenger_profiles`, `vehicles`, `rides`, `job_alerts`, `platform_fees`

---

### `log_ride_initial_status() → trigger`

**Trigger:** `AFTER INSERT ON rides`

Writes the first entry in `ride_status_history` when a ride is created. Sets `changed_by` to the `passenger_id` (the creator).

---

### `log_ride_status_change() → trigger`

**Trigger:** `AFTER UPDATE ON rides`

Writes to `ride_status_history` whenever `rides.status` changes. Uses `auth.uid()` to record the actor.

> **Note:** `auth.uid()` returns `NULL` when the update is triggered by another SECURITY DEFINER function rather than a direct client call. This results in `changed_by = NULL` for system-triggered transitions.

---

### `create_driver_earnings_on_completion() → trigger`

**Trigger:** `AFTER UPDATE ON rides`

When a ride status changes to `'completed'`:

1. Resolves the `driver_profiles.id` from `rides.driver_id`
2. Reads `platform_fee` from the ride (frozen at completion by the client)
3. Calculates: `gross_amount = final_fare`, `commission_amount = platform_fee`, `net_amount = gross − platform_fee`
4. INSERTs into `driver_earnings` with `ON CONFLICT (ride_id) DO NOTHING`
5. Only if insert succeeded (idempotency check): increments `driver_profiles.total_rides + 1` and `passenger_profiles.total_rides + 1`

---

### `update_avg_rating() → trigger`

**Trigger:** `AFTER INSERT ON ride_ratings`

Uses incremental computation to update the average rating for the `ratee_id`:

```sql
avg_rating = ROUND(((avg_rating * rating_count) + NEW.rating) / (rating_count + 1), 2)
rating_count = rating_count + 1
```

Updates both `driver_profiles` and `passenger_profiles` for the ratee (only one will match).

---

### `update_conversation_last_message() → trigger`

**Trigger:** `AFTER INSERT ON messages`

Updates `conversations.last_message_at` to the new message's `created_at` timestamp.

---

### `extract_route_polyline() → trigger`

**Trigger:** `BEFORE INSERT ON rides`

If the incoming ride row has a `route_polyline`, stashes it in a session variable (`app.pending_polyline_<ride_id>`) and nullifies the column. This keeps the polyline out of the `rides` row (and out of Realtime payloads).

---

### `insert_route_polyline() → trigger`

**Trigger:** `AFTER INSERT ON rides`

Reads the stashed polyline from the session variable and inserts it into `ride_routes`. Uses `ON CONFLICT DO NOTHING` for safety.

---

## 10. Triggers

| Trigger Name                        | Table                | Event  | Timing | Function Called                          |
| ----------------------------------- | -------------------- | ------ | ------ | ---------------------------------------- |
| `set_users_updated_at`              | `users`              | UPDATE | BEFORE | `set_updated_at()`                       |
| `set_driver_profiles_updated_at`    | `driver_profiles`    | UPDATE | BEFORE | `set_updated_at()`                       |
| `set_driver_documents_updated_at`   | `driver_documents`   | UPDATE | BEFORE | `set_updated_at()`                       |
| `set_passenger_profiles_updated_at` | `passenger_profiles` | UPDATE | BEFORE | `set_updated_at()`                       |
| `set_vehicles_updated_at`           | `vehicles`           | UPDATE | BEFORE | `set_updated_at()`                       |
| `set_rides_updated_at`              | `rides`              | UPDATE | BEFORE | `set_updated_at()`                       |
| `set_job_alerts_updated_at`         | `job_alerts`         | UPDATE | BEFORE | `set_updated_at()`                       |
| `set_platform_fees_updated_at`      | `platform_fees`      | UPDATE | BEFORE | `set_updated_at()`                       |
| `trg_extract_route_polyline_before` | `rides`              | INSERT | BEFORE | `extract_route_polyline()`               |
| `on_ride_created`                   | `rides`              | INSERT | AFTER  | `log_ride_initial_status()`              |
| `trg_insert_route_polyline_after`   | `rides`              | INSERT | AFTER  | `insert_route_polyline()`                |
| `on_ride_status_change`             | `rides`              | UPDATE | AFTER  | `log_ride_status_change()`               |
| `on_ride_completed`                 | `rides`              | UPDATE | AFTER  | `create_driver_earnings_on_completion()` |
| `on_ride_rating_inserted`           | `ride_ratings`       | INSERT | AFTER  | `update_avg_rating()`                    |
| `on_message_inserted`               | `messages`           | INSERT | AFTER  | `update_conversation_last_message()`     |

> **Note:** The `rides` table has 5 triggers: 2 on INSERT (BEFORE: extract polyline, AFTER: log initial status + insert polyline) and 3 on UPDATE (BEFORE: set_updated_at, AFTER: log status change + create earnings on completion). The AFTER UPDATE triggers check `OLD.status IS DISTINCT FROM NEW.status` before doing work.

---

## 11. Row Level Security (RLS)

RLS is enabled on all 20 public tables. All policies use `PERMISSIVE` mode (Postgres ORs permissive policies together).

Two SECURITY DEFINER helper functions — `is_admin()` and `is_approved_online_driver()` — serve as role gates across many policies.

---

### `users` — 8 Policies

| Policy                                  | Operation | Roles         | Condition                                      |
| --------------------------------------- | --------- | ------------- | ---------------------------------------------- |
| `users_insert_service`                  | INSERT    | public        | `id = (SELECT auth.uid())`                     |
| `users_select_own`                      | SELECT    | public        | `id = (SELECT auth.uid())`                     |
| `users_select_admin`                    | SELECT    | public        | `is_admin()`                                   |
| `users_select_driver_for_active_ride`   | SELECT    | authenticated | Driver has active ride with this passenger     |
| `users_select_passenger_for_driver_ride`| SELECT    | authenticated | Passenger has ride with this driver            |
| `users_select_passenger_for_pending_rides` | SELECT | authenticated | User is passenger of a pending ride            |
| `users_update_own`                      | UPDATE    | public        | `id = (SELECT auth.uid())`                     |
| `users_update_admin`                    | UPDATE    | public        | `is_admin()`                                   |

---

### `driver_profiles` — 5 Policies (INSERT restricted)

| Policy                                         | Operation | Condition                                  |
| ---------------------------------------------- | --------- | ------------------------------------------ |
| `driver_profiles_select_own`                   | SELECT    | `user_id = (SELECT auth.uid())`            |
| `driver_profiles_select_admin`                 | SELECT    | `is_admin()`                               |
| `driver_profiles_select_passenger_active_ride` | SELECT    | Passenger has active ride with this driver  |
| `driver_profiles_update_own`                   | UPDATE    | `user_id = (SELECT auth.uid())`            |
| `driver_profiles_update_admin`                 | UPDATE    | `is_admin()`                               |

**INSERT:** No RLS policy. Driver profiles are created **only** by the `handle_new_auth_user` trigger.

---

### `passenger_profiles` — 5 Policies

| Policy                                         | Operation | Condition                                  |
| ---------------------------------------------- | --------- | ------------------------------------------ |
| `passenger_profiles_insert_own`                | INSERT    | `user_id = (SELECT auth.uid())`            |
| `passenger_profiles_select_own`                | SELECT    | `user_id = (SELECT auth.uid())`            |
| `passenger_profiles_select_admin`              | SELECT    | `is_admin()`                               |
| `passenger_profiles_select_driver_active_ride` | SELECT    | Driver has active ride with this passenger  |
| `passenger_profiles_update_own`                | UPDATE    | `user_id = (SELECT auth.uid())`            |

---

### `vehicles` — 6 Policies (INSERT restricted)

| Policy                                    | Operation | Condition                                            |
| ----------------------------------------- | --------- | ---------------------------------------------------- |
| `vehicles_select_own_driver`              | SELECT    | Driver owns the driver_profile                       |
| `vehicles_select_admin`                   | SELECT    | `is_admin()`                                         |
| `vehicles_select_passenger_active_ride`   | SELECT    | Passenger has active ride with this vehicle           |
| `vehicles_select_passenger_driver_ride`   | SELECT    | Passenger has accepted/active ride with this driver's vehicle |
| `vehicles_update_own_driver`              | UPDATE    | Driver owns the driver_profile                       |
| `vehicles_update_admin`                   | UPDATE    | `is_admin()`                                         |

---

### `driver_documents` — 3 Policies (INSERT restricted)

| Policy                          | Operation | Condition                      |
| ------------------------------- | --------- | ------------------------------ |
| `driver_documents_select_own`   | SELECT    | Driver owns the driver_profile |
| `driver_documents_select_admin` | SELECT    | `is_admin()`                   |
| `driver_documents_update_admin` | UPDATE    | `is_admin()`                   |

---

### `rides` — 9 Policies

| Policy                        | Operation | Roles         | USING Condition                                                           | WITH CHECK                  |
| ----------------------------- | --------- | ------------- | ------------------------------------------------------------------------- | --------------------------- |
| `rides_insert_passenger`      | INSERT    | public        | —                                                                         | `passenger_id = auth.uid()` |
| `rides_select_passenger`      | SELECT    | public        | `passenger_id = (SELECT auth.uid())`                                      | —                           |
| `rides_select_driver_own`     | SELECT    | public        | `driver_id = (SELECT auth.uid())`                                         | —                           |
| `Drivers can view their own rides` | SELECT | authenticated | `driver_id = auth.uid()`                                                  | —                           |
| `rides_select_driver_pending` | SELECT    | public        | `status = 'pending' AND is_approved_online_driver()`                      | —                           |
| `rides_select_admin`          | SELECT    | public        | `is_admin()`                                                              | —                           |
| `rides_update_driver`         | UPDATE    | public        | `driver_id = (SELECT auth.uid()) OR (status = 'pending' AND is_approved_online_driver())` | `driver_id = (SELECT auth.uid())` |
| `rides_update_passenger_cancel` | UPDATE  | public        | `passenger_id = (SELECT auth.uid())`                                      | —                           |
| `rides_update_admin`          | UPDATE    | public        | `is_admin()`                                                              | —                           |

> **Note:** "Drivers can view their own rides" is redundant with `rides_select_driver_own`. Both check `driver_id = auth.uid()`. The `rides_update_driver` WITH CHECK ensures drivers can only claim rides for themselves.

---

### `ride_status_history` — 3 Policies

| Policy                                 | Operation | Condition             |
| -------------------------------------- | --------- | --------------------- |
| `ride_status_history_select_passenger` | SELECT    | Passenger of the ride |
| `ride_status_history_select_driver`    | SELECT    | Driver of the ride    |
| `ride_status_history_select_admin`     | SELECT    | `is_admin()`          |

---

### `ride_routes` — 2 Policies

| Policy                          | Operation | Condition                    |
| ------------------------------- | --------- | ---------------------------- |
| `ride_routes_select_participant`| SELECT    | Passenger or driver of ride  |
| `ride_routes_select_admin`      | SELECT    | `is_admin()`                 |

---

### `job_alerts` — 5 Policies

| Policy                    | Operation | Condition                      |
| ------------------------- | --------- | ------------------------------ |
| `job_alerts_insert_own`   | INSERT    | Driver owns the driver_profile |
| `job_alerts_select_own`   | SELECT    | Driver owns the driver_profile |
| `job_alerts_select_admin` | SELECT    | `is_admin()`                   |
| `job_alerts_update_own`   | UPDATE    | Driver owns the driver_profile |
| `job_alerts_delete_own`   | DELETE    | Driver owns the driver_profile |

---

### `ride_ratings` — 3 Policies

| Policy                            | Operation | Condition                                                               |
| --------------------------------- | --------- | ----------------------------------------------------------------------- |
| `ride_ratings_insert_own`         | INSERT    | `rater_id = auth.uid()` AND ride is completed/fare_confirmed AND caller is participant |
| `ride_ratings_select_participant` | SELECT    | `rater_id = auth.uid() OR ratee_id = auth.uid()`                       |
| `ride_ratings_select_admin`       | SELECT    | `is_admin()`                                                            |

---

### `conversations` — 1 Policy

| Policy                             | Operation | Condition                                             |
| ---------------------------------- | --------- | ----------------------------------------------------- |
| `conversations_select_participant` | SELECT    | `passenger_id = auth.uid() OR driver_id = auth.uid()` |

---

### `messages` — 2 Policies

| Policy                        | Operation | Condition                                            |
| ----------------------------- | --------- | ---------------------------------------------------- |
| `messages_select_participant` | SELECT    | Caller is passenger or driver in the conversation    |
| `messages_insert_participant` | INSERT    | `sender_id = auth.uid()` AND caller is a participant |

---

### `notifications` — 3 Policies

| Policy                          | Operation | Condition                                                      |
| ------------------------------- | --------- | -------------------------------------------------------------- |
| `notifications_select_own`      | SELECT    | `user_id = (SELECT auth.uid())`                                |
| `notifications_select_admin`    | SELECT    | `is_admin()`                                                   |
| `notifications_update_own_read` | UPDATE    | USING: `user_id = (SELECT auth.uid())` / WITH CHECK: `user_id = (SELECT auth.uid()) AND read_at IS NOT NULL` |

---

### `driver_locations` — 3 Policies

| Policy                                      | Operation | Condition                                         |
| ------------------------------------------- | --------- | ------------------------------------------------- |
| `driver_locations_upsert_own`               | ALL       | Driver owns the driver_profile (USING + WITH CHECK) |
| `driver_locations_select_admin`             | SELECT    | `is_admin()`                                      |
| `driver_locations_select_passenger_active_ride` | SELECT | Passenger has active ride with this driver         |

---

### `driver_earnings` — 2 Policies

| Policy                         | Operation | Condition                      |
| ------------------------------ | --------- | ------------------------------ |
| `driver_earnings_select_own`   | SELECT    | Driver owns the driver_profile |
| `driver_earnings_select_admin` | SELECT    | `is_admin()`                   |

---

### `driver_payouts` — 4 Policies

| Policy                        | Operation | Condition                      |
| ----------------------------- | --------- | ------------------------------ |
| `driver_payouts_select_own`   | SELECT    | Driver owns the driver_profile |
| `driver_payouts_select_admin` | SELECT    | `is_admin()`                   |
| `driver_payouts_insert_admin` | INSERT    | `is_admin()`                   |
| `driver_payouts_update_admin` | UPDATE    | `is_admin()`                   |

---

### `commission_rates` — 3 Policies

| Policy                          | Operation | Condition    |
| ------------------------------- | --------- | ------------ |
| `commission_rates_select_all`   | SELECT    | `true` (all authenticated users can read) |
| `commission_rates_insert_admin` | INSERT    | `is_admin()` |
| `commission_rates_update_admin` | UPDATE    | `is_admin()` |

---

### `fare_rules` — 3 Policies

| Policy                     | Operation | Condition    |
| -------------------------- | --------- | ------------ |
| `fare_rules_select_all`    | SELECT    | `true` (all authenticated users can read) |
| `fare_rules_insert_admin`  | INSERT    | `is_admin()` |
| `fare_rules_update_admin`  | UPDATE    | `is_admin()` |

---

### `platform_fees` — 4 Policies

| Policy                                         | Operation | Roles         | Condition                               |
| ---------------------------------------------- | --------- | ------------- | --------------------------------------- |
| `allow select active platform fee for authenticated` | SELECT | authenticated | `is_active = true`                      |
| `allow insert platform fee for admins`          | INSERT    | authenticated | Admin check via users table             |
| `allow update platform fee for admins`          | UPDATE    | authenticated | Admin check (USING + WITH CHECK)        |
| `allow delete platform fee for admins`          | DELETE    | authenticated | Admin check via users table             |

---

### `admin_audit_log` — 1 Policy

| Policy                          | Operation | Condition    |
| ------------------------------- | --------- | ------------ |
| `admin_audit_log_select_admin`  | SELECT    | `is_admin()` |

---

## 12. Edge Functions

All functions run on Deno in Supabase's Edge Runtime. Base URL: `https://qmbwreizcwnxxfcpmdyr.supabase.co/functions/v1/`

---

### `maps-autocomplete`

**JWT Required:** No | **Status:** ACTIVE

Google Places Autocomplete proxy. Keeps the Google Maps API key server-side.

**Used by:** Passenger App, Driver App — location search inputs

---

### `maps-nearby`

**JWT Required:** No | **Status:** ACTIVE

Google Places Nearby Search proxy using the Places API v2.

**Used by:** Passenger App — nearby locations when using current position as pickup

---

### `maps-directions`

**JWT Required:** No | **Status:** ACTIVE

Google Maps Directions API proxy. Returns route data including coordinates, distance, duration, and encoded polyline.

**Used by:** Passenger App (route preview), Driver App (navigation path)

---

### `maps-place-details`

**JWT Required:** No | **Status:** ACTIVE

Google Places Details proxy using the Places API v2. Resolves a Place ID to coordinates.

**Used by:** Passenger App — resolving autocomplete selections to coordinates

---

### `admin-approve-driver`

**JWT Required:** Yes | **Status:** ACTIVE

Approves or rejects a driver's application. Uses the **service role key** to bypass RLS.

**Database writes:** Updates `driver_profiles.verification_status` and `driver_profiles.approved_at`

---

### `admin-create-payout`

**JWT Required:** Yes | **Status:** ACTIVE

Creates a new `driver_payouts` record for a driver. Uses the **service role key** to bypass RLS.

---

## 13. Realtime Architecture

### Publication Configuration

| Publication             | Tables                                                                                  | Events                 |
| ----------------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| `supabase_realtime`     | `rides`, `conversations`, `messages`, `notifications`, `driver_profiles`, `driver_locations` | INSERT, UPDATE, DELETE |

### Active Realtime Subscriptions

| Table              | Use Case                                      | Subscriber          |
| ------------------ | --------------------------------------------- | ------------------- |
| `rides`            | Ride status updates                           | Passenger + Driver  |
| `driver_profiles`  | Driver online status changes                  | Admin Dashboard     |
| `driver_locations` | Live driver position during active ride       | Passenger App       |
| `messages`         | In-ride chat message delivery                 | Passenger + Driver  |
| `conversations`    | Last message / unread sync                    | Passenger + Driver  |
| `notifications`    | Push notification triggers                    | All apps            |

### Driver Location Flow (Realtime-Based)

```
Driver App (every N seconds)
  └─ UPSERT driver_locations SET location = ST_MakePoint(lng, lat)
      └─ supabase_realtime broadcasts row change
          └─ Passenger App receives location update via WebSocket
              └─ Updates map marker in real time
```

---

## 14. Data Flow: Ride Lifecycle

```
PASSENGER                    DATABASE                      DRIVER
─────────                    ────────                      ──────
1. Search location
   → maps-autocomplete Edge Function → Google Places API

2. Select dropoff
   → maps-place-details Edge Function → resolve coordinates

3. Preview route
   → maps-directions Edge Function → route + fare estimate

4. Book ride
   INSERT rides (status='pending')
   ├─ Trigger: extract_route_polyline → stash in session var
   ├─ Trigger: log_ride_initial_status → ride_status_history
   └─ Trigger: insert_route_polyline → ride_routes
                                                          5. Driver sees pending ride
                                                             (Realtime subscription)

                                                          6. Driver accepts ride
                                                             RPC: accept_ride(ride_id)
                                                             ├─ Atomic: SET driver_id, status='accepted'
                                                             │   WHERE status='pending' AND driver_id IS NULL
                                                             └─ Trigger: log_ride_status_change

7. Passenger receives
   status='accepted' via Realtime
   └─ Loads driver profile, vehicle info

8. Driver navigates to pickup
   UPDATE rides (status='navigating_to_pickup')
   └─ Trigger: log_ride_status_change

9. Driver arrives
   UPDATE rides (status='arrived_at_pickup')
   └─ Trigger: log_ride_status_change

10. Waiting for passenger
    UPDATE rides (status='waiting_for_passenger')
    └─ Trigger: log_ride_status_change

11. Trip starts
    UPDATE rides (status='trip_in_progress', trip_started_at=now())
    └─ Trigger: log_ride_status_change

12. Passenger dropped off
    UPDATE rides (status='dropped_off', dropped_off_at=now())
    └─ Trigger: log_ride_status_change

13. Driver inputs fare
    UPDATE rides (status='input_fare', fare_type='input_fare')
    └─ Trigger: log_ride_status_change

14. Fare confirmed
    UPDATE rides (status='fare_confirmed',
                  final_fare=meter+platform_fee,
                  platform_fee=<frozen_fee>)
    └─ Trigger: log_ride_status_change

15. Trip completes
    UPDATE rides (status='completed', trip_completed_at=now())
    ├─ Trigger: log_ride_status_change
    └─ Trigger: create_driver_earnings_on_completion
         ├─ INSERT driver_earnings (net = final_fare − platform_fee)
         ├─ UPDATE driver_profiles.total_rides + 1
         └─ UPDATE passenger_profiles.total_rides + 1

16. Both parties rate
    INSERT ride_ratings (rater_id, ratee_id, rating)
    └─ Trigger: update_avg_rating (incremental)
         ├─ UPDATE driver_profiles.avg_rating
         └─ UPDATE passenger_profiles.avg_rating

17. Chat (anytime after acceptance)
    RPC: ensure_conversation_for_ride(ride_id)
    └─ Returns conversation_id (creates if needed)
    INSERT messages (conversation_id, sender_id, text)
    └─ Trigger: update_conversation_last_message
```

---

## 15. Data Flow: Driver Onboarding

Driver accounts are **created only by admins**. The Driver App supports **sign-in only** (no sign-up or self-registration).

```
Admin Dashboard                    Supabase Auth / Database
────────────────                    ────────────────────────
1. Admin creates driver (Add Driver modal / page)
   → Server action: createDriver() using SUPABASE_SERVICE_ROLE_KEY
   → auth.admin.createUser({
        email, phone, email_confirm: true,
        password: <temp>,
        user_metadata: { role: 'driver', first_name, last_name, phone }
      })
   → auth.users INSERT
   └─ Trigger: handle_new_auth_user
        ├─ INSERT users (role='driver')
        └─ INSERT driver_profiles (verification_status='pending')

2. Optional: server action inserts initial vehicle
   → INSERT vehicles (driver_id = driver_profiles.id, plate_number, make, type)
   → (service role bypasses RLS)

3. Admin shares credentials or sends password reset to driver

Driver App (sign-in only)
4. Driver signs in (email + password)
   → signInWithPassword()
   → App checks users.role === 'driver'

5. Driver uploads documents
   → Supabase Storage upload → get file_url
   → INSERT driver_documents (via RPC or restored policy)

6. Admin reviews and approves
   → POST /functions/v1/admin-approve-driver
   → UPDATE driver_profiles SET verification_status='approved', approved_at=now()

7. Driver goes online
   → UPDATE driver_profiles SET is_online=true, online_started_at=now()
   → Driver now passes is_approved_online_driver()
   → Driver appears in pending rides feed
```

---

## 16. Data Flow: Driver Earnings & Payouts

```
Ride Completion
  └─ Trigger: create_driver_earnings_on_completion
       └─ INSERT driver_earnings
            driver_id         = <driver_profile_id>
            ride_id           = <ride_id>
            gross_amount      = final_fare
            commission_rate   = 0 (platform_fee model)
            commission_amount = platform_fee (from ride)
            net_amount        = gross − platform_fee
            payout_status     = 'pending'

Admin Dashboard
  └─ Views driver_earnings WHERE payout_status = 'pending'
  └─ POST /functions/v1/admin-create-payout
       { "driverId": "...", "amount": <total_net> }
  └─ service role INSERT driver_payouts
       driver_id    = <driver_profile_id>
       total_amount = <amount>
       status       = 'pending'

  └─ Admin links earnings to payout
       UPDATE driver_earnings
       SET payout_id = <new_payout_id>,
           payout_status = 'processing'
       WHERE driver_id = ? AND payout_status = 'pending'

  └─ Admin processes payment externally
  └─ Admin marks payout complete
       UPDATE driver_payouts
       SET status = 'paid',
           processed_by = auth.uid(),
           processed_at = now(),
           reference_number = '<ref>'

  └─ Admin updates earnings
       UPDATE driver_earnings
       SET payout_status = 'paid'
       WHERE payout_id = <payout_id>
```

---

## 17. Security Model

### Authentication

- All auth is handled by Supabase Auth (GoTrue)
- JWTs are issued per user session and verified by PostgREST on every request
- `auth.uid()` is available inside all RLS policies and SECURITY DEFINER functions

### Role Hierarchy

```
anonymous (no JWT)
  └─ Can call Maps Edge Functions (no verify_jwt)
  └─ Cannot access any table (all have RLS enabled)

authenticated (valid JWT, any role)
  └─ Can INSERT own user row (passenger path; driver path is admin-only)
  └─ Can read/update own profile rows
  └─ If passenger: can create rides, read own rides, rate completed rides
  └─ If driver (approved + online): can read pending rides, accept rides via RPC
  └─ If driver (any status): can update own driver_profile, vehicles
  └─ Drivers cannot self-register: no INSERT on driver_profiles/vehicles/driver_documents

admin (authenticated + role='admin' in users)
  └─ Full SELECT on all tables (via is_admin())
  └─ Only admins create driver accounts (via Admin Dashboard + service role)
  └─ Full control over driver verification, payouts, rides
  └─ Can call JWT-protected Edge Functions
  └─ Can configure commission_rates, fare_rules, platform_fees

service_role (internal — Admin Dashboard server actions + Edge Functions)
  └─ Bypasses RLS entirely
  └─ Used by Admin Dashboard "Create Driver" server action
  └─ Used by admin-approve-driver and admin-create-payout Edge Functions
```

### SECURITY DEFINER Functions

All 14 functions use `SECURITY DEFINER` with pinned `search_path`. This means they run with the permissions of the function owner (typically `postgres`) rather than the caller. Essential for trigger functions that write to tables the caller cannot directly access.

### Security Fixes Applied (since Feb 2026)

| Issue | Fix |
| ----- | --- |
| Global user PII leak (`qual: true` policy) | Removed; replaced with fine-grained per-role SELECT policies |
| Race condition on ride acceptance | `accept_ride` RPC with atomic `WHERE status = 'pending' AND driver_id IS NULL` |
| Admin role via user metadata | `handle_new_auth_user` only whitelists `driver`; all else defaults to `passenger` |
| `auth.uid()` init-plan optimization | Many policies now use `(SELECT auth.uid())` pattern |
| `notifications` UPDATE without WITH CHECK | Now has `WITH CHECK (read_at IS NOT NULL)` |
| Hardcoded 15% commission | `commission_rates` table + `platform_fees` table |
| Missing FK indexes | All 9 previously-flagged indexes added |
| Realtime only on `rides` | 6 tables now in publication |

---

## 18. Environment Variables

| Variable                    | Used By                                  | Description                                                                                       |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `GOOGLE_MAPS_API_KEY`       | All Maps Edge Functions                  | Google Maps Platform API key (Places v2, Directions)                                              |
| `NEXT_PUBLIC_SUPABASE_URL`  | Admin Dashboard (client)                 | Project URL for client-side Supabase SDK                                                          |
| `SUPABASE_URL`              | Admin Edge Functions                     | Project URL (auto-injected by Supabase runtime)                                                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Dashboard (server), Edge Functions | Service role key for create-driver server action and admin Edge Functions; never expose to client |
| `SUPABASE_ANON_KEY`         | Client apps                              | Public anon key for client-side SDK initialization                                                |

---

## 19. Known Issues & Recommendations

Issues are grouped by severity. Items marked **[RESOLVED]** were fixed in March–April 2026 migrations.

---

### RESOLVED (previously Critical/High)

| ID | Issue | Resolution |
| -- | ----- | ---------- |
| C-1 | `auth.uid()` init-plan in 47 RLS policies | Partially fixed — most policies now use `(SELECT auth.uid())` |
| C-2 | Ride acceptance race condition | **Fixed:** `accept_ride` RPC with atomic WHERE clause |
| C-3 | Users table globally readable PII | **Fixed:** Removed `true` policy; fine-grained per-role policies |
| C-4 | Admin role assignable via metadata | **Fixed:** Only `driver` whitelisted; all else → `passenger` |
| C-5 | Any user can UPDATE pending rides | **Fixed:** `rides_update_driver` now requires `is_approved_online_driver()` + WITH CHECK |
| H-1 | 9 missing FK indexes | **Fixed:** All added |
| H-2 | Driver location bottleneck on `driver_profiles` | **Fixed:** `driver_locations` table created |
| H-5 | Only `rides` in Realtime | **Fixed:** 6 tables now published |
| M-1 | Hardcoded 15% commission | **Fixed:** `commission_rates` + `platform_fees` tables |
| M-2 | Denormalized `passenger_profiles` fields | **Fixed:** Columns removed; sync trigger dropped |
| M-3 | Full AVG scan on every rating | **Fixed:** Incremental computation with `rating_count` |
| M-4 | Double-count `total_rides` on retry | **Fixed:** Increment inside conflict-safe path |
| M-5 | `notifications` UPDATE no WITH CHECK | **Fixed:** `WITH CHECK (read_at IS NOT NULL)` |
| M-7 | `driver_payouts.payment_method` raw text | **Fixed:** Now uses `payment_method` enum |
| L-1 | Missing `rides.created_at` index | **Fixed:** `rides_created_at_idx` |
| L-2 | Missing `ride_status_history.changed_at` index | **Fixed:** `ride_status_history_changed_at_idx` |
| L-3 | Missing partial index for online/approved drivers | **Fixed:** `driver_profiles_online_approved_idx` |
| L-4 | Missing partial GIST index for pending rides | **Fixed:** `rides_pending_pickup_location_idx` |
| L-6 | Route polyline bloating `rides` row | **Fixed:** `ride_routes` table with extraction triggers |
| L-8 | Missing CHECK constraints on numeric fields | **Fixed:** Added to rides, driver_earnings, vehicles |
| E-2 | No `fare_rules` table | **Done:** Created with temporal versioning |
| E-3 | No `admin_audit_log` table | **Done:** Created with JSONB snapshots |

---

### OPEN — HIGH

#### H-3 — Maps Edge Functions Have No JWT Validation or Rate Limiting

All four Maps functions have `verify_jwt: false`. Any caller who obtains the function URL can make unlimited Google Maps API calls at your cost.

**Fix:** Enable `verify_jwt: true` or add rate limiting.

---

#### H-6 — Redundant Rides SELECT Policy

`"Drivers can view their own rides"` (authenticated role) is functionally identical to `rides_select_driver_own` (public role). Redundant policies add confusion and marginally impact policy evaluation.

**Fix:** Drop the redundant policy.

---

### OPEN — MEDIUM

#### M-8 — `admin-approve-driver` Does Not Record `approved_by`

The Edge Function sets `approved_at` but not `approved_by`.

**Fix:** Extract admin's user ID from JWT claims and include in update.

---

### OPEN — LOW

#### L-5 — `job_alerts` Has Dual Soft-Delete Semantics

Both `is_active = false` and `deleted_at IS NOT NULL` represent "inactive." A partial index was added but the dual semantics remain ambiguous.

**Fix:** Standardize on one mechanism (recommend `deleted_at`).

---

#### L-7 — `handle_new_auth_user` Uses `'pending-<uuid>'` Placeholders

Driver signups with missing email/phone get a `pending-<uuid>` string in UNIQUE columns.

**Fix:** Allow `NULL` or use `NULLS NOT DISTINCT` on the unique constraint.

---

### Future / Enterprise-Scale Enhancements

| ID | Enhancement | Status |
| -- | ----------- | ------ |
| E-1 | Partition `ride_status_history` by month | Not started |
| E-4 | Use `pgmq` for async notification delivery | Not started |
| E-5 | Add `driver_location_history` for route replay | Not started |
| E-6 | Materialized views for admin reporting | Not started |

---

_Last audited: April 2026 | Blue Taxi PH — Supabase Project `qmbwreizcwnxxfcpmdyr`_
