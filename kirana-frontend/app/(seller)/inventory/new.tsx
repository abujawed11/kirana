import React, { useState } from 'react';
import { View, Alert, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProductForm from '@/features/seller/inventory/components/ProductForm';
import { CreateProductRequest } from '@/types/product';
import { ProductsApi } from '@/api/products.api';
import { useAuth } from '@/context/AuthContext';

export default function NewProductScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProduct = async (productData: CreateProductRequest) => {
    console.log('User data:', user);
    console.log('Product data received:', productData);

    if (!user?.user_id && !user?.id) {
      console.error('User not authenticated - user data:', user);
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating product with data:', productData);
      const product = await ProductsApi.createProduct(productData);
      console.log('Product created successfully:', product);

      Alert.alert(
        'Success',
        'Product created successfully!',
        [
          {
            text: 'View Product',
            onPress: () => router.push(`/(seller)/inventory/edit/${product.id}` as any),
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form by navigating away and back
              router.replace('/(seller)/inventory/new');
            },
          },
          {
            text: 'Go to Inventory',
            onPress: () => router.push('/(seller)/inventory'),
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create product. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add New Product',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginLeft: 16,
                padding: 4,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Discard Changes?',
                  'Are you sure you want to go back? All unsaved changes will be lost.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                  ]
                );
              }}
              style={{
                marginRight: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#FEE2E2',
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name="close" size={16} color="#DC2626" />
              <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={{ flex: 1 }}>
        <ProductForm
          onSubmit={handleCreateProduct}
          isLoading={isLoading}
        />
      </View>
    </>
  );
}
