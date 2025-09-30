import { query } from "../../db/connection.js";

// Product repository functions

export async function createProduct(productData) {
  const {
    seller_id,
    name,
    description,
    sku,
    category_id,
    subcategory_id,
    brand,
    price,
    cost_price,
    mrp,
    stock,
    min_stock,
    unit,
    weight,
    length,
    width,
    height
  } = productData;

  const result = await query(
    `INSERT INTO products
    (seller_id, name, description, sku, category_id, subcategory_id, brand,
     price, cost_price, mrp, stock, min_stock, unit, weight, length, width, height)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      seller_id, name, description, sku, category_id, subcategory_id, brand,
      price, cost_price, mrp, stock, min_stock, unit, weight, length, width, height
    ]
  );

  return result.insertId;
}

export async function getProductById(productId) {
  const rows = await query(
    `SELECT p.*, pc.name as category_name, psc.name as subcategory_name
     FROM products p
     LEFT JOIN product_categories pc ON p.category_id = pc.id
     LEFT JOIN product_subcategories psc ON p.subcategory_id = psc.id
     WHERE p.id = ? AND p.is_active = 1`,
    [productId]
  );
  return rows[0];
}

export async function getProductsBySeller(sellerId, filters = {}) {
  console.log('getProductsBySeller called with:', { sellerId, filters });

  let whereClause = "WHERE p.seller_id = ? AND p.is_active = 1";
  let params = [sellerId];

  if (filters.category_id) {
    whereClause += " AND p.category_id = ?";
    params.push(filters.category_id);
  }

  if (filters.search) {
    whereClause += " AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)";
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.low_stock) {
    whereClause += " AND p.stock <= p.min_stock";
  }

  const orderBy = filters.sort_by === 'price' ? 'p.price' :
                  filters.sort_by === 'stock' ? 'p.stock' :
                  filters.sort_by === 'name' ? 'p.name' : 'p.created_at';
  const orderDirection = filters.sort_direction === 'asc' ? 'ASC' : 'DESC';

  // Ensure limit and offset are valid numbers
  const limit = parseInt(filters.limit) || 20;
  const offset = parseInt(filters.offset) || 0;

  // Try a simpler query first to isolate the issue
  const finalSQL = `SELECT p.*
     FROM products p
     ${whereClause}
     ORDER BY ${orderBy} ${orderDirection}
     LIMIT ? OFFSET ?`;

  const finalParams = [...params, limit, offset];

  console.log('Final SQL:', finalSQL);
  console.log('Final params:', finalParams);

  // Test if table exists first
  try {
    console.log('Testing if products table exists...');
    const testQuery = 'SHOW TABLES LIKE "products"';
    const tableExists = await query(testQuery);
    console.log('Products table exists:', tableExists.length > 0);

    if (tableExists.length === 0) {
      throw new Error('Products table does not exist');
    }

    // Test table structure
    console.log('Checking table structure...');
    const tableStructure = await query('DESCRIBE products');
    console.log('Products table structure:', tableStructure);

    // Try a very simple query first
    console.log('Testing simple count query...');
    const countResult = await query('SELECT COUNT(*) as count FROM products');
    console.log('Total products in table:', countResult[0].count);

  } catch (error) {
    console.error('Database test error:', error);
    throw error;
  }

  // Try direct query without prepared statements as a workaround
  try {
    console.log('Trying parameterized query...');
    const rows = await query(finalSQL, finalParams);
    return rows;
  } catch (error) {
    console.log('Parameterized query failed, trying escaped query...');

    // Fallback: use escaped values directly in query (safe since we control the inputs)
    const escapedSellerId = `'${sellerId.replace(/'/g, "''")}'`; // Basic SQL injection protection
    const escapedSQL = `SELECT p.*
       FROM products p
       WHERE p.seller_id = ${escapedSellerId} AND p.is_active = 1
       ORDER BY ${orderBy} ${orderDirection}
       LIMIT ${limit} OFFSET ${offset}`;

    console.log('Escaped SQL:', escapedSQL);
    const rows = await query(escapedSQL);
    return rows;
  }

  return rows;
}

