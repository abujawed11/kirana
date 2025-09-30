import { CreateProductRequest, Product, UpdateProductRequest } from '@/types/product';
import { api, publicApi, BASE_URL } from './client';
import * as SecureStore from 'expo-secure-store';

export class ProductsApi {
  private static async getAuthToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return null;

      // Check if token is expired
      const expiryStr = await SecureStore.getItemAsync('auth_token_expiry');
      if (expiryStr) {
        const expiry = new Date(expiryStr);
        if (new Date() >= expiry) {
          // Token expired, clear it
          await SecureStore.deleteItemAsync('auth_token').catch(() => {});
          await SecureStore.deleteItemAsync('auth_token_expiry').catch(() => {});
          return null;
        }
      }

      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    console.log('Creating product with data:', productData);

    // Convert camelCase to snake_case for backend compatibility
    const backendData = {
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      category: productData.category,
      subcategory: productData.subcategory || null,
      brand: productData.brand || null,
      price: productData.price,
      cost_price: productData.costPrice,
      mrp: productData.mrp,
      stock: productData.stock,
      min_stock: productData.minStock,
      unit: productData.unit,
      weight: productData.weight || null,
      dimensions: productData.dimensions || null,
      images: productData.images || [],
      tags: productData.tags || [],
    };

    console.log('Backend formatted data:', backendData);

