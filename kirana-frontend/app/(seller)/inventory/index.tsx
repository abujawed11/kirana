import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProductsApi } from '@/api/products.api';
import { Product } from '@/types/product';

const { width } = Dimensions.get('window');

interface FilterOptions {
  category: string;
  sortBy: 'name' | 'price' | 'stock' | 'created_at';
  sortDirection: 'asc' | 'desc';
  lowStock: boolean;
}

export default function MyProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    sortBy: 'created_at',
    sortDirection: 'desc',
    lowStock: false,
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading products...');
      const data = await ProductsApi.getProducts();
      console.log('Products loaded:', data);

      // Ensure data is an array
      const products = Array.isArray(data) ? data : [];
      setProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
      // Set empty arrays on error to prevent undefined
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Apply search and filters
  useEffect(() => {
    // Ensure products is always an array
    if (!Array.isArray(products)) {
      console.warn('Products is not an array:', products);
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Low stock filter
    if (filters.lowStock) {
      filtered = filtered.filter(product => product.stock <= product.minStock);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (filters.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters]);

  const getUniqueCategories = () => {
    if (!Array.isArray(products)) return [];
    const categories = products.map(p => p.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProductsApi.deleteProduct(productId);
              await loadProducts();
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderProductCard = ({ item: product }: { item: Product }) => {
    const isLowStock = product.stock <= product.minStock;
    const hasDiscount = product.mrp > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={() => router.push(`/(seller)/inventory/edit/${product.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* Product Image */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            backgroundColor: '#F1F5F9',
            marginRight: 12,
            overflow: 'hidden',
          }}>
            {product.images && product.images.length > 0 ? (
              <Image
                source={{ uri: product.images[0] }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="image-outline" size={32} color="#94A3B8" />
              </View>
            )}
          </View>

          {/* Product Details */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: 4,
                }} numberOfLines={2}>
                  {product.name}
                </Text>

                <Text style={{
                  fontSize: 12,
                  color: '#64748B',
                  marginBottom: 2,
                }}>
                  SKU: {product.sku}
                </Text>

                {product.brand && (
                  <Text style={{
                    fontSize: 12,
                    color: '#64748B',
                    marginBottom: 4,
                  }}>
                    Brand: {product.brand}
                  </Text>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: '#EFF6FF',
                    borderRadius: 6,
                    marginRight: 8,
                  }}>
                    <Text style={{
                      fontSize: 10,
                      color: '#1E40AF',
                      fontWeight: '600',
                    }}>
                      {product.category}
                    </Text>
                  </View>

                  {isLowStock && (
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      backgroundColor: '#FEF2F2',
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        fontSize: 10,
                        color: '#DC2626',
                        fontWeight: '600',
                      }}>
                        Low Stock
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Menu */}
              <TouchableOpacity
                onPress={() => handleDeleteProduct(product.id)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#FEF2F2',
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>

            {/* Price and Stock */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: '#10B981',
                  marginRight: 8,
                }}>
                  �{product.price}
                </Text>

                {hasDiscount && (
                  <>
                    <Text style={{
                      fontSize: 14,
                      color: '#94A3B8',
                      textDecorationLine: 'line-through',
                      marginRight: 6,
                    }}>
                      �{product.mrp}
                    </Text>
                    <View style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      backgroundColor: '#ECFDF5',
                      borderRadius: 4,
                    }}>
                      <Text style={{
                        fontSize: 10,
                        color: '#059669',
                        fontWeight: '700',
                      }}>
                        {discountPercent}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isLowStock ? '#DC2626' : '#0F172A',
                }}>
                  Stock: {product.stock}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#64748B',
                }}>
                  Min: {product.minStock}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 100,
    }}>
      <View style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Ionicons name="cube-outline" size={48} color="#94A3B8" />
      </View>

      <Text style={{
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        No Products Yet
      </Text>

      <Text style={{
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
      }}>
        Start adding products to your inventory to see them here
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/(seller)/inventory/new')}
        style={{
          backgroundColor: '#10B981',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#FFFFFF',
        }}>
          Add Your First Product
        </Text>
      </TouchableOpacity>
    </View>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <View style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 40,
          paddingHorizontal: 24,
          paddingBottom: 20,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#0F172A',
            }}>
              Filters & Sort
            </Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#F1F5F9',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ padding: 24 }}>
          {/* Category Filter */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: 12,
            }}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, category: '' }))}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: filters.category === '' ? '#10B981' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: filters.category === '' ? '#10B981' : '#E2E8F0',
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: filters.category === '' ? '#FFFFFF' : '#64748B',
                }}>
                  All
                </Text>
              </TouchableOpacity>

              {getUniqueCategories().map(category => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setFilters(prev => ({ ...prev, category }))}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: filters.category === category ? '#10B981' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: filters.category === category ? '#10B981' : '#E2E8F0',
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: filters.category === category ? '#FFFFFF' : '#64748B',
                  }}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: 12,
            }}>
              Sort By
            </Text>
            {[
              { key: 'created_at', label: 'Recently Added' },
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price' },
              { key: 'stock', label: 'Stock' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setFilters(prev => ({ ...prev, sortBy: option.key as any }))}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 8,
                  borderRadius: 12,
                  backgroundColor: filters.sortBy === option.key ? '#ECFDF5' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: filters.sortBy === option.key ? '#10B981' : '#E2E8F0',
                }}
              >
                <Ionicons
                  name={filters.sortBy === option.key ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={filters.sortBy === option.key ? '#10B981' : '#94A3B8'}
                  style={{ marginRight: 12 }}
                />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: filters.sortBy === option.key ? '#065F46' : '#0F172A',
                }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort Direction */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: 12,
            }}>
              Order
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { key: 'desc', label: 'High to Low', icon: 'arrow-down' },
                { key: 'asc', label: 'Low to High', icon: 'arrow-up' },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setFilters(prev => ({ ...prev, sortDirection: option.key as any }))}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: filters.sortDirection === option.key ? '#10B981' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: filters.sortDirection === option.key ? '#10B981' : '#E2E8F0',
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={filters.sortDirection === option.key ? '#FFFFFF' : '#64748B'}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: filters.sortDirection === option.key ? '#FFFFFF' : '#64748B',
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Low Stock Toggle */}
          <TouchableOpacity
            onPress={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <Ionicons
              name={filters.lowStock ? "checkbox" : "square-outline"}
              size={24}
              color={filters.lowStock ? '#10B981' : '#94A3B8'}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0F172A',
              }}>
                Show Low Stock Only
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
              }}>
                Products at or below minimum stock level
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '900',
            color: '#0F172A',
          }}>
            My Products
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(seller)/inventory/new')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}>
            <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products..."
              placeholderTextColor="#94A3B8"
              style={{
                flex: 1,
                fontSize: 16,
                color: '#0F172A',
              }}
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="options" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {!loading && (
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 16 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#10B981' }}>
                {filteredProducts.length}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
                Products
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#F59E0B' }}>
                {filteredProducts.filter(p => p.stock <= p.minStock).length}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
                Low Stock
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#8B5CF6' }}>
                {getUniqueCategories().length}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
                Categories
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Products List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#64748B' }}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal />
    </View>
  );
}