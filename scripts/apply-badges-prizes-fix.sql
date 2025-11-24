-- =====================================================
-- Quick Fix Script for Badges and Prizes
-- Run this in Supabase SQL Editor
-- =====================================================

-- This script:
-- 1. Fixes RLS policies for user_badges table
-- 2. Fixes RLS policies for hackathon_winners table
-- 3. Ensures users can see their badges and prizes

\i supabase/migrations/20250305000000_fix_badges_and_prizes_rls.sql
