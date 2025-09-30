-- Fix seller_id column type in products table
-- This script changes seller_id from INT to VARCHAR to match the user_id format (USR0001, USR0002, etc.)

USE kirana_db;

-- First, drop the foreign key constraint if it exists
-- (The original schema didn't show a foreign key, but just in case)
-- ALTER TABLE products DROP FOREIGN KEY IF EXISTS fk_products_seller_id;

-- Modify the seller_id column to be VARCHAR instead of INT
ALTER TABLE products MODIFY COLUMN seller_id VARCHAR(20) NOT NULL;

-- Add an index on seller_id for better query performance
CREATE INDEX idx_products_seller_id ON products(seller_id);

-- Verify the change
DESCRIBE products;