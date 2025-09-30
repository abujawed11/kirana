import * as service from './service.js';

export async function createProduct(req, res) {
  try {
    console.log('Creating product with request body:', req.body);

    const productData = {
      seller_id: req.user?.user_id || req.body.seller_id,
      name: req.body.name,
      description: req.body.description,
      sku: req.body.sku,
      category: req.body.category,
      subcategory: req.body.subcategory || null,
      brand: req.body.brand || null,
      price: parseFloat(req.body.price),
      cost_price: parseFloat(req.body.cost_price) || 0,
      mrp: parseFloat(req.body.mrp) || 0,
      stock: parseInt(req.body.stock) || 0,
      min_stock: parseInt(req.body.min_stock) || 5,
      unit: req.body.unit || 'piece',
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      length: req.body.dimensions?.length ? parseFloat(req.body.dimensions.length) : null,
      width: req.body.dimensions?.width ? parseFloat(req.body.dimensions.width) : null,
      height: req.body.dimensions?.height ? parseFloat(req.body.dimensions.height) : null,
      images: req.body.images || [],
      tags: req.body.tags || []
    };

    console.log('Processed product data:', productData);

    const product = await service.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error in createProduct controller:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
}

export async function getProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const product = await service.getProduct(productId);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error in getProduct controller:', error);
    const statusCode = error.message === 'Product not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get product'
    });
  }
}

export async function getProducts(req, res) {
  try {
    const sellerId = req.user?.user_id || req.query.seller_id;

    const filters = {
      category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
      search: req.query.search,
      low_stock: req.query.low_stock === 'true',
      sort_by: req.query.sort_by,
      sort_direction: req.query.sort_direction,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const products = await service.getProducts(sellerId, filters);

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get products'
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const updateData = req.body;

    const product = await service.updateProduct(productId, updateData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error in updateProduct controller:', error);
    const statusCode = error.message === 'Product not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const result = await service.deleteProduct(productId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in deleteProduct controller:', error);
    const statusCode = error.message === 'Product not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete product'
    });
  }
}

export async function uploadImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const result = await service.uploadProductImages(req.files);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in uploadImages controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images'
    });
  }
}

export async function generateSku(req, res) {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Product name and category are required'
      });
    }

    const result = await service.generateProductSku(name, category);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in generateSku controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate SKU'
    });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await service.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in getCategories controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get categories'
    });
  }
}

export async function addProductImage(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const { image_url, alt_text, is_primary } = req.body;

    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const result = await service.addProductImage(productId, image_url, alt_text, is_primary);

    res.json({
      success: true,
      message: 'Image added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in addProductImage controller:', error);
    const statusCode = error.message === 'Product not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add image'
    });
  }
}

export async function removeProductImage(req, res) {
  try {
    const imageId = parseInt(req.params.imageId);
    const result = await service.removeProductImage(imageId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in removeProductImage controller:', error);
    const statusCode = error.message === 'Image not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to remove image'
    });
  }
}

export async function addProductTag(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const { tag_name } = req.body;

    if (!tag_name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    const result = await service.addProductTag(productId, tag_name);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in addProductTag controller:', error);
    const statusCode = error.message === 'Product not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add tag'
    });
  }
}

export async function removeProductTag(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);

    const result = await service.removeProductTag(productId, tagId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in removeProductTag controller:', error);
    const statusCode = error.message === 'Tag not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to remove tag'
    });
  }
}