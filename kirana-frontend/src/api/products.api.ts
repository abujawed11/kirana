import { CreateProductRequest, Product, UpdateProductRequest } from '@/types/product';
import { api, publicApi } from './client';
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
    return api.get<Product[]>(`/products${params}`);
  }

  static async getProduct(id: string): Promise<Product> {
    return api.get<Product>(`/products/${id}`);
  }

  static async updateProduct(productData: UpdateProductRequest): Promise<Product> {
    return api.put<Product>(`/products/${productData.id}`, productData);
  }

  static async deleteProduct(id: string): Promise<void> {
    return api.delete<void>(`/products/${id}`);
  }

  static async uploadProductImages(files: FormData): Promise<{
    [x: string]: any; urls: string[] 
}> {
    // For FormData uploads, we need to use custom fetch since the api client expects JSON
    const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.20.2.78:5000";
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

