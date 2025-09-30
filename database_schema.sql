-- Kirana Store Database Schema
-- Run these queries in MySQL Workbench

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS kirana_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kirana_db;

-- Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Subcategories Table
CREATE TABLE IF NOT EXISTS product_subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subcategory (category_id, name)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id INT,
    subcategory_id INT,
    brand VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) DEFAULT 0,
    mrp DECIMAL(10,2) DEFAULT 0,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    unit VARCHAR(20) DEFAULT 'piece',
    weight DECIMAL(10,3),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller_id (seller_id),
    INDEX idx_sku (sku),
    INDEX idx_category (category_id),
    INDEX idx_subcategory (subcategory_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategory_id) REFERENCES product_subcategories(id) ON DELETE SET NULL
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary)
);

-- Product Tags Table
CREATE TABLE IF NOT EXISTS product_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Tags Mapping Table
CREATE TABLE IF NOT EXISTS product_tag_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES product_tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_tag (product_id, tag_id)
);

-- SKU Counter Table (for auto-generating SKUs)
CREATE TABLE IF NOT EXISTS sku_counters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prefix VARCHAR(10) NOT NULL UNIQUE,
    current_number INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT IGNORE INTO product_categories (name, description) VALUES
('Groceries', 'Essential grocery items'),
('Dairy', 'Milk and dairy products'),
('Vegetables', 'Fresh vegetables and greens'),
('Fruits', 'Fresh and seasonal fruits'),
('Beverages', 'Drinks and beverages'),
('Snacks', 'Snacks and confectionery'),
('Personal Care', 'Personal hygiene and care products'),
('Household', 'Household cleaning and utilities');

-- Insert default subcategories
INSERT IGNORE INTO product_subcategories (category_id, name) VALUES
-- Groceries subcategories
(1, 'Rice & Grains'),
(1, 'Pulses & Lentils'),
(1, 'Oil & Ghee'),
(1, 'Spices'),
(1, 'Dry Fruits'),
(1, 'Sugar & Jaggery'),

-- Dairy subcategories
(2, 'Milk'),
(2, 'Cheese'),
(2, 'Yogurt'),
(2, 'Butter'),
(2, 'Paneer'),
(2, 'Ice Cream'),

-- Vegetables subcategories
(3, 'Fresh Vegetables'),
(3, 'Leafy Greens'),
(3, 'Root Vegetables'),
(3, 'Exotic Vegetables'),
(3, 'Frozen Vegetables'),

-- Fruits subcategories
(4, 'Fresh Fruits'),
(4, 'Seasonal Fruits'),
(4, 'Imported Fruits'),
(4, 'Dry Fruits'),
(4, 'Frozen Fruits'),

-- Beverages subcategories
(5, 'Soft Drinks'),
(5, 'Juices'),
(5, 'Tea & Coffee'),
(5, 'Energy Drinks'),
(5, 'Water'),
(5, 'Milk Drinks'),

-- Snacks subcategories
(6, 'Chips'),
(6, 'Biscuits'),
(6, 'Namkeen'),
(6, 'Chocolates'),
(6, 'Sweets'),
(6, 'Nuts'),

-- Personal Care subcategories
(7, 'Soap & Body Wash'),
(7, 'Shampoo & Hair Care'),
(7, 'Toothpaste & Oral Care'),
(7, 'Skincare'),
(7, 'Deodorants'),

-- Household subcategories
(8, 'Cleaning Supplies'),
(8, 'Detergents'),
(8, 'Kitchen Utilities'),
(8, 'Storage Solutions'),
(8, 'Electrical Items');

-- Insert some default SKU prefixes
INSERT IGNORE INTO sku_counters (prefix, current_number) VALUES
('GRC', 0),  -- Groceries
('DRY', 0),  -- Dairy
('VEG', 0),  -- Vegetables
('FRT', 0),  -- Fruits
('BEV', 0),  -- Beverages
('SNK', 0),  -- Snacks
('PCR', 0),  -- Personal Care
('HSH', 0);  -- Household

-- Create indexes for better performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Create a view for products with category names
CREATE OR REPLACE VIEW products_with_categories AS
SELECT
    p.*,
    pc.name as category_name,
    psc.name as subcategory_name,
    GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order) as image_urls,
    GROUP_CONCAT(DISTINCT pt.name) as tags
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN product_subcategories psc ON p.subcategory_id = psc.id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_tag_mappings ptm ON p.id = ptm.product_id
LEFT JOIN product_tags pt ON ptm.tag_id = pt.id
GROUP BY p.id;