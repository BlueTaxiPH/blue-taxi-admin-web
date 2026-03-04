# Blue Taxi PH — Database Infrastructure

> **Project:** Blue Taxi PH
> **Supabase Project ID:** `qmbwreizcwnxxfcpmdyr`
> **Region:** `ap-southeast-2` (Sydney)
> **PostgreSQL Version:** 17.6
> **Last Documented:** February 2026
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
  - Update current GPS location (`driver_profiles.current_location`)
  - Accept pending rides (UPDATE `rides`)
  - Progress through ride statuses (navigating → arrived → in-progress → completed)
  - View earnings via `driver_earnings`
  - Chat with passenger via `conversations` and `messages`

### 2.3 Admin Dashboard

- **Stack:** Web application (Next.js)
- **Auth:** Supabase Auth with `role = 'admin'` in `users`
- **Key operations:**
  - **Create driver accounts** — server action using service role: creates auth user (`auth.admin.createUser` with `user_metadata.role = 'driver'`), which fires `handle_new_auth_user` to create `users` + `driver_profiles`; optionally inserts initial `vehicles` row. Drivers then sign in with credentials shared or reset by admin.
  - Review and approve/reject driver applications via `admin-approve-driver` Edge Function
  - View and manage all rides, users, documents
  - Create driver payouts via `admin-create-payout` Edge Function
  - Monitor system activity and notifications

### 2.4 Supabase Database

- PostgreSQL 17 with PostGIS, pgmq, pg_cron, pg_net
- 14 tables, all with RLS enabled
- 9 custom enums
- 11 SECURITY DEFINER functions
- 15 triggers across 7 tables

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
| Realtime Publication | `supabase_realtime` (selective tables) |

---

## 4. Extensions

| Extension            | Version | Purpose                                                                                                    |
| -------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `postgis`            | 3.3.7   | Geospatial data types (`geography`) and spatial indexing (`GIST`) for driver location and ride coordinates |
| `pg_cron`            | 1.6.4   | Scheduled database jobs (currently installed, no active jobs defined)                                      |
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

The full state machine for a single ride.

| Value                   | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `pending`               | Ride created, awaiting driver acceptance           |
| `accepted`              | A driver has accepted the ride                     |
| `navigating_to_pickup`  | Driver en route to passenger pickup location       |
| `arrived_at_pickup`     | Driver has reached the pickup location             |
| `waiting_for_passenger` | Driver is waiting at the pickup point              |
| `trip_in_progress`      | Passenger is in the vehicle, trip underway         |
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

Vehicle category affecting fare calculation.

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

| Value       | Description                                 |
| ----------- | ------------------------------------------- |
| `metered`   | Fare calculated by distance/time meter      |
| `estimated` | Upfront estimated fare shown before booking |

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

Central identity table. Every authenticated user in `auth.users` has exactly one corresponding row here.

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

One-to-one extension of `users` for driver-specific data, including their live GPS location.

| Column                | Type                         | Nullable | Default             | Notes                                                     |
| --------------------- | ---------------------------- | -------- | ------------------- | --------------------------------------------------------- |
| `id`                  | `uuid`                       | NO       | `gen_random_uuid()` | PK                                                        |
| `user_id`             | `uuid`                       | NO       | —                   | UNIQUE FK → `users(id)` ON DELETE CASCADE                 |
| `verification_status` | `driver_verification_status` | NO       | `'pending'`         |                                                           |
| `is_online`           | `boolean`                    | NO       | `false`             | Driver available to receive rides                         |
| `avg_rating`          | `numeric`                    | NO       | `0.00`              | Updated by `update_avg_rating` trigger                    |
| `total_rides`         | `integer`                    | NO       | `0`                 | Updated by `create_driver_earnings_on_completion` trigger |
| `approved_at`         | `timestamptz`                | YES      | —                   | Set when admin approves                                   |
| `approved_by`         | `uuid`                       | YES      | —                   | FK → `users(id)`                                          |
| `created_at`          | `timestamptz`                | NO       | `now()`             |                                                           |
| `updated_at`          | `timestamptz`                | NO       | `now()`             |                                                           |
| `current_location`    | `geography(Point, 4326)`     | YES      | —                   | Live GPS position; updated by Driver App                  |

**Indexes:** `driver_profiles_pkey` (id), `driver_profiles_user_id_key` (user_id UNIQUE), `driver_profiles_location_idx` GIST (current_location)

---

### `passenger_profiles`

One-to-one extension of `users` for passenger-specific data.

> **Note:** `first_name`, `last_name`, `photo_url` are denormalized from `users` and kept in sync by the `trg_sync_passenger_profile_user_fields` trigger. This duplication is a known debt item.

| Column        | Type          | Nullable | Default             | Notes                                                     |
| ------------- | ------------- | -------- | ------------------- | --------------------------------------------------------- |
| `id`          | `uuid`        | NO       | `gen_random_uuid()` | PK                                                        |
| `user_id`     | `uuid`        | NO       | —                   | UNIQUE FK → `users(id)` ON DELETE CASCADE                 |
| `avg_rating`  | `numeric`     | NO       | `0.00`              | Updated by `update_avg_rating` trigger                    |
| `total_rides` | `integer`     | NO       | `0`                 | Updated by `create_driver_earnings_on_completion` trigger |
| `first_name`  | `text`        | YES      | —                   | Synced from `users.first_name`                            |
| `last_name`   | `text`        | YES      | —                   | Synced from `users.last_name`                             |
| `photo_url`   | `text`        | YES      | —                   | Synced from `users.photo_url`                             |
| `created_at`  | `timestamptz` | NO       | `now()`             |                                                           |
| `updated_at`  | `timestamptz` | NO       | `now()`             |                                                           |

**Indexes:** `passenger_profiles_pkey` (id), `passenger_profiles_user_id_key` (user_id UNIQUE)

---

### `vehicles`

A driver may register multiple vehicles but only one can be active at a time (enforced by partial unique index).

| Column         | Type           | Nullable | Default             | Notes                                         |
| -------------- | -------------- | -------- | ------------------- | --------------------------------------------- |
| `id`           | `uuid`         | NO       | `gen_random_uuid()` | PK                                            |
| `driver_id`    | `uuid`         | NO       | —                   | FK → `driver_profiles(id)` ON DELETE CASCADE  |
| `type`         | `vehicle_type` | NO       | —                   | `basic` or `xl`                               |
| `plate_number` | `text`         | NO       | —                   | UNIQUE across all vehicles                    |
| `make`         | `text`         | NO       | —                   | e.g., "Toyota"                                |
| `model`        | `text`         | NO       | —                   | e.g., "Vios"                                  |
| `year`         | `smallint`     | NO       | —                   | Manufacturing year                            |
| `color`        | `text`         | NO       | —                   |                                               |
| `is_active`    | `boolean`      | NO       | `true`              | At most one active vehicle per driver         |
| `is_verified`  | `boolean`      | NO       | `false`             | Set true by admin after document verification |
| `created_at`   | `timestamptz`  | NO       | `now()`             |                                               |
| `updated_at`   | `timestamptz`  | NO       | `now()`             |                                               |

**Indexes:** `vehicles_pkey`, `vehicles_plate_number_key` (UNIQUE), `vehicles_one_active_per_driver` (UNIQUE on `driver_id` WHERE `is_active = true`)

---

### `driver_documents`

Stores the uploaded document URLs for driver verification. Each document type maps to a file in Supabase Storage.

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

**Indexes:** `driver_documents_pkey`
**Missing index:** `driver_id`, `verified_by` (flagged by Supabase Performance Advisor)

---

### `rides`

The core operational table. Contains the complete record of every ride request from creation through completion or cancellation. `pickup_location` and `dropoff_location` are generated columns computed from their respective lat/lng pairs.

