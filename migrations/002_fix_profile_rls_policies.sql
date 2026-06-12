-- Migration: fix_profile_rls_policies
-- Issue: #29 P0-SEC-01
-- Date: 2026-06-12
-- Description: Replace overly permissive RLS policies on profile table with user_id-scoped policies.
--   Previously, any authenticated user could update/insert any profile (USING/WITH CHECK true).
--   Now, users can only update/insert their own profile (auth.uid() = user_id).

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.profile;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profile;

-- Create scoped policies
CREATE POLICY "Enable update for users based on user_id" ON public.profile
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users based on user_id" ON public.profile
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
