-- Migration: 20260819110000_database_performance_indexes.sql
-- Description: Optimize database indexes, add missing foreign key indexes, and drop redundant constraints.
-- Resolves: GitHub Issues #33, #34, #35

-- 1. Drop redundant unique constraint on profile (Issue #35 / P1-PERF-03)
-- (Primary key profile_pkey already enforces uniqueness and creates a btree index on user_id)
ALTER TABLE public.profile DROP CONSTRAINT IF EXISTS profile_user_id_key;

-- 2. Drop unused index on alarms (Issue #34 / P1-PERF-02)
DROP INDEX IF EXISTS public.idx_alarms_user_day;

-- 3. Create optimized composite index for schedule queries and overlap checks (Issue #34 / P1-PERF-02)
-- Column order: RLS filter (user_id) -> schedule scope (schedule_id) -> day filtering (day_of_week) -> index sort (start_time)
CREATE INDEX IF NOT EXISTS idx_alarms_user_schedule 
ON public.alarms USING btree (user_id, schedule_id, day_of_week, start_time);

-- 4. Create missing foreign key indexes (Issue #33 / P1-PERF-01)
-- Index for alarms -> schedules cascade and schedule filtering
CREATE INDEX IF NOT EXISTS idx_alarms_schedule_id 
ON public.alarms USING btree (schedule_id);

-- Index for schedules -> auth.users cascade and user filtering
CREATE INDEX IF NOT EXISTS idx_schedules_user_id 
ON public.schedules USING btree (user_id);

-- Partial index for alarms -> alarm_sounds cascade
CREATE INDEX IF NOT EXISTS idx_alarms_sound_id 
ON public.alarms USING btree (sound_id) 
WHERE sound_id IS NOT NULL;
