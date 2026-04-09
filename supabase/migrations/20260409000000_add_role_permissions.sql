-- Migration: Add role_permissions table for admin RBAC
-- Run this in Supabase SQL Editor

-- ─────────────────────────────────────────────
-- 1. Create table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_role  text NOT NULL CHECK (admin_role IN ('superadmin', 'blue_taxi_admin', 'insurance_admin')),
  module      text NOT NULL CHECK (module IN ('trips', 'drivers', 'passengers', 'payments', 'system_config', 'analytics', 'insurance_reports')),
  can_access  boolean NOT NULL DEFAULT false,
  updated_by  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (admin_role, module)
);

-- ─────────────────────────────────────────────
-- 2. Enable Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 3. RLS Policies
-- ─────────────────────────────────────────────

-- All active admins can read the permission matrix
CREATE POLICY "active admins can read role_permissions"
  ON public.role_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
        AND role = 'admin'
        AND admin_status = 'active'
        AND is_active = true
    )
  );

-- Only superadmin can insert, update, or delete
CREATE POLICY "superadmin can modify role_permissions"
  ON public.role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
        AND role = 'admin'
        AND admin_role = 'superadmin'
        AND admin_status = 'active'
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
        AND role = 'admin'
        AND admin_role = 'superadmin'
        AND admin_status = 'active'
        AND is_active = true
    )
  );

-- ─────────────────────────────────────────────
-- 4. Seed default permissions (21 rows)
-- ─────────────────────────────────────────────
-- superadmin: full access to everything
-- blue_taxi_admin: all except system_config and insurance_reports
-- insurance_admin: only insurance_reports

INSERT INTO public.role_permissions (admin_role, module, can_access) VALUES
  -- superadmin
  ('superadmin', 'trips',             true),
  ('superadmin', 'drivers',           true),
  ('superadmin', 'passengers',        true),
  ('superadmin', 'payments',          true),
  ('superadmin', 'system_config',     true),
  ('superadmin', 'analytics',         true),
  ('superadmin', 'insurance_reports', true),

  -- blue_taxi_admin
  ('blue_taxi_admin', 'trips',             true),
  ('blue_taxi_admin', 'drivers',           true),
  ('blue_taxi_admin', 'passengers',        true),
  ('blue_taxi_admin', 'payments',          true),
  ('blue_taxi_admin', 'system_config',     false),
  ('blue_taxi_admin', 'analytics',         true),
  ('blue_taxi_admin', 'insurance_reports', false),

  -- insurance_admin
  ('insurance_admin', 'trips',             false),
  ('insurance_admin', 'drivers',           false),
  ('insurance_admin', 'passengers',        false),
  ('insurance_admin', 'payments',          false),
  ('insurance_admin', 'system_config',     false),
  ('insurance_admin', 'analytics',         false),
  ('insurance_admin', 'insurance_reports', true)

ON CONFLICT (admin_role, module) DO NOTHING;

-- ─────────────────────────────────────────────
-- 5. Verify (optional — run to confirm)
-- ─────────────────────────────────────────────
-- SELECT admin_role, module, can_access
-- FROM public.role_permissions
-- ORDER BY admin_role, module;
