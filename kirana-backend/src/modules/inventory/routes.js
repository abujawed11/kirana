import express from 'express';
import multer from 'multer';
import * as controller from './controller.js';
import * as validators from './validators.js';
import { validateRequest } from '../../middleware/validation.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes (no authentication required)
router.get('/categories', controller.getCategories);

// Protected routes (authentication required)
router.use(authenticateToken);

// Product CRUD routes
router.post(
  '/',
  validators.createProductValidator,
  validateRequest,
  controller.createProduct
);

router.get(
  '/',
  validators.getProductsValidator,
  validateRequest,
  controller.getProducts
);

router.get(
  '/:id',
  validators.productIdValidator,
  validateRequest,
  controller.getProduct
);

router.put(
  '/:id',
  validators.updateProductValidator,
  validateRequest,
  controller.updateProduct
);

router.delete(
  '/:id',
  validators.productIdValidator,
  validateRequest,
  controller.deleteProduct
);

// Image upload routes
router.post(
  '/upload-images',
  upload.array('images', 10),
  controller.uploadImages
);

router.post(
  '/:id/images',
  validators.addImageValidator,
  validateRequest,
  controller.addProductImage
);

router.delete(
  '/:id/images/:imageId',
  validators.removeImageValidator,
  validateRequest,
  controller.removeProductImage
);

// Tag management routes
router.post(
  '/:id/tags',
  validators.addTagValidator,
  validateRequest,
  controller.addProductTag
);

router.delete(
  '/:id/tags/:tagId',
  validators.removeTagValidator,
  validateRequest,
  controller.removeProductTag
);

// Utility routes
router.post(
  '/generate-sku',
  validators.generateSkuValidator,
  validateRequest,
  controller.generateSku
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }

  next(error);
});

export default router;