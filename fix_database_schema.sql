-- Complete database setup and fix for Kirana inventory system
-- Run this in your MySQL database

USE kirana_db;

-- First, check if tables exist and fix seller_id data type
-- Drop foreign key constraints if they exist
SET FOREIGN_KEY_CHECKS = 0;

-- Fix products table
ALTER TABLE products MODIFY COLUMN seller_id VARCHAR(20) NOT NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create or update indexes (using safe approach for compatibility)
-- Drop old index if it exists (ignore error if it doesn't exist)
ALTER TABLE products DROP INDEX IF EXISTS idx_seller_id;

-- Create new indexes
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);

-- Ensure categories table exists with sample data
INSERT IGNORE INTO product_categories (id, name, description, is_active) VALUES
(1, 'Groceries', 'Groceries & Staples', TRUE),
(2, 'Vegetables', 'Fresh Vegetables', TRUE),
(3, 'Fruits', 'Fresh Fruits', TRUE),
(4, 'Dairy', 'Dairy & Eggs', TRUE),
(5, 'Beverages', 'Beverages', TRUE),
(6, 'Snacks', 'Snacks & Packaged', TRUE),
(7, 'Household', 'Household Items', TRUE),
(8, 'Personal Care', 'Personal Care', TRUE);

-- Ensure subcategories table exists with sample data
INSERT IGNORE INTO product_subcategories (id, category_id, name, description, is_active) VALUES
-- Groceries subcategories
(1, 1, 'Rice & Grains', 'Rice, wheat, and other grains', TRUE),
(2, 1, 'Dal & Pulses', 'Lentils and pulses', TRUE),
(3, 1, 'Flour & Atta', 'Wheat flour and other flours', TRUE),
(4, 1, 'Sugar & Jaggery', 'Sweeteners', TRUE),
(5, 1, 'Cooking Oil', 'Edible oils', TRUE),
(6, 1, 'Spices & Masalas', 'Spices and seasonings', TRUE),

-- Vegetables subcategories
(7, 2, 'Leafy Vegetables', 'Spinach, lettuce, etc.', TRUE),
(8, 2, 'Root Vegetables', 'Potatoes, carrots, etc.', TRUE),
(9, 2, 'Gourds', 'Bottle gourd, pumpkin, etc.', TRUE),
(10, 2, 'Beans & Pods', 'Green beans, peas, etc.', TRUE),
(11, 2, 'Onions & Garlic', 'Onions, garlic, ginger', TRUE),
(12, 2, 'Tomatoes & Capsicum', 'Tomatoes, peppers', TRUE),

-- Fruits subcategories
(13, 3, 'Seasonal Fruits', 'Mangoes, oranges, etc.', TRUE),
(14, 3, 'Citrus Fruits', 'Lemons, oranges, etc.', TRUE),
(15, 3, 'Dry Fruits & Nuts', 'Almonds, cashews, etc.', TRUE),
(16, 3, 'Exotic Fruits', 'Dragon fruit, kiwi, etc.', TRUE),
(17, 3, 'Bananas', 'All banana varieties', TRUE),
(18, 3, 'Apples & Grapes', 'Apples, grapes, etc.', TRUE),

-- Dairy subcategories
(19, 4, 'Milk', 'Fresh milk products', TRUE),
(20, 4, 'Curd & Yogurt', 'Yogurt products', TRUE),
(21, 4, 'Paneer', 'Cottage cheese', TRUE),
(22, 4, 'Butter & Ghee', 'Clarified butter', TRUE),
(23, 4, 'Cheese', 'Various cheese types', TRUE),
(24, 4, 'Eggs', 'Chicken and other eggs', TRUE);

-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_images_product_id (product_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create product_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_tag_mappings table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_tag_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product_tag (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES product_tags(id) ON DELETE CASCADE
);

-- Show current table structure to verify
DESCRIBE products;

-- Show a count of existing data
SELECT
    'products' as table_name,
    COUNT(*) as record_count
FROM products
UNION ALL
SELECT
    'product_categories' as table_name,
    COUNT(*) as record_count
FROM product_categories
UNION ALL
SELECT
    'product_subcategories' as table_name,
    COUNT(*) as record_count
FROM product_subcategories;