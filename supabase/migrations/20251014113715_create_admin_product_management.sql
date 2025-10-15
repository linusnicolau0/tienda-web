/*
  # Admin Product Management Migration

  ## Overview
  This migration adds admin role management and updates RLS policies to allow admin users
  to insert, update, and delete products. The admin user with ID '8eb5897b-0108-48d9-95b5-f4d751c031af'
  will have exclusive product management privileges.

  ## Changes Made

  ### 1. Profiles Table Updates
  - Add `role` column to profiles table (default 'user')
  - Possible values: 'user', 'admin'

  ### 2. Products Table RLS Policy Updates
  - PUBLIC: Anyone can view products
  - ADMIN ONLY: Insert new products
  - ADMIN ONLY: Update existing products
  - ADMIN ONLY: Delete products

  ### 3. Analytics Views
  - Create view for product statistics
  - Create view for order statistics
  - Enable admin access to analytics data

  ## Security Notes
  - Only the admin user (8eb5897b-0108-48d9-95b5-f4d751c031af) can manage products
  - RLS policies enforce strict admin-only access
  - Regular users retain read-only access to products
  - Analytics views are restricted to admin users only
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'user';
  END IF;
END $$;

-- Update the specific admin user's role
UPDATE profiles
SET role = 'admin'
WHERE id = '8eb5897b-0108-48d9-95b5-f4d751c031af';

-- Drop existing product policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;

-- Create updated product policies

-- Anyone (authenticated) can view products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Only admin can insert products
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admin can update products
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admin can delete products
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create analytics view for product statistics
CREATE OR REPLACE VIEW product_analytics AS
SELECT
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT p.brand) as total_brands,
  SUM(CASE WHEN p.discount > 0 THEN 1 ELSE 0 END) as products_on_sale,
  AVG(p.price) as average_price,
  p.brand,
  COUNT(*) as products_per_brand
FROM products p
GROUP BY p.brand;

-- Create analytics view for order statistics
CREATE OR REPLACE VIEW order_analytics AS
SELECT
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as total_revenue,
  AVG(o.total_amount) as average_order_value,
  COUNT(DISTINCT o.user_id) as unique_customers,
  DATE(o.created_at) as order_date,
  COUNT(*) as orders_per_day,
  SUM(o.total_amount) as revenue_per_day
FROM orders o
GROUP BY DATE(o.created_at);

-- Create analytics view for popular products
CREATE OR REPLACE VIEW popular_products AS
SELECT
  p.id,
  p.name,
  p.brand,
  p.price,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.price * oi.quantity) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.brand, p.price
ORDER BY total_quantity_sold DESC NULLS LAST;

-- Grant access to analytics views for admin users
GRANT SELECT ON product_analytics TO authenticated;
GRANT SELECT ON order_analytics TO authenticated;
GRANT SELECT ON popular_products TO authenticated;

-- Add index for better performance on role checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
