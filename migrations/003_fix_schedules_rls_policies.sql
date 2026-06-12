-- Migration: fix_schedules_rls_policies
-- Issue: #30 P0-SEC-02
-- Date: 2026-06-12
-- Description: Remove duplicate/permissive RLS policies on schedules table that bypass user-scoped restrictions.
--   Previously, policies with USING/WITH CHECK (true) allowed any authenticated user to read/update/insert any schedule.
--   The user_id-scoped policies remain in place to enforce proper access control.

-- Drop permissive policies that bypass user-scoped restrictions
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.schedules;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.schedules;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.schedules;