    try {
      const response = await api.post<any>('/products', backendData);
      console.log('Raw create product response:', response);

      // Backend returns { success: true, data: { product data } }
      if (response.data) {
        return response.data;
      }

      // Fallback if response structure is different
      return response;
    } catch (error) {
      console.error('Product creation API error:', error);
      console.error('Error details:', {
        status: (error as any)?.status,
        message: (error as any)?.message,
        data: (error as any)?.data
      });
      throw error;
    }
  }

  static async getProducts(sellerId?: string): Promise<Product[]> {
    const params = sellerId ? `?sellerId=${sellerId}` : '';
    const response = await api.get<any>(`/products${params}`);

    console.log('Raw getProducts response:', response);

    // Backend returns { success: true, data: Product[], count: number }
    // We need to extract the data field
    let products = [];
    if (response.data && Array.isArray(response.data)) {
      products = response.data;
    } else if (Array.isArray(response)) {
      products = response;
    } else {
      console.error('Unexpected response format:', response);
      return [];
    }

    // Transform backend snake_case format to frontend camelCase format
    return products.map((product: any) => ({
      id: String(product.id),
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      category: product.category_name || product.category || '', // backend might return category_name from JOIN
      subcategory: product.subcategory_name || product.subcategory,
      brand: product.brand,
      price: Number(product.price),
      costPrice: Number(product.cost_price || 0),
      mrp: Number(product.mrp || 0),
      stock: Number(product.stock || 0),
      minStock: Number(product.min_stock || 0),
      unit: product.unit || 'piece',
      weight: product.weight ? Number(product.weight) : undefined,
      dimensions: product.length && product.width && product.height ? {
        length: Number(product.length),
        width: Number(product.width),
        height: Number(product.height)
      } : undefined,
      images: product.images ? product.images.map((img: any) => {
        const imageUrl = img.image_url || img;

        // Handle relative paths (new format)
        if (imageUrl.startsWith('/')) {
          return `${BASE_URL}${imageUrl}`;
        }

        // Handle legacy full URLs with wrong port/domain
        if (imageUrl.includes('://')) {
          // Extract just the path from full URL and reconstruct with current BASE_URL
          const urlObj = new URL(imageUrl);
          return `${BASE_URL}${urlObj.pathname}`;
        }

        return imageUrl;
      }) : [],
      tags: product.tags ? product.tags.map((tag: any) => tag.name || tag) : [],
      isActive: Boolean(product.is_active),
      sellerId: product.seller_id,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
  }

  static async getProduct(id: string): Promise<Product> {
    const response = await api.get<any>(`/products/${id}`);

    console.log('Raw getProduct response:', response);

    // Backend returns { success: true, data: Product }
    const product = response.data || response;

    // Transform backend snake_case format to frontend camelCase format
    return {
      id: String(product.id),
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      category: product.category_name || product.category || '',
      subcategory: product.subcategory_name || product.subcategory,
      brand: product.brand,
      price: Number(product.price),
      costPrice: Number(product.cost_price || 0),
      mrp: Number(product.mrp || 0),
      stock: Number(product.stock || 0),
      minStock: Number(product.min_stock || 0),
      unit: product.unit || 'piece',
      weight: product.weight ? Number(product.weight) : undefined,
      dimensions: product.length && product.width && product.height ? {
        length: Number(product.length),
        width: Number(product.width),
        height: Number(product.height)
      } : undefined,
      images: product.images ? product.images.map((img: any) => {
        const imageUrl = img.image_url || img;

        // Handle relative paths (new format)
        if (imageUrl.startsWith('/')) {
          return `${BASE_URL}${imageUrl}`;
        }

        // Handle legacy full URLs with wrong port/domain
        if (imageUrl.includes('://')) {
          // Extract just the path from full URL and reconstruct with current BASE_URL
          const urlObj = new URL(imageUrl);
          return `${BASE_URL}${urlObj.pathname}`;
        }

        return imageUrl;
      }) : [],
      tags: product.tags ? product.tags.map((tag: any) => tag.name || tag) : [],
      isActive: Boolean(product.is_active),
      sellerId: product.seller_id,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }

  static async updateProduct(productData: UpdateProductRequest): Promise<Product> {
    console.log('Updating product with data:', productData);

    // Convert camelCase to snake_case for backend compatibility
    const backendData: any = {
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      category: productData.category,
      subcategory: productData.subcategory || null,
      brand: productData.brand || null,
      price: productData.price,
      cost_price: productData.costPrice,
      mrp: productData.mrp,
      stock: productData.stock,
      min_stock: productData.minStock,
      unit: productData.unit,
      weight: productData.weight || null,
      is_active: productData.isActive,
    };

    // Flatten dimensions - database stores as separate columns
    if (productData.dimensions) {
      backendData.length = productData.dimensions.length || null;
      backendData.width = productData.dimensions.width || null;
      backendData.height = productData.dimensions.height || null;
    }

    // Remove undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    console.log('Backend formatted update data:', backendData);

    try {
      const response = await api.put<any>(`/products/${productData.id}`, backendData);
      console.log('Raw update product response:', response);

      // Backend returns { success: true, data: { product data } }
      if (response.data) {
        return response.data;
      }

      // Fallback if response structure is different
      return response;
    } catch (error) {
      console.error('Product update API error:', error);
      console.error('Error details:', {
        status: (error as any)?.status,
        message: (error as any)?.message,
        data: (error as any)?.data
      });
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    return api.delete<void>(`/products/${id}`);
  }

  static async uploadProductImages(files: FormData): Promise<{
    [x: string]: any; urls: string[] 
}> {
    // For FormData uploads, we need to use custom fetch since the api client expects JSON
    const url = `${BASE_URL}/products/upload-images`;

    console.log('Upload URL:', url);

    const token = await this.getAuthToken();

    if (!token) {
      throw new Error('Authentication required for image upload');
    }

    console.log('Auth token available:', !!token);

    try {
      console.log('Making fetch request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let fetch set it with boundary
        },
        body: files,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const resultText = await response.text();
      console.log('Success response text:', resultText);

      const result = JSON.parse(resultText);
      return result.data || result;

    } catch (error) {
      console.error('Fetch error details:', {
        error,
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
        stack: typeof error === 'object' && error !== null && 'stack' in error ? (error as any).stack : undefined
      });
      throw error;
    }
  }

  static async generateSKU(name: string, category: string): Promise<{ sku: string }> {
    const response = await api.post<any>('/products/generate-sku', { name, category });
    console.log('Raw API response for SKU generation:', response);

    // Backend returns { success: true, data: { sku: "..." } }
    // We need to extract the data field
    if (response.data) {
      return response.data;
    }

    // Fallback if response structure is different
    return response;
  }
}

