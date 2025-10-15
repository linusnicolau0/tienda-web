/*
  # Set Specific Admin User
  
  ## Overview
  This migration configures the system so that ONLY the user with 
  uid '80ed04f7-a38b-4716-a066-8ae3ffe054b3' can access the admin dashboard
  and perform admin operations.
  
  ## Changes Made
  
  ### 1. Update Profiles Table
  - Set all existing users to 'user' role
  - Set the specific user to 'admin' role
  
  ### 2. Update RLS Policies
  - Products: Only the specific admin can insert, update, delete
  - Brands: Only the specific admin can insert, update, delete
  - All users can still view products and brands
  
  ## Security Notes
  - Only user '80ed04f7-a38b-4716-a066-8ae3ffe054b3' has admin access
  - All other users are restricted to regular user permissions
  - Admin-only operations: product management, brand management
*/

-- First, ensure the profile exists for the admin user
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES (
  '80ed04f7-a38b-4716-a066-8ae3ffe054b3',
  (SELECT email FROM auth.users WHERE id = '80ed04f7-a38b-4716-a066-8ae3ffe054b3'),
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Set all other users to 'user' role
UPDATE profiles
SET role = 'user'
WHERE id != '80ed04f7-a38b-4716-a066-8ae3ffe054b3';

-- Update trigger function to NOT auto-assign admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Always insert new users with 'user' role
  -- Only the specific user '80ed04f7-a38b-4716-a066-8ae3ffe054b3' should be admin
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.id = '80ed04f7-a38b-4716-a066-8ae3ffe054b3' THEN 'admin' 
      ELSE 'user' 
    END,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Products RLS Policies - Only specific admin can modify
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;

CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3');

CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3')
  WITH CHECK (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3');

CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3');

-- Update Brands RLS Policies - Only specific admin can modify
DROP POLICY IF EXISTS "Admin can insert brands" ON brands;
DROP POLICY IF EXISTS "Admin can update brands" ON brands;
DROP POLICY IF EXISTS "Admin can delete brands" ON brands;

CREATE POLICY "Admin can insert brands"
  ON brands FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3');

CREATE POLICY "Admin can update brands"
  ON brands FOR UPDATE
  TO authenticated
  USING (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3')
  WITH CHECK (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3');

CREATE POLICY "Admin can delete brands"
  ON brands FOR DELETE
  TO authenticated
  USING (auth.uid() = '80ed04f7-a38b-4716-a066-8ae3ffe054b3');
