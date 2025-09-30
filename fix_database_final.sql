-- Final database fix for Kirana inventory system
-- This handles existing indexes and data properly

USE kirana_db;

-- Fix the seller_id column type (main issue)
ALTER TABLE products MODIFY COLUMN seller_id VARCHAR(20) NOT NULL;

-- Try to create index only if it doesn't exist (ignore error if it exists)
-- We'll use a procedure to handle this safely
DELIMITER //
CREATE PROCEDURE CreateIndexIfNotExists()
BEGIN
    DECLARE CONTINUE HANDLER FOR 1061 BEGIN END;
    CREATE INDEX idx_products_seller_id ON products(seller_id);
    CREATE INDEX idx_products_is_active ON products(is_active);
    CREATE INDEX idx_products_category ON products(category_id);
    CREATE INDEX idx_products_subcategory ON products(subcategory_id);
END //
DELIMITER ;

CALL CreateIndexIfNotExists();
DROP PROCEDURE CreateIndexIfNotExists;

-- Verify the table structure
DESCRIBE products;

-- Show current data counts
SELECT
    'products' as table_name,
    COUNT(*) as count
FROM products
UNION ALL
SELECT
    'product_categories' as table_name,
    COUNT(*) as count
FROM product_categories;