import { body, param, query } from 'express-validator';

export const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('SKU must be between 3 and 100 characters')
    .matches(/^[A-Z0-9\-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),

  body('category')
    .notEmpty()
    .withMessage('Category is required'),

  body('subcategory')
    .optional()
    .isString(),

  body('brand')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Brand name must not exceed 100 characters'),

  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('cost_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),

  body('mrp')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MRP must be a non-negative number'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('min_stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),

  body('unit')
    .optional()
    .isIn(['kg', 'g', 'lbs', 'piece', 'liter', 'ml', 'meter', 'cm', 'packet', 'box', 'dozen'])
    .withMessage('Invalid unit'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),

  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a non-negative number'),

  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a non-negative number'),

  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a non-negative number'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('images.*')
    .optional()
    .custom((value) => {
      // Accept both full URLs and relative paths
      if (typeof value === 'string') {
        // Check if it's a relative path starting with /
        if (value.startsWith('/')) {
          return true;
        }
        // Check if it's a valid URL
        try {
          new URL(value);
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    })
    .withMessage('Each image must be a valid URL or path'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

export const updateProductValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),

  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('sku')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('SKU must be between 3 and 100 characters')
    .matches(/^[A-Z0-9\-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),

  body('category')
    .optional()
    .isString(),

  body('subcategory')
    .optional()
    .isString(),

  body('brand')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Brand name must not exceed 100 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('cost_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),

  body('mrp')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MRP must be a non-negative number'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('min_stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),

  body('unit')
    .optional()
    .isIn(['kg', 'g', 'lbs', 'piece', 'liter', 'ml', 'meter', 'cm', 'packet', 'box', 'dozen'])
    .withMessage('Invalid unit'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

export const productIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID')
];

export const getProductsValidator = [
  query('seller_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid seller ID'),

  query('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid category ID'),

  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  query('low_stock')
    .optional()
    .isBoolean()
    .withMessage('low_stock must be a boolean value'),

  query('sort_by')
    .optional()
    .isIn(['name', 'price', 'stock', 'created_at'])
    .withMessage('Invalid sort field'),

  query('sort_direction')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort direction must be asc or desc'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

export const generateSkuValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
];

export const addImageValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),

  body('image_url')
    .isURL()
    .withMessage('Valid image URL is required'),

  body('alt_text')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Alt text must not exceed 255 characters'),

  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean value')
];

export const removeImageValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),

  param('imageId')
    .isInt({ min: 1 })
    .withMessage('Invalid image ID')
];

export const addTagValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),

  body('tag_name')
    .notEmpty()
    .withMessage('Tag name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Tag name can only contain letters, numbers, spaces, hyphens, and underscores')
];

export const removeTagValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),

  param('tagId')
    .isInt({ min: 1 })
    .withMessage('Invalid tag ID')
];