| Column                 | Type                     | Nullable | Default             | Notes                                      |
| ---------------------- | ------------------------ | -------- | ------------------- | ------------------------------------------ |
| `id`                   | `uuid`                   | NO       | `gen_random_uuid()` | PK                                         |
| `passenger_id`         | `uuid`                   | NO       | —                   | FK → `users(id)`                           |
| `driver_id`            | `uuid`                   | YES      | —                   | FK → `users(id)` — set on acceptance       |
| `vehicle_id`           | `uuid`                   | YES      | —                   | FK → `vehicles(id)` — set on acceptance    |
| `status`               | `ride_status`            | NO       | `'pending'`         | Full ride state machine                    |
| `pickup_address`       | `text`                   | NO       | —                   | Human-readable address                     |
| `pickup_lat`           | `numeric`                | NO       | —                   |                                            |
| `pickup_lng`           | `numeric`                | NO       | —                   |                                            |
| `pickup_place_id`      | `text`                   | YES      | —                   | Google Place ID                            |
| `pickup_note`          | `text`                   | YES      | —                   | Passenger instructions                     |
| `dropoff_address`      | `text`                   | NO       | —                   |                                            |
| `dropoff_lat`          | `numeric`                | NO       | —                   |                                            |
| `dropoff_lng`          | `numeric`                | NO       | —                   |                                            |
| `dropoff_place_id`     | `text`                   | YES      | —                   | Google Place ID                            |
| `distance_meters`      | `integer`                | YES      | —                   | Route distance from Directions API         |
| `duration_seconds`     | `integer`                | YES      | —                   | Estimated trip duration                    |
| `route_polyline`       | `text`                   | YES      | —                   | Encoded Google Maps polyline               |
| `fare_type`            | `fare_type`              | YES      | —                   | `metered` or `estimated`                   |
| `estimated_fare`       | `numeric`                | YES      | —                   | Pre-trip fare estimate                     |
| `final_fare`           | `numeric`                | YES      | —                   | Actual fare charged on completion          |
| `payment_method`       | `payment_method`         | YES      | —                   |                                            |
| `accepted_at`          | `timestamptz`            | YES      | —                   | When driver accepted                       |
| `arrived_at_pickup_at` | `timestamptz`            | YES      | —                   | When driver arrived                        |
| `trip_started_at`      | `timestamptz`            | YES      | —                   | When trip began                            |
| `trip_completed_at`    | `timestamptz`            | YES      | —                   | When trip ended                            |
| `cancelled_at`         | `timestamptz`            | YES      | —                   |                                            |
| `cancelled_by`         | `cancellation_actor`     | YES      | —                   | `passenger`, `driver`, or `system`         |
| `cancellation_reason`  | `text`                   | YES      | —                   | Free-text reason                           |
| `created_at`           | `timestamptz`            | NO       | `now()`             |                                            |
| `updated_at`           | `timestamptz`            | NO       | `now()`             |                                            |
| `pickup_location`      | `geography(Point, 4326)` | YES      | GENERATED           | Computed from `pickup_lat`, `pickup_lng`   |
| `dropoff_location`     | `geography(Point, 4326)` | YES      | GENERATED           | Computed from `dropoff_lat`, `dropoff_lng` |

**Indexes:** `rides_pkey`, `rides_passenger_id_idx`, `rides_driver_id_idx`, `rides_status_idx`, `rides_pickup_location_idx` (GIST on `pickup_location`)
**Missing index:** `vehicle_id`
**Realtime:** YES — `rides` is the only table in `supabase_realtime` publication

---

### `ride_status_history`

Append-only audit log. One row is written for every ride status transition. The initial `pending` status is also recorded on ride creation.

| Column       | Type          | Nullable | Default             | Notes                                                  |
| ------------ | ------------- | -------- | ------------------- | ------------------------------------------------------ |
| `id`         | `uuid`        | NO       | `gen_random_uuid()` | PK                                                     |
| `ride_id`    | `uuid`        | NO       | —                   | FK → `rides(id)` ON DELETE CASCADE                     |
| `status`     | `ride_status` | NO       | —                   | The new status                                         |
| `changed_by` | `uuid`        | YES      | —                   | FK → `users(id)` — `NULL` for system-triggered changes |
| `changed_at` | `timestamptz` | NO       | `now()`             |                                                        |

**Indexes:** `ride_status_history_pkey`, `ride_status_history_ride_id_idx`
**Missing index:** `changed_at` (useful for date-range analytics)

---

### `job_alerts`

Driver-defined geographic zones. When a new ride is created in an alert area, the driver can be notified (notification delivery logic lives in the application layer or Edge Functions).

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

**Indexes:** `job_alerts_pkey`, `job_alerts_driver_id_idx`
**Note:** Dual deletion semantics (`is_active` and `deleted_at`) — no partial index on active alerts

---

### `ride_ratings`

Bidirectional rating system. After a ride is completed, both the passenger and driver can rate each other. One rating per person per ride (enforced by unique constraint on `ride_id, rater_id`).

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
**Indexes:** `ride_ratings_pkey`, `ride_ratings_ride_id_rater_id_key`, `ride_ratings_ratee_id_idx`
**Missing index:** `rater_id`

---

### `conversations`

One conversation record per ride. Created automatically when a driver accepts a ride (via `on_ride_accepted` trigger). Links the passenger and driver for in-app chat.

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

---

### `messages`

Individual chat messages within a conversation.

| Column            | Type          | Nullable | Default             | Notes                                      |
| ----------------- | ------------- | -------- | ------------------- | ------------------------------------------ |
| `id`              | `uuid`        | NO       | `gen_random_uuid()` | PK                                         |
| `conversation_id` | `uuid`        | NO       | —                   | FK → `conversations(id)` ON DELETE CASCADE |
| `sender_id`       | `uuid`        | NO       | —                   | FK → `users(id)`                           |
| `text`            | `text`        | NO       | —                   | Message body                               |
| `read_at`         | `timestamptz` | YES      | —                   | When the recipient read the message        |
| `created_at`      | `timestamptz` | NO       | `now()`             |                                            |

**Indexes:** `messages_pkey`, `messages_conversation_id_idx`, `messages_created_at_idx`
**Missing index:** `sender_id`

---

### `notifications`

Persistent record of all notifications sent to users. The `data` JSONB field carries context-specific payload per notification type.

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

**Indexes:** `notifications_pkey`, `notifications_user_id_idx`, `notifications_read_at_idx` (partial: BTREE on `(user_id, read_at) WHERE read_at IS NULL`)

---

### `driver_earnings`

One earnings record per completed ride. Created automatically by the `on_ride_completed` trigger. Commission is hardcoded at 15% in the trigger function.

| Column              | Type            | Nullable | Default             | Notes                                                     |
| ------------------- | --------------- | -------- | ------------------- | --------------------------------------------------------- |
| `id`                | `uuid`          | NO       | `gen_random_uuid()` | PK                                                        |
| `driver_id`         | `uuid`          | NO       | —                   | FK → `driver_profiles(id)`                                |
| `ride_id`           | `uuid`          | NO       | —                   | UNIQUE FK → `rides(id)`                                   |
| `gross_amount`      | `numeric`       | NO       | —                   | Total fare amount                                         |
| `commission_rate`   | `numeric`       | NO       | —                   | Rate applied (currently 0.1500)                           |
| `commission_amount` | `numeric`       | NO       | —                   | `gross_amount × commission_rate`                          |
| `net_amount`        | `numeric`       | NO       | —                   | `gross_amount − commission_amount`                        |
| `payout_status`     | `payout_status` | NO       | `'pending'`         |                                                           |
| `payout_id`         | `uuid`          | YES      | —                   | FK → `driver_payouts(id)` — set when included in a payout |
| `created_at`        | `timestamptz`   | NO       | `now()`             |                                                           |

**Indexes:** `driver_earnings_pkey`, `driver_earnings_ride_id_key` (UNIQUE), `driver_earnings_driver_id_idx`, `driver_earnings_payout_status_idx`
**Missing index:** `payout_id`

---

### `driver_payouts`

Payout batch records created by admin. After creating a payout, the admin links individual `driver_earnings` rows to it by updating `driver_earnings.payout_id`.

| Column             | Type            | Nullable | Default             | Notes                                     |
| ------------------ | --------------- | -------- | ------------------- | ----------------------------------------- |
| `id`               | `uuid`          | NO       | `gen_random_uuid()` | PK                                        |
| `driver_id`        | `uuid`          | NO       | —                   | FK → `driver_profiles(id)`                |
| `total_amount`     | `numeric`       | NO       | —                   | Total payout amount                       |
| `status`           | `payout_status` | NO       | `'pending'`         |                                           |
| `payment_method`   | `text`          | YES      | —                   | Free-text (inconsistent — should be enum) |
| `reference_number` | `text`          | YES      | —                   | External payment reference                |
| `processed_by`     | `uuid`          | YES      | —                   | FK → `users(id)` — admin who processed    |
| `processed_at`     | `timestamptz`   | YES      | —                   |                                           |
| `created_at`       | `timestamptz`   | NO       | `now()`             |                                           |