export async function updateProduct(productId, updateData) {
  const fields = [];
  const values = [];

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(productId);

  const result = await query(
    `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
}

export async function deleteProduct(productId) {
  const result = await query(
    "UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [productId]
  );
  return result.affectedRows > 0;
}

export async function checkSkuExists(sku, excludeProductId = null) {
  let whereClause = "WHERE sku = ? AND is_active = 1";
  let params = [sku];

  if (excludeProductId) {
    whereClause += " AND id != ?";
    params.push(excludeProductId);
  }

  const rows = await query(`SELECT id FROM products ${whereClause}`, params);
  return rows.length > 0;
}

// Product Images
export async function addProductImage(productId, imageUrl, altText = null, isPrimary = false, displayOrder = 0) {
  const result = await query(
    "INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES (?, ?, ?, ?, ?)",
    [productId, imageUrl, altText, isPrimary, displayOrder]
  );
  return result.insertId;
}

export async function getProductImages(productId) {
  const rows = await query(
    "SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order, created_at",
    [productId]
  );
  return rows;
}

export async function deleteProductImage(imageId) {
  const result = await query(
    "DELETE FROM product_images WHERE id = ?",
    [imageId]
  );
  return result.affectedRows > 0;
}

// Product Tags
export async function addProductTag(productId, tagName) {
  // First, get or create the tag
  let rows = await query("SELECT id FROM product_tags WHERE name = ?", [tagName]);
  let tagId;

  if (rows.length === 0) {
    const result = await query("INSERT INTO product_tags (name) VALUES (?)", [tagName]);
    tagId = result.insertId;
  } else {
    tagId = rows[0].id;
  }

  // Then, link the tag to the product
  try {
    await query(
      "INSERT INTO product_tag_mappings (product_id, tag_id) VALUES (?, ?)",
      [productId, tagId]
    );
    return true;
  } catch (error) {
    // Ignore duplicate key errors
    if (error.code === 'ER_DUP_ENTRY') {
      return true;
    }
    throw error;
  }
}

export async function getProductTags(productId) {
  const rows = await query(
    `SELECT pt.id, pt.name
     FROM product_tags pt
     JOIN product_tag_mappings ptm ON pt.id = ptm.tag_id
     WHERE ptm.product_id = ?`,
    [productId]
  );
  return rows;
}

export async function removeProductTag(productId, tagId) {
  const result = await query(
    "DELETE FROM product_tag_mappings WHERE product_id = ? AND tag_id = ?",
    [productId, tagId]
  );
  return result.affectedRows > 0;
}

// Categories
export async function getCategories() {
  const rows = await query(
    "SELECT * FROM product_categories WHERE is_active = 1 ORDER BY name"
  );
  return rows;
}

export async function getSubcategories(categoryId = null) {
  let whereClause = "WHERE psc.is_active = 1 AND pc.is_active = 1";
  let params = [];

  if (categoryId) {
    whereClause += " AND psc.category_id = ?";
    params.push(categoryId);
  }

  const rows = await query(
    `SELECT psc.*, pc.name as category_name
     FROM product_subcategories psc
     JOIN product_categories pc ON psc.category_id = pc.id
     ${whereClause}
     ORDER BY pc.name, psc.name`,
    params
  );
  return rows;
}

// SKU Generation
export async function generateSku(categoryName) {
  // Map category names to prefixes
  const categoryPrefixes = {
    'Groceries': 'GRC',
    'Dairy': 'DRY',
    'Vegetables': 'VEG',
    'Fruits': 'FRT',
    'Beverages': 'BEV',
    'Snacks': 'SNK',
    'Personal Care': 'PCR',
    'Household': 'HSH'
  };

  const prefix = categoryPrefixes[categoryName] || 'GEN';

  // Get and increment the counter
  const result = await query(
    "INSERT INTO sku_counters (prefix, current_number) VALUES (?, 1) ON DUPLICATE KEY UPDATE current_number = current_number + 1",
    [prefix]
  );

  // Get the current number
  const rows = await query(
    "SELECT current_number FROM sku_counters WHERE prefix = ?",
    [prefix]
  );

  const number = rows[0].current_number;
  return `${prefix}${String(number).padStart(6, '0')}`;
}

// Get product with all related data
export async function getProductWithDetails(productId) {
  const product = await getProductById(productId);
  if (!product) return null;

  const [images, tags] = await Promise.all([
    getProductImages(productId),
    getProductTags(productId)
  ]);

  return {
    ...product,
    images,
    tags
  };
}