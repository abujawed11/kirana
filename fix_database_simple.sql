-- Simple database fix for Kirana inventory system
-- Run this in your MySQL database

USE kirana_db;

-- Fix the main issue: Change seller_id from INT to VARCHAR
ALTER TABLE products MODIFY COLUMN seller_id VARCHAR(20) NOT NULL;

-- Add basic indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id);

-- Verify the change worked
DESCRIBE products;

-- Show current data
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as category_count FROM product_categories;