**Indexes:** `driver_payouts_pkey`, `driver_payouts_driver_id_idx`, `driver_payouts_status_idx`
**Missing index:** `processed_by`

---

## 7. Indexes

### Complete Index Inventory

| Table                 | Index Name                                         | Type         | Columns                              | Partial?                 |
| --------------------- | -------------------------------------------------- | ------------ | ------------------------------------ | ------------------------ |
| `conversations`       | `conversations_pkey`                               | BTREE UNIQUE | `id`                                 | —                        |
| `conversations`       | `conversations_passenger_id_idx`                   | BTREE        | `passenger_id`                       | —                        |
| `conversations`       | `conversations_driver_id_idx`                      | BTREE        | `driver_id`                          | —                        |
| `conversations`       | `conversations_ride_id_key`                        | BTREE UNIQUE | `ride_id`                            | —                        |
| `conversations`       | `conversations_passenger_id_driver_id_ride_id_key` | BTREE UNIQUE | `(passenger_id, driver_id, ride_id)` | —                        |
| `driver_documents`    | `driver_documents_pkey`                            | BTREE UNIQUE | `id`                                 | —                        |
| `driver_earnings`     | `driver_earnings_pkey`                             | BTREE UNIQUE | `id`                                 | —                        |
| `driver_earnings`     | `driver_earnings_ride_id_key`                      | BTREE UNIQUE | `ride_id`                            | —                        |
| `driver_earnings`     | `driver_earnings_driver_id_idx`                    | BTREE        | `driver_id`                          | —                        |
| `driver_earnings`     | `driver_earnings_payout_status_idx`                | BTREE        | `payout_status`                      | —                        |
| `driver_payouts`      | `driver_payouts_pkey`                              | BTREE UNIQUE | `id`                                 | —                        |
| `driver_payouts`      | `driver_payouts_driver_id_idx`                     | BTREE        | `driver_id`                          | —                        |
| `driver_payouts`      | `driver_payouts_status_idx`                        | BTREE        | `status`                             | —                        |
| `driver_profiles`     | `driver_profiles_pkey`                             | BTREE UNIQUE | `id`                                 | —                        |
| `driver_profiles`     | `driver_profiles_user_id_key`                      | BTREE UNIQUE | `user_id`                            | —                        |
| `driver_profiles`     | `driver_profiles_location_idx`                     | GIST         | `current_location`                   | —                        |
| `job_alerts`          | `job_alerts_pkey`                                  | BTREE UNIQUE | `id`                                 | —                        |
| `job_alerts`          | `job_alerts_driver_id_idx`                         | BTREE        | `driver_id`                          | —                        |
| `messages`            | `messages_pkey`                                    | BTREE UNIQUE | `id`                                 | —                        |
| `messages`            | `messages_conversation_id_idx`                     | BTREE        | `conversation_id`                    | —                        |
| `messages`            | `messages_created_at_idx`                          | BTREE        | `created_at`                         | —                        |
| `notifications`       | `notifications_pkey`                               | BTREE UNIQUE | `id`                                 | —                        |
| `notifications`       | `notifications_user_id_idx`                        | BTREE        | `user_id`                            | —                        |
| `notifications`       | `notifications_read_at_idx`                        | BTREE        | `(user_id, read_at)`                 | `WHERE read_at IS NULL`  |
| `passenger_profiles`  | `passenger_profiles_pkey`                          | BTREE UNIQUE | `id`                                 | —                        |
| `passenger_profiles`  | `passenger_profiles_user_id_key`                   | BTREE UNIQUE | `user_id`                            | —                        |
| `ride_ratings`        | `ride_ratings_pkey`                                | BTREE UNIQUE | `id`                                 | —                        |
| `ride_ratings`        | `ride_ratings_ride_id_rater_id_key`                | BTREE UNIQUE | `(ride_id, rater_id)`                | —                        |
| `ride_ratings`        | `ride_ratings_ratee_id_idx`                        | BTREE        | `ratee_id`                           | —                        |
| `ride_status_history` | `ride_status_history_pkey`                         | BTREE UNIQUE | `id`                                 | —                        |
| `ride_status_history` | `ride_status_history_ride_id_idx`                  | BTREE        | `ride_id`                            | —                        |
| `rides`               | `rides_pkey`                                       | BTREE UNIQUE | `id`                                 | —                        |
| `rides`               | `rides_passenger_id_idx`                           | BTREE        | `passenger_id`                       | —                        |
| `rides`               | `rides_driver_id_idx`                              | BTREE        | `driver_id`                          | —                        |
| `rides`               | `rides_status_idx`                                 | BTREE        | `status`                             | —                        |
| `rides`               | `rides_pickup_location_idx`                        | GIST         | `pickup_location`                    | —                        |
| `users`               | `users_pkey`                                       | BTREE UNIQUE | `id`                                 | —                        |
| `users`               | `users_email_key`                                  | BTREE UNIQUE | `email`                              | —                        |
| `users`               | `users_phone_key`                                  | BTREE UNIQUE | `phone`                              | —                        |
| `vehicles`            | `vehicles_pkey`                                    | BTREE UNIQUE | `id`                                 | —                        |
| `vehicles`            | `vehicles_plate_number_key`                        | BTREE UNIQUE | `plate_number`                       | —                        |
| `vehicles`            | `vehicles_one_active_per_driver`                   | BTREE UNIQUE | `driver_id`                          | `WHERE is_active = true` |

### Missing Indexes (Flagged by Supabase Performance Advisor)

| Table                 | Column         | Reason                                              |
| --------------------- | -------------- | --------------------------------------------------- |
| `driver_documents`    | `driver_id`    | Unindexed FK — driver document lookups do full scan |
| `driver_documents`    | `verified_by`  | Unindexed FK — admin audit queries                  |
| `driver_earnings`     | `payout_id`    | Unindexed FK — payout reconciliation joins          |
| `driver_payouts`      | `processed_by` | Unindexed FK — admin audit queries                  |
| `driver_profiles`     | `approved_by`  | Unindexed FK — admin audit queries                  |
| `messages`            | `sender_id`    | Unindexed FK — message sender lookups               |
| `ride_ratings`        | `rater_id`     | Unindexed FK — rater history queries                |
| `ride_status_history` | `changed_by`   | Unindexed FK — actor audit queries                  |
| `rides`               | `vehicle_id`   | Unindexed FK — vehicle-to-ride joins                |

---

## 8. Foreign Key Constraints

| Constraint                            | Source                           | Target               | On Delete |
| ------------------------------------- | -------------------------------- | -------------------- | --------- |
| `users_id_fkey`                       | `users.id`                       | `auth.users.id`      | CASCADE   |
| `driver_profiles_user_id_fkey`        | `driver_profiles.user_id`        | `users.id`           | CASCADE   |
| `driver_profiles_approved_by_fkey`    | `driver_profiles.approved_by`    | `users.id`           | RESTRICT  |
| `passenger_profiles_user_id_fkey`     | `passenger_profiles.user_id`     | `users.id`           | CASCADE   |
| `vehicles_driver_id_fkey`             | `vehicles.driver_id`             | `driver_profiles.id` | CASCADE   |
| `driver_documents_driver_id_fkey`     | `driver_documents.driver_id`     | `driver_profiles.id` | CASCADE   |
| `driver_documents_verified_by_fkey`   | `driver_documents.verified_by`   | `users.id`           | RESTRICT  |
| `rides_passenger_id_fkey`             | `rides.passenger_id`             | `users.id`           | RESTRICT  |
| `rides_driver_id_fkey`                | `rides.driver_id`                | `users.id`           | RESTRICT  |
| `rides_vehicle_id_fkey`               | `rides.vehicle_id`               | `vehicles.id`        | RESTRICT  |
| `ride_status_history_ride_id_fkey`    | `ride_status_history.ride_id`    | `rides.id`           | CASCADE   |
| `ride_status_history_changed_by_fkey` | `ride_status_history.changed_by` | `users.id`           | RESTRICT  |
| `job_alerts_driver_id_fkey`           | `job_alerts.driver_id`           | `driver_profiles.id` | CASCADE   |
| `ride_ratings_ride_id_fkey`           | `ride_ratings.ride_id`           | `rides.id`           | CASCADE   |
| `ride_ratings_rater_id_fkey`          | `ride_ratings.rater_id`          | `users.id`           | RESTRICT  |
| `ride_ratings_ratee_id_fkey`          | `ride_ratings.ratee_id`          | `users.id`           | RESTRICT  |
| `conversations_ride_id_fkey`          | `conversations.ride_id`          | `rides.id`           | RESTRICT  |
| `conversations_passenger_id_fkey`     | `conversations.passenger_id`     | `users.id`           | RESTRICT  |
| `conversations_driver_id_fkey`        | `conversations.driver_id`        | `users.id`           | RESTRICT  |
| `messages_conversation_id_fkey`       | `messages.conversation_id`       | `conversations.id`   | CASCADE   |
| `messages_sender_id_fkey`             | `messages.sender_id`             | `users.id`           | RESTRICT  |
| `notifications_user_id_fkey`          | `notifications.user_id`          | `users.id`           | CASCADE   |
| `driver_payouts_driver_id_fkey`       | `driver_payouts.driver_id`       | `driver_profiles.id` | RESTRICT  |
| `driver_payouts_processed_by_fkey`    | `driver_payouts.processed_by`    | `users.id`           | RESTRICT  |
| `driver_earnings_driver_id_fkey`      | `driver_earnings.driver_id`      | `driver_profiles.id` | RESTRICT  |
| `driver_earnings_ride_id_fkey`        | `driver_earnings.ride_id`        | `rides.id`           | RESTRICT  |
| `driver_earnings_payout_id_fkey`      | `driver_earnings.payout_id`      | `driver_payouts.id`  | RESTRICT  |

