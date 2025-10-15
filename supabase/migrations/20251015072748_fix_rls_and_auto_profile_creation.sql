/*
  # Fix RLS Policies and Auto-create User Profiles
  
  ## Overview
  This migration fixes the RLS policy issue by ensuring user profiles are automatically 
  created when users sign up, and sets the first user as admin.
  
  ## Changes Made
  
  ### 1. Auto-create Profile Trigger
  - Creates a trigger function that automatically creates a profile when a user signs up
  - The first user is automatically assigned the 'admin' role
  - All subsequent users get the 'user' role by default
  
  ### 2. RLS Policy Updates
  - Ensures all tables have proper RLS policies
  - Adds public read access to brands table (no auth required)
  - Keeps admin-only write access for brands
  
  ## Security Notes
  - First registered user becomes admin automatically
  - All other users are regular users by default
  - Brands can be viewed by anyone (including non-authenticated users)
  - Only admins can create, update, or delete brands
*/

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing profiles to determine if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Insert new profile with admin role if first user, otherwise regular user
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'user' END,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to run function when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update brands table policies to allow public read access
DROP POLICY IF EXISTS "Anyone can view brands" ON brands;

-- Allow public (unauthenticated) read access to brands
CREATE POLICY "Anyone can view brands"
  ON brands FOR SELECT
  USING (true);

-- Ensure profiles RLS policies exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
