import * as repository from './repository.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import path from 'path';

export async function createProduct(productData) {
  try {
    // Validate required fields
    const requiredFields = ['seller_id', 'name', 'sku', 'price'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Check if SKU already exists
    const skuExists = await repository.checkSkuExists(productData.sku);
    if (skuExists) {
      throw new Error('SKU already exists');
    }

    // Get category_id if category name is provided
    if (productData.category && !productData.category_id) {
      const categories = await repository.getCategories();
      console.log('Available categories:', categories.map(c => c.name));
      console.log('Looking for category:', productData.category);

      const category = categories.find(cat =>
        cat.name.toLowerCase() === productData.category.toLowerCase()
      );
      if (category) {
        productData.category_id = category.id;
        console.log('Found category_id:', category.id);
      } else {
        console.log('Category not found, setting category_id to null');
        productData.category_id = null;
      }
    }

    // Get subcategory_id if subcategory name is provided
    if (productData.subcategory && !productData.subcategory_id && productData.category_id) {
      const subcategories = await repository.getSubcategories(productData.category_id);
      console.log('Available subcategories:', subcategories.map(s => s.name));
      console.log('Looking for subcategory:', productData.subcategory);

      const subcategory = subcategories.find(sub =>
        sub.name.toLowerCase() === productData.subcategory.toLowerCase()
      );
      if (subcategory) {
        productData.subcategory_id = subcategory.id;
        console.log('Found subcategory_id:', subcategory.id);
      } else {
        console.log('Subcategory not found, setting subcategory_id to null');
        productData.subcategory_id = null;
      }
    } else if (!productData.category_id) {
      productData.subcategory_id = null;
    }

    // Create the product
    console.log('Final product data before repository:', productData);
    const productId = await repository.createProduct(productData);

    // Add images if provided
    if (productData.images && productData.images.length > 0) {
      for (let i = 0; i < productData.images.length; i++) {
        await repository.addProductImage(
          productId,
          productData.images[i],
          null,
          i === 0, // First image is primary
          i
        );
      }
    }

    // Add tags if provided
    if (productData.tags && productData.tags.length > 0) {
      for (const tag of productData.tags) {
        await repository.addProductTag(productId, tag);
      }
    }

    // Return the complete product
    return await repository.getProductWithDetails(productId);

  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function getProduct(productId) {
  try {
    const product = await repository.getProductWithDetails(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
}

export async function getProducts(sellerId, filters = {}) {
  try {
    const products = await repository.getProductsBySeller(sellerId, filters);

    // Get images and tags for each product
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const [images, tags] = await Promise.all([
          repository.getProductImages(product.id),
          repository.getProductTags(product.id)
        ]);
        return {
          ...product,
          images,
          tags
        };
      })
    );

    return productsWithDetails;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

export async function updateProduct(productId, updateData) {
  try {
    const product = await repository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check SKU uniqueness if SKU is being updated
    if (updateData.sku && updateData.sku !== product.sku) {
      const skuExists = await repository.checkSkuExists(updateData.sku, productId);
      if (skuExists) {
        throw new Error('SKU already exists');
      }
    }

    // Handle category updates
    if (updateData.category && !updateData.category_id) {
      const categories = await repository.getCategories();
      const category = categories.find(cat => cat.name === updateData.category);
      if (category) {
        updateData.category_id = category.id;
      }
    }

    // Handle subcategory updates
    if (updateData.subcategory && !updateData.subcategory_id && updateData.category_id) {
      const subcategories = await repository.getSubcategories(updateData.category_id);
      const subcategory = subcategories.find(sub => sub.name === updateData.subcategory);
      if (subcategory) {
        updateData.subcategory_id = subcategory.id;
      }
    }

    // Remove fields that shouldn't be directly updated
    const { images, tags, category, subcategory, ...productUpdate } = updateData;

    // Update the product
    const updated = await repository.updateProduct(productId, productUpdate);
    if (!updated) {
      throw new Error('Failed to update product');
    }

    return await repository.getProductWithDetails(productId);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    const product = await repository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const deleted = await repository.deleteProduct(productId);
    if (!deleted) {
      throw new Error('Failed to delete product');
    }

    return { message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function uploadProductImages(files) {
  try {
    const uploadedImages = [];

    for (const file of files) {
      // Generate unique filename
      const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
      const filePath = `products/${fileName}`;

      // Upload file (implement this based on your storage solution)
      const imageUrl = await uploadFile(file, filePath);
      uploadedImages.push(imageUrl);
    }

    return { urls: uploadedImages };
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}

export async function generateProductSku(productName, categoryName) {
  try {
    const sku = await repository.generateSku(categoryName);
    return { sku };
  } catch (error) {
    console.error('Error generating SKU:', error);
    throw error;
  }
}

export async function getCategories() {
  try {
    const categories = await repository.getCategories();

    // Get subcategories for each category
    const categoriesWithSubs = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await repository.getSubcategories(category.id);
        return {
          ...category,
          subcategories: subcategories.map(sub => ({
            id: sub.id,
            name: sub.name
          }))
        };
      })
    );

    return categoriesWithSubs;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}

export async function addProductImage(productId, imageUrl, altText = null, isPrimary = false) {
  try {
    const product = await repository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const images = await repository.getProductImages(productId);
    const displayOrder = images.length;

    const imageId = await repository.addProductImage(
      productId,
      imageUrl,
      altText,
      isPrimary,
      displayOrder
    );

    return { id: imageId, image_url: imageUrl, alt_text: altText, is_primary: isPrimary, display_order: displayOrder };
  } catch (error) {
    console.error('Error adding product image:', error);
    throw error;
  }
}

export async function removeProductImage(imageId) {
  try {
    const deleted = await repository.deleteProductImage(imageId);
    if (!deleted) {
      throw new Error('Image not found');
    }
    return { message: 'Image removed successfully' };
  } catch (error) {
    console.error('Error removing product image:', error);
    throw error;
  }
}

export async function addProductTag(productId, tagName) {
  try {
    const product = await repository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await repository.addProductTag(productId, tagName.trim());
    return { message: 'Tag added successfully' };
  } catch (error) {
    console.error('Error adding product tag:', error);
    throw error;
  }
}

export async function removeProductTag(productId, tagId) {
  try {
    const removed = await repository.removeProductTag(productId, tagId);
    if (!removed) {
      throw new Error('Tag not found');
    }
    return { message: 'Tag removed successfully' };
  } catch (error) {
    console.error('Error removing product tag:', error);
    throw error;
  }
}