---

## 9. Database Functions

All functions use `SECURITY DEFINER` and pin `search_path = 'public'` to prevent search path injection attacks.

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

**Used in RLS policies for:** `driver_documents`, `driver_earnings`, `driver_payouts`, `driver_profiles`, `job_alerts`, `notifications`, `passenger_profiles`, `ride_ratings`, `ride_status_history`, `rides`, `users`, `vehicles`

---

### `is_approved_online_driver() → boolean`

**Volatility:** STABLE

Checks if the currently authenticated user is a driver who is both `approved` and currently `is_online = true`. Used as the gate for drivers to see the pending rides feed.

```sql
SELECT EXISTS (
  SELECT 1 FROM driver_profiles dp
  WHERE dp.user_id = auth.uid()
    AND dp.verification_status = 'approved'
    AND dp.is_online = true
);
```

**Used in RLS policy:** `rides_select_driver_pending`

---

### `handle_new_auth_user() → trigger`

**Trigger:** `AFTER INSERT ON auth.users` (managed by Supabase Auth schema)

Automatically provisions a `users` row and optionally a `driver_profiles` row when a new user is created in `auth.users`. Reads `role` from `raw_user_meta_data`. **Driver accounts are only created by admins** via the Admin Dashboard server action using `auth.admin.createUser()` (service role); the Driver App has no sign-up flow. Passengers are still created via the Passenger App (Welcome screen upsert); drivers are created only when the trigger runs after an admin creates the auth user with `role: 'driver'` in metadata.

```
auth.users INSERT (e.g. auth.admin.createUser from Admin Dashboard)
  └─ reads raw_user_meta_data.role
      ├─ 'passenger' → skip (Passenger App Welcome screen handles upsert)
      └─ 'driver'    → INSERT into users + INSERT into driver_profiles (verification_status = 'pending')
```

> **Security Note:** This function trusts `raw_user_meta_data` for role assignment. Admin role must never be assignable via this path (see Known Issues). Driver profile and vehicle INSERTs via direct client calls are blocked by RLS; only the trigger (and service-role admin flows) create driver profiles.

---

### `set_updated_at() → trigger`

**Volatility:** VOLATILE

Generic trigger function used across multiple tables to automatically update `updated_at = now()` before each UPDATE.

**Applied to:** `users`, `driver_profiles`, `driver_documents`, `passenger_profiles`, `vehicles`, `rides`, `job_alerts`

---

### `log_ride_initial_status() → trigger`

**Trigger:** `AFTER INSERT ON rides`

Writes the first entry in `ride_status_history` when a ride is created. Sets `changed_by` to the `passenger_id` (the creator).

---

### `log_ride_status_change() → trigger`

**Trigger:** `AFTER UPDATE ON rides`

Writes to `ride_status_history` whenever `rides.status` changes. Uses `auth.uid()` to record the actor.

> **Note:** `auth.uid()` will return `NULL` when the update is triggered by another SECURITY DEFINER function rather than a direct client call. This results in `changed_by = NULL` for system-triggered transitions.

---

### `create_conversation_on_ride_accept() → trigger`

**Trigger:** `AFTER UPDATE ON rides`

When a ride status changes to `'accepted'`, automatically creates a `conversations` row linking the passenger and driver. Uses `ON CONFLICT DO NOTHING` for idempotency.

---

### `create_driver_earnings_on_completion() → trigger`

**Trigger:** `AFTER UPDATE ON rides`

When a ride status changes to `'completed'`:

1. Resolves the `driver_profiles.id` from `rides.driver_id`
2. Calculates gross, commission (hardcoded 15%), and net amounts
3. INSERTs into `driver_earnings` with `ON CONFLICT (ride_id) DO NOTHING`
4. Increments `driver_profiles.total_rides + 1`
5. Increments `passenger_profiles.total_rides + 1`

> **Known Issue:** Steps 4 and 5 (total_rides increments) are not inside the conflict check — they run even if the earnings insert was skipped, causing potential double-counting on retries.

---

### `update_avg_rating() → trigger`

**Trigger:** `AFTER INSERT ON ride_ratings`

Recalculates the average rating for the `ratee_id` using a full `AVG()` scan of all their ratings, then updates both `driver_profiles.avg_rating` and `passenger_profiles.avg_rating` for that user (only one will match).

> **Performance Note:** Full aggregate scan on every new rating. At scale, use an incremental update formula instead.

---

### `update_conversation_last_message() → trigger`

**Trigger:** `AFTER INSERT ON messages`

Updates `conversations.last_message_at` to the new message's `created_at` timestamp.

---

### `sync_passenger_profile_user_fields() → trigger`

**Trigger:** `AFTER INSERT OR UPDATE ON users`

Copies `first_name`, `last_name`, and `photo_url` from `users` to `passenger_profiles` to keep the denormalized fields in sync.

> **Known Debt:** Symptom of denormalization in `passenger_profiles`. See Known Issues.

---

## 10. Triggers

| Trigger Name                             | Table                | Event          | Timing | Function Called                          |
| ---------------------------------------- | -------------------- | -------------- | ------ | ---------------------------------------- |
| `set_users_updated_at`                   | `users`              | UPDATE         | BEFORE | `set_updated_at()`                       |
| `trg_sync_passenger_profile_user_fields` | `users`              | INSERT, UPDATE | AFTER  | `sync_passenger_profile_user_fields()`   |
| `set_driver_profiles_updated_at`         | `driver_profiles`    | UPDATE         | BEFORE | `set_updated_at()`                       |
| `set_driver_documents_updated_at`        | `driver_documents`   | UPDATE         | BEFORE | `set_updated_at()`                       |
| `set_passenger_profiles_updated_at`      | `passenger_profiles` | UPDATE         | BEFORE | `set_updated_at()`                       |
| `set_vehicles_updated_at`                | `vehicles`           | UPDATE         | BEFORE | `set_updated_at()`                       |
| `set_rides_updated_at`                   | `rides`              | UPDATE         | BEFORE | `set_updated_at()`                       |
| `set_job_alerts_updated_at`              | `job_alerts`         | UPDATE         | BEFORE | `set_updated_at()`                       |
| `on_ride_created`                        | `rides`              | INSERT         | AFTER  | `log_ride_initial_status()`              |
| `on_ride_status_change`                  | `rides`              | UPDATE         | AFTER  | `log_ride_status_change()`               |
| `on_ride_accepted`                       | `rides`              | UPDATE         | AFTER  | `create_conversation_on_ride_accept()`   |
| `on_ride_completed`                      | `rides`              | UPDATE         | AFTER  | `create_driver_earnings_on_completion()` |
| `on_ride_rating_inserted`                | `ride_ratings`       | INSERT         | AFTER  | `update_avg_rating()`                    |
| `on_message_inserted`                    | `messages`           | INSERT         | AFTER  | `update_conversation_last_message()`     |

