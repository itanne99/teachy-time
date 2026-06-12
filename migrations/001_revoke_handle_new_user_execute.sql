-- Migration: revoke_handle_new_user_execute
-- Issue: #31 P0-SEC-03
-- Date: 2026-06-12
-- Description: Revoke EXECUTE permission on handle_new_user() from anon and authenticated roles.
--   The function should only be called by the on_auth_user_created trigger, not directly via RPC.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
