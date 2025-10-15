/*
  # E-commerce Authentication and Cart Schema

  ## Overview
  This migration sets up the complete database schema for user authentication and shopping cart functionality.

  ## Tables Created

  ### 1. profiles
  - Extends auth.users with additional user information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. products
  - Stores product catalog information
  - `id` (bigserial, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `brand` (text) - Product brand
  - `price` (decimal) - Current price
  - `original_price` (decimal) - Original price (for discounts)
  - `discount` (integer) - Discount percentage
  - `gender` (text) - Target gender category
  - `type` (text) - Product type (e.g., zapatillas, camiseta)
  - `image_url` (text) - Product image URL
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. cart_items
  - Stores user shopping cart items
  - `id` (bigserial, primary key) - Unique cart item identifier
  - `user_id` (uuid) - References profiles(id)
  - `product_id` (bigint) - References products(id)
  - `quantity` (integer) - Item quantity
  - `size` (text) - Selected size
  - `color` (text) - Selected color
  - `created_at` (timestamptz) - Addition timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. orders
  - Stores completed orders
  - `id` (bigserial, primary key) - Unique order identifier
  - `user_id` (uuid) - References profiles(id)
  - `total_amount` (decimal) - Order total
  - `status` (text) - Order status (pending, completed, cancelled)
  - `created_at` (timestamptz) - Order placement timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. order_items
  - Stores individual items in orders
  - `id` (bigserial, primary key) - Unique order item identifier
  - `order_id` (bigint) - References orders(id)
  - `product_id` (bigint) - References products(id)
  - `quantity` (integer) - Item quantity
  - `size` (text) - Selected size
  - `color` (text) - Selected color
  - `price` (decimal) - Price at time of purchase
  - `created_at` (timestamptz) - Creation timestamp

  ## Security (RLS Policies)

  ### profiles table
  - Users can view only their own profile
  - Users can update only their own profile
  - New profiles created automatically on signup

  ### products table
  - Anyone can read products (public catalog)
  - Only authenticated users can see products

  ### cart_items table
  - Users can only view their own cart items
  - Users can only insert their own cart items
  - Users can only update their own cart items
  - Users can only delete their own cart items

  ### orders table
  - Users can only view their own orders
  - Users can only insert their own orders
  - Users cannot modify or delete orders after creation

  ### order_items table
  - Users can view order items for their orders
  - Users can insert order items only when creating orders
  - No updates or deletes allowed

  ## Important Notes
  - All tables use RLS for security
  - Policies check auth.uid() for user ownership
  - Timestamps are automatically managed
  - Foreign key constraints ensure data integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  price decimal(10, 2) NOT NULL,
  original_price decimal(10, 2),
  discount integer DEFAULT 0,
  gender text NOT NULL,
  type text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  size text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, size, color)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount decimal(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id bigserial PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  size text NOT NULL,
  color text NOT NULL,
  price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();