> **Note:** The `rides` table has 4 AFTER UPDATE triggers (`set_rides_updated_at` runs BEFORE, then `on_ride_status_change`, `on_ride_accepted`, and `on_ride_completed` all fire AFTER). All 3 AFTER triggers check `OLD.status IS DISTINCT FROM NEW.status` before doing work — only the relevant one performs an action per status transition.

---

## 11. Row Level Security (RLS)

RLS is enabled on all 14 public tables. All policies use `PERMISSIVE` mode (Postgres ORs permissive policies together).

Two SECURITY DEFINER helper functions — `is_admin()` and `is_approved_online_driver()` — serve as role gates across many policies.

> **Performance Warning (Supabase Advisor — 47 occurrences):** Many policies call `auth.uid()` inside subquery USING clauses without the `(SELECT auth.uid())` optimization. This causes PostgreSQL to re-evaluate the auth call as a correlated subquery per row rather than a one-time init-plan, degrading query performance significantly at scale. See [Section 19](#19-known-issues--recommendations).

---

### `users` — 6 Policies

| Policy                                            | Operation | Who           | Condition                   |
| ------------------------------------------------- | --------- | ------------- | --------------------------- |
| `users_insert_service`                            | INSERT    | public        | `id = auth.uid()`           |
| `users_select_own`                                | SELECT    | public        | `id = auth.uid()`           |
| `users_select_admin`                              | SELECT    | public        | `is_admin()`                |
| `users_update_own`                                | UPDATE    | public        | `id = auth.uid()`           |
| `users_update_admin`                              | UPDATE    | public        | `is_admin()`                |
| `Authenticated users can read public user fields` | SELECT    | authenticated | `true` ⚠️                   |
| `users_select_passenger_for_pending_rides`        | SELECT    | authenticated | Passenger of a pending ride |

> **Critical:** The `"Authenticated users can read public user fields"` policy with `qual: true` exposes every user's PII (email, phone, role) to all authenticated users. See Known Issues.

---

### `driver_profiles` — 5 Policies (INSERT restricted)

| Policy                                         | Operation | Who    | Condition                                  |
| ---------------------------------------------- | --------- | ------ | ------------------------------------------ |
| `driver_profiles_select_own`                   | SELECT    | public | `user_id = auth.uid()`                     |
| `driver_profiles_select_admin`                 | SELECT    | public | `is_admin()`                               |
| `driver_profiles_select_passenger_active_ride` | SELECT    | public | Passenger has active ride with this driver |
| `driver_profiles_update_own`                   | UPDATE    | public | `user_id = auth.uid()`                     |
| `driver_profiles_update_admin`                 | UPDATE    | public | `is_admin()`                               |

**INSERT:** No RLS policy. Driver profiles are created **only** by the `handle_new_auth_user` trigger when an admin creates a driver auth user via `auth.admin.createUser()` (Admin Dashboard server action with service role). The previous `driver_profiles_insert_own` policy was dropped to prevent driver self-registration via direct REST API calls.

---

### `passenger_profiles` — 4 Policies

| Policy                                         | Operation | Who    | Condition                                  |
| ---------------------------------------------- | --------- | ------ | ------------------------------------------ |
| `passenger_profiles_insert_own`                | INSERT    | public | `user_id = auth.uid()`                     |
| `passenger_profiles_select_own`                | SELECT    | public | `user_id = auth.uid()`                     |
| `passenger_profiles_select_admin`              | SELECT    | public | `is_admin()`                               |
| `passenger_profiles_select_driver_active_ride` | SELECT    | public | Driver has active ride with this passenger |
| `passenger_profiles_update_own`                | UPDATE    | public | `user_id = auth.uid()`                     |

---

### `vehicles` — 5 Policies (INSERT restricted)

| Policy                                  | Operation | Who    | Condition                                   |
| --------------------------------------- | --------- | ------ | ------------------------------------------- |
| `vehicles_select_own_driver`            | SELECT    | public | Driver owns the driver_profile              |
| `vehicles_select_admin`                 | SELECT    | public | `is_admin()`                                |
| `vehicles_select_passenger_active_ride` | SELECT    | public | Passenger has active ride with this vehicle |
| `vehicles_update_own_driver`            | UPDATE    | public | Driver owns the driver_profile              |
| `vehicles_update_admin`                 | UPDATE    | public | `is_admin()`                                |

**INSERT:** No RLS policy for authenticated drivers. Initial vehicle records for new drivers are created by the Admin Dashboard server action (service role) when creating a driver. The previous `vehicles_insert_own_driver` policy was dropped to enforce admin-only driver onboarding; drivers can still **update** their own vehicles. (If drivers are allowed to add additional vehicles after onboarding, a dedicated RPC or a new INSERT policy scoped to existing driver profiles may be added later.)

---

### `driver_documents` — 3 Policies (INSERT restricted)

| Policy                          | Operation | Who    | Condition                      |
| ------------------------------- | --------- | ------ | ------------------------------ |
| `driver_documents_select_own`   | SELECT    | public | Driver owns the driver_profile |
| `driver_documents_select_admin` | SELECT    | public | `is_admin()`                   |
| `driver_documents_update_admin` | UPDATE    | public | `is_admin()`                   |

**INSERT:** No RLS policy. The previous `driver_documents_insert_own` policy was dropped so that driver self-registration cannot create document rows via the client. Document creation for new drivers is intended to be done by the admin flow or a dedicated RPC; drivers may be granted INSERT via a future policy or RPC if they are allowed to upload additional documents after onboarding.

---

### `rides` — 9 Policies ⚠️ Contains security issues

| Policy                             | Operation | Roles         | USING Condition                                      | WITH CHECK                  |
| ---------------------------------- | --------- | ------------- | ---------------------------------------------------- | --------------------------- |
| `rides_insert_passenger`           | INSERT    | public        | —                                                    | `passenger_id = auth.uid()` |
| `rides_select_passenger`           | SELECT    | public        | `passenger_id = auth.uid()`                          | —                           |
| `rides_select_driver_own`          | SELECT    | public        | `driver_id = auth.uid()`                             | —                           |
| `rides_select_driver_pending`      | SELECT    | public        | `status = 'pending' AND is_approved_online_driver()` | —                           |
| `rides_select_admin`               | SELECT    | public        | `is_admin()`                                         | —                           |
| `rides_update_passenger_cancel`    | UPDATE    | public        | `passenger_id = auth.uid()`                          | —                           |
| `rides_update_driver`              | UPDATE    | public        | `driver_id = auth.uid() OR status = 'pending'` ⚠️    | —                           |
| `rides_update_admin`               | UPDATE    | public        | `is_admin()`                                         | —                           |
| `Drivers can view pending rides`   | SELECT    | authenticated | `status = 'pending'` ⚠️                              | —                           |
| `Drivers can accept pending rides` | UPDATE    | authenticated | `status = 'pending'` ⚠️                              | `driver_id = auth.uid()`    |

> **Issues:**
>
> - `rides_update_driver`: The `OR status = 'pending'` branch allows any authenticated user to update a pending ride. No role check.
> - `"Drivers can view pending rides"`: `roles: authenticated` — passengers can see pending rides.
> - `"Drivers can accept pending rides"`: Duplicate of `rides_update_driver`. No `is_approved_online_driver()` check.
> - No race condition guard — two drivers can simultaneously accept the same ride.

---

### `ride_status_history` — 3 Policies

| Policy                                 | Operation | Condition             |
| -------------------------------------- | --------- | --------------------- |
| `ride_status_history_select_passenger` | SELECT    | Passenger of the ride |
| `ride_status_history_select_driver`    | SELECT    | Driver of the ride    |
| `ride_status_history_select_admin`     | SELECT    | `is_admin()`          |

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
| `ride_ratings_insert_own`         | INSERT    | `rater_id = auth.uid()` AND ride is completed AND caller is participant |
| `ride_ratings_select_participant` | SELECT    | `rater_id = auth.uid() OR ratee_id = auth.uid()`                        |
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
| `notifications_select_own`      | SELECT    | `user_id = auth.uid()`                                         |
| `notifications_select_admin`    | SELECT    | `is_admin()`                                                   |
| `notifications_update_own_read` | UPDATE    | `user_id = auth.uid()` ⚠️ No WITH CHECK — all columns writable |

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

## 12. Edge Functions

All functions run on Deno in Supabase's Edge Runtime. Base URL: `https://qmbwreizcwnxxfcpmdyr.supabase.co/functions/v1/`

---

### `maps-autocomplete`

**JWT Required:** No | **Status:** ACTIVE

Google Places Autocomplete proxy. Keeps the Google Maps API key server-side so it is never exposed to client bundles.

**Request:**

```json
{
  "input": "Makati",
  "componentRestrictions": { "country": "PH" },
  "types": "geocode",
  "sessiontoken": "<uuid>"
}
```

**Response:** Raw Google Places Autocomplete JSON (`predictions[]`, `status`)

**Used by:** Passenger App, Driver App — location search inputs

---

### `maps-nearby`

**JWT Required:** No | **Status:** ACTIVE

Google Places Nearby Search proxy using the Places API v2. Returns nearby places within a radius for the "use current location" feature.

**Request:**

```json
{
  "location": { "latitude": 14.5547, "longitude": 121.0244 },
  "radiusMeters": 500,
  "maxResultCount": 5,
  "includedTypes": ["establishment"]
}
```

**Response:** `{ places: [ { id, displayName, formattedAddress, location, types } ] }`

**Used by:** Passenger App — nearby locations when using current position as pickup

---

### `maps-directions`

**JWT Required:** No | **Status:** ACTIVE

Google Maps Directions API proxy. Returns route data including decoded coordinates, distance, duration, and the encoded polyline for map rendering.

**Request:**

```json
{
  "origin": { "latitude": 14.5547, "longitude": 121.0244 },
  "destination": { "latitude": 14.5832, "longitude": 121.053 },
  "mode": "driving"
}
```

**Response:**

```json
{
  "coordinates": [ { "latitude": ..., "longitude": ... } ],
  "distance": { "text": "5.3 km", "value": 5300 },
  "duration": { "text": "18 mins", "value": 1080 },
  "polyline": "<encoded>"
}
```

**Used by:** Passenger App (route preview), Driver App (navigation path)

---

### `maps-place-details`

**JWT Required:** No | **Status:** ACTIVE

Google Places Details proxy using the Places API v2. Resolves a Place ID to coordinates, display name, and formatted address.

**Request:**

```json
{ "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA" }
```

**Response:**

```json
{
  "latitude": 14.5547,
  "longitude": 121.0244,
  "displayName": "Makati City Hall",
  "formattedAddress": "Makati Ave, Makati, Metro Manila, Philippines"
}
```

**Used by:** Passenger App — resolving autocomplete selections to coordinates

---

### `admin-approve-driver`

**JWT Required:** Yes | **Status:** ACTIVE

Approves or rejects a driver's application. Uses the **service role key** to bypass RLS — caller must present a valid admin JWT (enforced by `verify_jwt: true`).

**Request:**

```json
{ "driverId": "<driver_profiles.id>", "action": "approve" }
```

```json
{ "driverId": "<driver_profiles.id>", "action": "reject" }
```

**Response:** `{ "success": true, "status": "approved" }`

**Database writes:** Updates `driver_profiles.verification_status` and `driver_profiles.approved_at`

> **Note:** `approved_by` (the admin's `user_id`) is not recorded by this function. This is a missing audit trail field.

---

### `admin-create-payout`

**JWT Required:** Yes | **Status:** ACTIVE

Creates a new `driver_payouts` record for a driver. Uses the **service role key** to bypass RLS.

**Request:**

```json
{ "driverId": "<driver_profiles.id>", "amount": 1250.0 }
```

**Response:** `{ "success": true, "payout": { ...driver_payouts row... } }`

**Database writes:** INSERTs into `driver_payouts` with `status = 'pending'`

> **Note:** This function does not link existing `driver_earnings` rows to the new payout record. That linking step must be done separately.

---

## 13. Realtime Architecture

### Publication Configuration

| Publication                              | Tables                        | Events                 |
| ---------------------------------------- | ----------------------------- | ---------------------- |
| `supabase_realtime`                      | `rides` only                  | INSERT, UPDATE, DELETE |
| `supabase_realtime_messages_publication` | (internal Supabase messaging) | —                      |

### Current Realtime Subscriptions

Only `rides` publishes changes to Supabase Realtime. The Passenger App subscribes to its own active ride row to receive status updates in real time.

```
Passenger App
  └─ SUBSCRIBE to rides WHERE id = <rideId>
      └─ Receives status changes: pending → accepted → navigating → ... → completed
```

### Tables NOT in Realtime Publication (Gaps)

| Table             | Real-time Need                       | Current Workaround |
| ----------------- | ------------------------------------ | ------------------ |
| `driver_profiles` | Driver location updates for live map | Polling            |
| `messages`        | In-ride chat delivery                | Polling            |
| `notifications`   | Push notification triggers           | Polling            |
| `conversations`   | Unread count / last message          | Polling            |

### Driver Location Flow (Current — Polling-Based)

```
Driver App (every N seconds)
  └─ UPDATE driver_profiles SET current_location = ST_MakePoint(lng, lat)
      └─ Passenger App polls driver_profiles via REST to get location
```

### Recommended Realtime Flow (After Adding to Publication)

```
Driver App (every N seconds)
  └─ UPDATE driver_profiles SET current_location = ...
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
   ├─ Trigger: log_ride_initial_status → ride_status_history
   └─ RLS: rides_select_driver_pending allows online approved drivers to see it
                                                          5. Driver sees pending ride
                                                             (polling or realtime)

                                                          6. Driver accepts ride
                                                             UPDATE rides SET
                                                               driver_id, status='accepted'
                                                             ├─ Trigger: log_ride_status_change
                                                             │    → ride_status_history
                                                             └─ Trigger: create_conversation_on_ride_accept
                                                                  → conversations (INSERT)

7. Passenger receives
   status='accepted' via Realtime
   └─ Loads driver profile, vehicle info

8. Driver navigates to pickup
   UPDATE rides (status='navigating_to_pickup')
   └─ Trigger: log_ride_status_change

9. Driver arrives
   UPDATE rides (status='arrived_at_pickup')
   └─ Trigger: log_ride_status_change

10. Trip starts
    UPDATE rides (status='trip_in_progress',
                  trip_started_at=now())
    └─ Trigger: log_ride_status_change

11. Trip completes
    UPDATE rides (status='completed',
                  final_fare=X,
                  trip_completed_at=now())
    ├─ Trigger: log_ride_status_change
    └─ Trigger: create_driver_earnings_on_completion
         ├─ INSERT driver_earnings
         ├─ UPDATE driver_profiles.total_rides + 1
         └─ UPDATE passenger_profiles.total_rides + 1

12. Both parties rate
    INSERT ride_ratings (rater_id, ratee_id, rating)
    └─ Trigger: update_avg_rating
         ├─ UPDATE driver_profiles.avg_rating
         └─ UPDATE passenger_profiles.avg_rating
```

---

## 15. Data Flow: Driver Onboarding

Driver accounts are **created only by admins**. The Driver App supports **sign-in only** (no sign-up or self-registration). RLS INSERT policies on `driver_profiles`, `vehicles`, and `driver_documents` were dropped so that only the trigger (and service-role admin flows) can create driver-related rows.

```
Admin Dashboard                    Supabase Auth / Database
────────────────                    ────────────────────────
1. Admin creates driver (Add Driver modal / page)
   → Server action: createDriver() using SUPABASE_SERVICE_ROLE_KEY
   → auth.admin.createUser({
        email, phone, email_confirm: true,
        password: <temp e.g. randomUUID(); admin shares or sends reset>,
        user_metadata: { role: 'driver', first_name, last_name, phone }
      })
   → auth.users INSERT
   └─ Trigger: handle_new_auth_user (auth schema)
        ├─ INSERT users (role='driver')
        └─ INSERT driver_profiles (verification_status='pending')

2. Optional: server action inserts initial vehicle
   → INSERT vehicles (driver_id = driver_profiles.id, plate_number, make, type)
   → (service role bypasses RLS)

3. Admin shares credentials or sends password reset to driver

Driver App (sign-in only)
4. Driver signs in (email + password)
   → signInWithPassword()
   → App checks users.role === 'driver'; if not, sign out and show error
   → If driver: proceed to home

5. Driver uploads documents (when INSERT allowed via RPC or restored policy)
   → Supabase Storage upload → get file_url
   → INSERT driver_documents (if policy or RPC permits)

6. Admin reviews and approves
   → POST /functions/v1/admin-approve-driver
        { "driverId": "...", "action": "approve" }
   → service role UPDATE driver_profiles
        SET verification_status='approved', approved_at=now()

7. Driver goes online
   → UPDATE driver_profiles SET is_online=true
   → Driver now passes is_approved_online_driver()
   → Driver appears in pending rides feed
```

**Summary**

| Actor            | Creates driver auth/profile/vehicle | Signs in driver app |
| -----------------| ------------------------------------|---------------------|
| Admin Dashboard  | Yes (server action + service role)  | —                   |
| Driver App       | No (no sign-up; RLS blocks INSERT) | Yes (sign-in only)  |

---

## 16. Data Flow: Driver Earnings & Payouts

```
Ride Completion
  └─ Trigger: create_driver_earnings_on_completion
       └─ INSERT driver_earnings
            driver_id     = <driver_profile_id>
            ride_id       = <ride_id>
            gross_amount  = final_fare
            commission_rate = 0.15
            commission_amount = gross × 0.15
            net_amount    = gross − commission
            payout_status = 'pending'

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
       → (via is_admin() RLS)

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
  └─ If driver (approved + online): can read pending rides, accept rides
  └─ If driver (any status): can update own driver_profile, vehicles (no INSERT on driver_profiles/vehicles/driver_documents — admin-only driver creation)
  └─ **Drivers cannot self-register:** no INSERT on driver_profiles, vehicles, or driver_documents from client

admin (authenticated + role='admin' in users)
  └─ Full SELECT on all tables (via is_admin())
  └─ **Only admins create driver accounts** (via Admin Dashboard server action using service role)
  └─ Full control over driver verification, payouts, rides
  └─ Can call JWT-protected Edge Functions

service_role (internal — Admin Dashboard server actions + Edge Functions)
  └─ Bypasses RLS entirely
  └─ Used by Admin Dashboard "Create Driver" server action (auth.admin.createUser + optional vehicle INSERT)
  └─ Used by admin-approve-driver and admin-create-payout Edge Functions
```

### SECURITY DEFINER Functions

All 11 functions use `SECURITY DEFINER` with `SET search_path = 'public'`. This means they run with the permissions of the function owner (typically `postgres`) rather than the caller. This is necessary for trigger functions that need to write to tables the caller cannot directly access.

### Known Security Issues

See [Section 19](#19-known-issues--recommendations) for the full list. Critical items:

1. `"Authenticated users can read public user fields"` exposes all user PII
2. `rides_update_driver` allows any authenticated user to update pending rides
3. `handle_new_auth_user` can be exploited to create admin users via metadata
4. Ride acceptance has no atomic race condition protection

---

## 18. Environment Variables

| Variable                    | Used By                      | Description                                                                 |
| --------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `GOOGLE_MAPS_API_KEY`       | All Maps Edge Functions      | Google Maps Platform API key (Places v2, Directions)                        |
| `NEXT_PUBLIC_SUPABASE_URL`  | Admin Dashboard (client)     | Project URL for client-side Supabase SDK                                    |
| `SUPABASE_URL`              | Admin Edge Functions         | Project URL (auto-injected by Supabase runtime)                             |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Dashboard (server), Edge Functions | Service role key for create-driver server action and admin Edge Functions; never expose to client |
| `SUPABASE_ANON_KEY`         | Client apps                  | Public anon key for client-side SDK initialization                         |

---

## 19. Known Issues & Recommendations

Issues are grouped by severity. Items marked **[BEFORE LAUNCH]** must be resolved before going to production.

---

### CRITICAL

#### C-1 — `auth_rls_initplan`: 47 RLS Policies Have Sub-Optimal `auth.uid()` Calls **[BEFORE LAUNCH]**

**Impact:** Every query on nearly every table re-evaluates `auth.uid()` and helper function calls as correlated subqueries per row rather than once per query. This is the single largest performance bottleneck in the schema at any meaningful scale.

**Fix:** Wrap all `auth.uid()` references inside RLS policy conditions with the `(SELECT auth.uid())` pattern:

```sql
-- Current (slow at scale):
WHERE user_id = auth.uid()

-- Fixed (evaluated once per statement):
WHERE user_id = (SELECT auth.uid())
```

Apply to every policy that references `auth.uid()` or calls `is_admin()` / `is_approved_online_driver()` inside a subquery.

---

#### C-2 — Ride Acceptance Has No Atomic Race Condition Protection **[BEFORE LAUNCH]**

**Impact:** Two online drivers can simultaneously accept the same pending ride. With `READ COMMITTED` isolation, both UPDATEs can succeed within the same sub-millisecond window, resulting in double-assignment.

**Fix:** Move ride acceptance to a Supabase RPC function that uses `SELECT ... FOR UPDATE NOWAIT`:

```sql
BEGIN;
SELECT id FROM rides WHERE id = $ride_id AND status = 'pending' FOR UPDATE NOWAIT;
-- Returns 0 rows if already taken → return false to caller
UPDATE rides SET driver_id = $driver_id, status = 'accepted', accepted_at = now()
WHERE id = $ride_id AND status = 'pending';
COMMIT;
```

The client receives a boolean and shows "Ride already taken" if false.

---

#### C-3 — `users` Table is Globally Readable by All Authenticated Users **[BEFORE LAUNCH]**

**Impact:** Any authenticated user can read every row in `users`, including email, phone number, role, and photo of all passengers, drivers, and admins — a significant PII leak.

**Fix:** Remove the `"Authenticated users can read public user fields"` policy. The existing fine-grained policies already cover all legitimate use cases. Add a missing policy for passengers to read their active ride's driver info if not already covered.

---

#### C-4 — `handle_new_auth_user` Reads `role` From Client-Controlled Metadata **[BEFORE LAUNCH]**

**Impact:** A malicious actor signing up with `raw_user_meta_data: { role: 'admin' }` gets an admin row in `users`.

**Fix:** Whitelist only `passenger` and `driver` in the trigger. Never assign `admin` via this path. Admin users should be created directly via service role or a secure admin provisioning script.

---

#### C-5 — `rides_update_driver` Allows Any Authenticated User to UPDATE Pending Rides **[BEFORE LAUNCH]**

**Impact:** The USING clause `(driver_id = auth.uid()) OR (status = 'pending')` means any authenticated user — including passengers — can modify a pending ride's fields.

**Fix:** Replace with `driver_id = auth.uid() AND is_approved_online_driver()` to restrict updates to approved, online drivers only.

---

### HIGH

#### H-1 — 9 Foreign Key Columns Have No Indexes

Add the following indexes to prevent sequential scans on FK-join queries:

```sql
CREATE INDEX ON driver_documents (driver_id);
CREATE INDEX ON driver_documents (verified_by);
CREATE INDEX ON driver_earnings (payout_id);
CREATE INDEX ON driver_payouts (processed_by);
CREATE INDEX ON driver_profiles (approved_by);
CREATE INDEX ON messages (sender_id);
CREATE INDEX ON ride_ratings (rater_id);
CREATE INDEX ON ride_status_history (changed_by);
CREATE INDEX ON rides (vehicle_id);
```

---

#### H-2 — Driver Location Updates Will Bottleneck `driver_profiles` at Scale

At 100+ concurrent online drivers updating location every 3-5 seconds, `driver_profiles` receives ~20-30 writes/second on a table serving heavy RLS-gated reads. `driver_profiles` is also not in the realtime publication, forcing the passenger app to poll.

**Fix:** Create a dedicated `driver_locations` table for high-frequency position writes:

```sql
CREATE TABLE driver_locations (
  driver_id  uuid PRIMARY KEY REFERENCES driver_profiles(id) ON DELETE CASCADE,
  location   geography(Point, 4326) NOT NULL,
  bearing    numeric(5,2),
  speed_kmh  numeric(5,1),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON driver_locations USING GIST (location);
```

Add `driver_locations` to the `supabase_realtime` publication. The passenger app subscribes to the driver's location row during an active ride.

---

#### H-3 — Maps Edge Functions Have No JWT Validation or Rate Limiting

All four Maps functions have `verify_jwt: false`. The only protection is API key secrecy. Any caller who obtains the function URL can make unlimited Google Maps API calls at your cost.

**Fix:** Enable `verify_jwt: true` to require an authenticated session. Add rate limiting logic (e.g., using `pg_net` or an external service) if public access is required.

---

#### H-4 — `notifications` Table Has No Cleanup Strategy

Notifications accumulate indefinitely. At 10+ notifications per ride, a high-volume platform generates millions of rows quickly.

**Fix:** Set up a `pg_cron` job to delete read notifications older than 90 days:

```sql
SELECT cron.schedule(
  'purge-old-notifications',
  '0 3 * * *',
  $$DELETE FROM notifications WHERE read_at IS NOT NULL AND created_at < now() - interval '90 days'$$
);
```

---

#### H-5 — Only `rides` is in the Realtime Publication

`driver_profiles`, `messages`, `notifications`, and `conversations` are not subscribed for realtime delivery. The app currently uses polling for these.

**Fix:** Add these tables to `supabase_realtime`:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

Use Supabase's column-level filtering to avoid broadcasting sensitive fields.

---

### MEDIUM

#### M-1 — Commission Rate is Hardcoded in Trigger Function

`create_driver_earnings_on_completion` hardcodes `v_commission_rate := 0.1500`. Changing rates requires a DB migration and has no audit trail.

**Fix:** Create a `commission_rates (id, vehicle_type, rate, effective_from, effective_to)` table. Look up the applicable rate at ride completion time.

---

#### M-2 — `passenger_profiles` Denormalizes Fields From `users`

`first_name`, `last_name`, `photo_url` exist in both `users` and `passenger_profiles`. The sync trigger compensates but creates dual-write risk and additional latency on every user update.

**Fix:** Remove these three columns from `passenger_profiles`. Any view requiring them should JOIN to `users`. The `trg_sync_passenger_profile_user_fields` trigger and `sync_passenger_profile_user_fields` function can be dropped.

---

#### M-3 — `update_avg_rating` Does Full `AVG()` Scan on Every Rating

**Fix:** Use incremental computation:

```sql
UPDATE driver_profiles
SET avg_rating = ROUND(
  ((avg_rating * (SELECT COUNT(*) - 1 FROM ride_ratings WHERE ratee_id = NEW.ratee_id))
    + NEW.rating)
  / (SELECT COUNT(*) FROM ride_ratings WHERE ratee_id = NEW.ratee_id)
, 2)
WHERE user_id = NEW.ratee_id;
```

Or store a `rating_count` column alongside `avg_rating` for O(1) updates.

---

#### M-4 — `create_driver_earnings_on_completion` Double-Counts `total_rides` on Retry

The `total_rides` increment runs outside the `ON CONFLICT DO NOTHING` guard. On transactional retry, `total_rides` increments again while the earnings row is skipped.

**Fix:** Move the `total_rides` increment inside the conflict-safe path, or check `NOT FOUND` after the earnings insert before incrementing.

---

#### M-5 — `notifications_update_own_read` Has No `WITH CHECK` Constraint

Users can update any column on their own notifications, not just `read_at`.

**Fix:** Add `WITH CHECK (read_at IS NOT NULL)` to restrict updates to the read-marking action only.

---

#### M-6 — `ride_ratings` Allows Self-Rating

No constraint prevents `rater_id = ratee_id`.

**Fix:** Add `CHECK (rater_id <> ratee_id)`.

---

#### M-7 — `driver_payouts.payment_method` is Raw `text`

Inconsistent with `rides.payment_method` which uses the `payment_method` enum.

**Fix:** Create a `payout_method` enum (values may differ from `payment_method` — e.g., add `bank_transfer`) and alter the column type.

---

#### M-8 — `admin-approve-driver` Does Not Record `approved_by`

The Edge Function sets `approved_at` but does not set `approved_by` with the admin's user ID.

**Fix:** Extract the admin's user ID from the JWT claims in the Edge Function and include it in the update payload.

---

### LOW

#### L-1 — Missing `rides.created_at` Index

Admin dashboards and date-range ride queries do full scans without this index.

```sql
CREATE INDEX rides_created_at_idx ON rides (created_at DESC);
```

---

#### L-2 — Missing `ride_status_history.changed_at` Index

Analytics and date-range audit queries need this.

```sql
CREATE INDEX ride_status_history_changed_at_idx ON ride_status_history (changed_at DESC);
```

---

#### L-3 — Missing Partial Index for Online Approved Drivers

The `is_approved_online_driver()` function runs on every pending-ride SELECT. The `driver_profiles` table scan for finding available drivers has no dedicated index.

```sql
CREATE INDEX driver_profiles_online_approved_idx
ON driver_profiles (user_id)
WHERE is_online = true AND verification_status = 'approved';
```

---

#### L-4 — Missing Partial GIST Index for Pending Rides Spatial Query

The most critical spatial query — "find pending rides near me" — cannot combine the `rides_status_idx` (BTree) with the `rides_pickup_location_idx` (GIST) in a single scan.

```sql
CREATE INDEX rides_pending_pickup_location_idx
ON rides USING GIST (pickup_location)
WHERE status = 'pending';
```

At scale with millions of historical rides, only a tiny fraction are `'pending'` at any given moment. This partial index covers exactly that subset.

---

#### L-5 — `job_alerts` Has Dual Soft-Delete Semantics

Both `is_active = false` and `deleted_at IS NOT NULL` represent "inactive." This is ambiguous and there is no index to efficiently filter active alerts.

**Fix:** Pick one mechanism (recommend `deleted_at` for soft-delete). Add a partial index:

```sql
CREATE INDEX job_alerts_active_idx ON job_alerts (driver_id) WHERE deleted_at IS NULL;
```

---

#### L-6 — `route_polyline` Stored in Main `rides` Row

An encoded polyline can be 10-50KB. Storing it inline inflates every `SELECT * FROM rides` result and Supabase Realtime payloads.

**Fix:** Move to a separate table:

```sql
CREATE TABLE ride_routes (
  ride_id  uuid PRIMARY KEY REFERENCES rides(id) ON DELETE CASCADE,
  polyline text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

#### L-7 — `handle_new_auth_user` Uses `'pending-<uuid>'` Placeholders for Unique Columns

Driver signups with missing email/phone get a `pending-<uuid>` string inserted into UNIQUE columns. This complicates future profile completion flows.

**Fix:** Allow `NULL` in `users.email` and `users.phone` (update the UNIQUE constraint to `NULLS NOT DISTINCT` or rely on Postgres's natural NULL handling in unique indexes). Store actual data only when provided.

---

#### L-8 — No `CHECK` Constraints on Numeric Business Fields

Add validation:

```sql
ALTER TABLE rides ADD CHECK (estimated_fare > 0);
ALTER TABLE rides ADD CHECK (final_fare > 0);
ALTER TABLE driver_earnings ADD CHECK (commission_rate BETWEEN 0 AND 1);
ALTER TABLE driver_earnings ADD CHECK (gross_amount > 0);
ALTER TABLE vehicles ADD CHECK (year BETWEEN 1990 AND 2030);
```

---

### Future / Enterprise-Scale Enhancements

#### E-1 — Partition `ride_status_history` by Month

At 1M+ rides, `ride_status_history` will have 8M+ rows. Declarative partitioning by `changed_at` month enables efficient pruning:

```sql
-- Conceptual — requires migration:
PARTITION BY RANGE (changed_at)
```

#### E-2 — Add `fare_rules` Table

No pricing logic exists in the database. Fare rules should be versioned and referenced by `rides.fare_rule_id` for audit purposes.

#### E-3 — Add `admin_audit_log` Table

Track all admin operations with `before/after` JSONB snapshots for compliance and dispute resolution.

#### E-4 — Use `pgmq` for Async Notification Delivery

`pgmq` is installed but unused. It is well-suited for decoupled push notification delivery: a trigger enqueues a notification job, and a separate `pg_net`-powered consumer dispatches it to FCM/APNs without blocking the transaction.

#### E-5 — Add `driver_location_history` for Route Replay

A time-series table of driver positions enables post-trip route verification and dispute resolution.

#### E-6 — Materialized Views for Admin Reporting

Pre-compute `mv_driver_earnings_monthly` and `mv_ride_stats_daily` refreshed by `pg_cron` to avoid expensive aggregates on admin dashboards.

---

_Last audited: February 2026 | Blue Taxi PH — Supabase Project `qmbwreizcwnxxfcpmdyr`_
