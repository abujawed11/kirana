import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProductsApi } from '@/api/products.api';
import { Product, UpdateProductRequest } from '@/types/product';
import ProductForm from '@/features/seller/inventory/components/ProductForm';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('Loading product with ID:', id);
      const productData = await ProductsApi.getProduct(String(id));
      console.log('Loaded product:', productData);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (updateData: UpdateProductRequest) => {
    try {
      setUpdating(true);
      console.log('Updating product with data:', updateData);

      await ProductsApi.updateProduct(updateData);

      Alert.alert(
        'Success',
        'Product updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating product:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to update product. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: '#64748B',
          fontWeight: '500'
        }}>
          Loading product details...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={{
          marginTop: 16,
          fontSize: 18,
          color: '#1F2937',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Product Not Found
        </Text>
        <Text style={{
          marginTop: 8,
          fontSize: 14,
          color: '#64748B',
          textAlign: 'center',
          lineHeight: 20
        }}>
          The product you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 24,
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: '#2563EB',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={{
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#E5E7EB',
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F1F5F9',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#475569" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1F2937'
            }}>
              Edit Product
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#64748B',
              marginTop: 2
            }}>
              {product.name}
            </Text>
          </View>
        </View>

        {updating && (
          <ActivityIndicator size="small" color="#2563EB" />
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ProductForm
          initialData={product}
          onSubmit={handleUpdateProduct}
          submitButtonText="Update Product"
          isEditing={true}
          isLoading={updating}
        />
      </ScrollView>
    </View>
  );
}