import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
  Vibration,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ProductsApi } from "@/api/products.api";
import { CreateProductRequest } from "@/types/product";

const { width, height } = Dimensions.get("window");

// Types
interface ProductImage {
  id: string;
  uri: string;
  type: 'image' | 'video';
  size?: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  costPrice: string;
  originalPrice: string;
  category: string;
  subcategory: string;
  brand: string;
  sku: string;
  stockQuantity: string;
  minStock: string;
  unit: string;
  weight: string;
  weightUnit: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  tags: string[];
  images: ProductImage[];
}

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  subcategories: string[];
}

// Categories data with proper typing for Kirana store
const productCategories: Category[] = [
  {
    id: 'groceries',
    name: 'Groceries & Staples',
    icon: 'basket-outline',
    subcategories: ['Rice & Grains', 'Dal & Pulses', 'Flour & Atta', 'Sugar & Jaggery', 'Cooking Oil', 'Spices & Masalas']
  },
  {
    id: 'vegetables',
    name: 'Fresh Vegetables',
    icon: 'leaf-outline',
    subcategories: ['Leafy Vegetables', 'Root Vegetables', 'Gourds', 'Beans & Pods', 'Onions & Garlic', 'Tomatoes & Capsicum']
  },
  {
    id: 'fruits',
    name: 'Fresh Fruits',
    icon: 'nutrition-outline',
    subcategories: ['Seasonal Fruits', 'Citrus Fruits', 'Dry Fruits & Nuts', 'Exotic Fruits', 'Bananas', 'Apples & Grapes']
  },
  {
    id: 'dairy',
    name: 'Dairy & Eggs',
    icon: 'cafe-outline',
    subcategories: ['Milk', 'Curd & Yogurt', 'Paneer', 'Butter & Ghee', 'Cheese', 'Eggs']
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: 'wine-outline',
    subcategories: ['Tea & Coffee', 'Cold Drinks', 'Juices', 'Energy Drinks', 'Water', 'Health Drinks']
  },
  {
    id: 'snacks',
    name: 'Snacks & Packaged',
    icon: 'fast-food-outline',
    subcategories: ['Biscuits & Cookies', 'Namkeen & Chips', 'Sweets', 'Chocolates', 'Instant Noodles', 'Ready to Eat']
  },
  {
    id: 'household',
    name: 'Household Items',
    icon: 'home-outline',
    subcategories: ['Cleaning Supplies', 'Detergents', 'Personal Care', 'Baby Care', 'Kitchen Utensils', 'Plastic Items']
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: 'medical-outline',
    subcategories: ['Medicines', 'Health Supplements', 'Ayurvedic Products', 'First Aid', 'Baby Health', 'Vitamins']
  }
];

const units = [
  { label: 'Piece', value: 'piece' },
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Milliliter (ml)', value: 'ml' },
  { label: 'Liter (l)', value: 'liter' },
  { label: 'Packet', value: 'packet' },
  { label: 'Box', value: 'box' },
  { label: 'Dozen', value: 'dozen' }
];

const weightUnits = [
  { label: 'Grams', value: 'g' },
  { label: 'Kilograms', value: 'kg' },
  { label: 'Pounds', value: 'lbs' },
  { label: 'Ounces', value: 'oz' }
];

// Custom Components
const NumericInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  required = false,
  error,
  maxLength = 10,
  allowDecimal = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
  error?: string;
  maxLength?: number;
  allowDecimal?: boolean;
}) => {
  const handleTextChange = (text: string) => {
    // Only allow numbers, decimal point (if allowed), and handle edge cases
    let filteredText = text;

    if (allowDecimal) {
      // Allow numbers and one decimal point
      filteredText = text.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = filteredText.split('.');
      if (parts.length > 2) {
        filteredText = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      // Only allow integers
      filteredText = text.replace(/[^0-9]/g, '');
    }

    onChangeText(filteredText);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {icon && <Ionicons name={icon} size={16} color="#64748B" style={{ marginRight: 8 }} />}
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: '#0F172A',
          flex: 1
        }}>
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#94A3B8',
          fontWeight: '500'
        }}>
          {value.length}/{maxLength}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        maxLength={maxLength}
        style={{
          borderWidth: 1.5,
          borderColor: error ? '#EF4444' : value ? '#10B981' : '#E2E8F0',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          fontWeight: '500',
          color: '#0F172A',
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      />
      {error && (
        <Text style={{
          color: '#EF4444',
          fontSize: 14,
          fontWeight: '500',
          marginTop: 6,
          marginLeft: 4
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};

const DropdownInput = ({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  icon,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
  error?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {icon && <Ionicons name={icon} size={16} color="#64748B" style={{ marginRight: 8 }} />}
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: '#0F172A',
          flex: 1
        }}>
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={{
          borderWidth: 1.5,
          borderColor: error ? '#EF4444' : value ? '#10B981' : '#E2E8F0',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: selectedOption ? '#0F172A' : '#94A3B8',
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          maxHeight: 200,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F1F5F9',
                  backgroundColor: value === option.value ? '#ECFDF5' : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: value === option.value ? '600' : '500',
                  color: value === option.value ? '#065F46' : '#0F172A',
                }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && (
        <Text style={{
          color: '#EF4444',
          fontSize: 14,
          fontWeight: '500',
          marginTop: 6,
          marginLeft: 4
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  maxLength,
  icon,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
  error?: string;
}) => (
  <View style={{ marginBottom: 24 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      {icon && <Ionicons name={icon} size={16} color="#64748B" style={{ marginRight: 8 }} />}
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        flex: 1
      }}>
        {label}
        {required && <Text style={{ color: '#EF4444' }}> *</Text>}
      </Text>
      {maxLength && (
        <Text style={{
          fontSize: 12,
          color: '#94A3B8',
          fontWeight: '500'
        }}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      multiline={multiline}
      keyboardType={keyboardType}
      maxLength={maxLength}
      style={{
        borderWidth: 1.5,
        borderColor: error ? '#EF4444' : value ? '#10B981' : '#E2E8F0',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: multiline ? 16 : 14,
        fontSize: 16,
        fontWeight: '500',
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
        textAlignVertical: multiline ? 'top' : 'center',
        minHeight: multiline ? 120 : 52,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    />
    {error && (
      <Text style={{
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 6,
        marginLeft: 4
      }}>
        {error}
      </Text>
    )}
  </View>
);

const CategorySelector = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) => (
  <View style={{ marginBottom: 24 }}>
    <Text style={{
      fontSize: 16,
      fontWeight: '700',
      color: '#0F172A',
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center'
    }}>
      <Ionicons name="grid-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
      Category *
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 20 }}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => onSelectCategory(category.id)}
          style={{
            marginRight: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: selectedCategory === category.id ? '#10B981' : '#E2E8F0',
            backgroundColor: selectedCategory === category.id ? '#ECFDF5' : '#FFFFFF',
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: 120,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={category.icon}
            size={20}
            color={selectedCategory === category.id ? '#10B981' : '#64748B'}
            style={{ marginRight: 8 }}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: selectedCategory === category.id ? '#065F46' : '#64748B',
            textAlign: 'center'
          }}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const ImageUploader = ({
  images,
  onAddImages,
  onRemoveImage,
}: {
  images: ProductImage[];
  onAddImages: (newImages: ProductImage[]) => void;
  onRemoveImage: (imageId: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        setUploading(true);
        const newImages: ProductImage[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          size: asset.fileSize,
        }));
        
        setTimeout(() => {
          onAddImages(newImages);
          setUploading(false);
        }, 1000); // Simulate upload delay
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [1, 1],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setUploading(true);
        const newImage: ProductImage = {
          id: `${Date.now()}`,
          uri: result.assets[0].uri,
          type: 'image',
          size: result.assets[0].fileSize,
        };
        
        setTimeout(() => {
          onAddImages([newImage]);
          setUploading(false);
        }, 1000);
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Product Images',
      'Choose how you want to add images',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: '#0F172A',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Ionicons name="images-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
          Product Images *
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#64748B',
          fontWeight: '500'
        }}>
          {images.length}/10
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {/* Add Image Button */}
        <TouchableOpacity
          onPress={showImageOptions}
          disabled={uploading || images.length >= 10}
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#E2E8F0',
            borderStyle: 'dashed',
            backgroundColor: '#F8FAFC',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            opacity: images.length >= 10 ? 0.5 : 1,
          }}
          activeOpacity={0.8}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <>
              <Ionicons name="add" size={32} color="#94A3B8" />
              <Text style={{
                fontSize: 12,
                color: '#64748B',
                fontWeight: '600',
                marginTop: 8,
                textAlign: 'center'
              }}>
                Add Image
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Image Thumbnails */}
        {images.map((image, index) => (
          <View key={image.id} style={{ marginRight: 12, position: 'relative' }}>
            <Image
              source={{ uri: image.uri }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 16,
                backgroundColor: '#F1F5F9',
              }}
              resizeMode="cover"
            />
            {index === 0 && (
              <View style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#10B981',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: '700'
                }}>
                  MAIN
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => onRemoveImage(image.id)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#EF4444',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {images.length === 0 && (
        <View style={{
          padding: 20,
          backgroundColor: '#FEF3C7',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#FDE68A',
          marginTop: 12,
        }}>
          <Text style={{
            fontSize: 14,
            color: '#92400E',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            📷 Add at least one product image to help customers see what you're selling
          </Text>
        </View>
      )}
    </View>
  );
};

const PriceInput = ({
  price,
  originalPrice,
  onPriceChange,
  onOriginalPriceChange,
}: {
  price: string;
  originalPrice: string;
  onPriceChange: (price: string) => void;
  onOriginalPriceChange: (price: string) => void;
}) => {
  const discount = originalPrice && price ? 
    Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100) : 0;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
      }}>
        <Ionicons name="pricetag-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
        Pricing *
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#64748B',
            marginBottom: 8
          }}>
            Selling Price *
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: price ? '#10B981' : '#E2E8F0',
            borderRadius: 16,
            paddingHorizontal: 16,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#64748B',
              marginRight: 8
            }}>
              ₹
            </Text>
            <TextInput
              value={price}
              onChangeText={(text) => {
                // Only allow numbers and one decimal point
                const filteredText = text.replace(/[^0-9.]/g, '');
                const parts = filteredText.split('.');
                const cleanText = parts.length > 2
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : filteredText;
                onPriceChange(cleanText);
              }}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: '700',
                color: '#0F172A',
                paddingVertical: 14,
              }}
            />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#64748B',
            marginBottom: 8
          }}>
            Original Price
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: originalPrice ? '#94A3B8' : '#E2E8F0',
            borderRadius: 16,
            paddingHorizontal: 16,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#64748B',
              marginRight: 8
            }}>
              ₹
            </Text>
            <TextInput
              value={originalPrice}
              onChangeText={(text) => {
                // Only allow numbers and one decimal point
                const filteredText = text.replace(/[^0-9.]/g, '');
                const parts = filteredText.split('.');
                const cleanText = parts.length > 2
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : filteredText;
                onOriginalPriceChange(cleanText);
              }}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: '600',
                color: '#64748B',
                paddingVertical: 14,
                textDecorationLine: originalPrice ? 'line-through' : 'none',
              }}
            />
          </View>
        </View>
      </View>

      {discount > 0 && (
        <View style={{
          marginTop: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: '#ECFDF5',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#BBF7D0',
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '700',
            color: '#065F46',
            textAlign: 'center'
          }}>
            🎉 {discount}% Discount - Great deal for customers!
          </Text>
        </View>
      )}
    </View>
  );
};

interface ProductFormProps {
  initialData?: Product;
  onSubmit?: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  submitButtonText?: string;
  isEditing?: boolean;
  isLoading?: boolean;
}


export default function ProductForm({
  initialData,
  onSubmit,
  submitButtonText = "Add Product",
  isEditing = false,
  isLoading = false
}: ProductFormProps = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const tagInputRef = useRef<TextInput>(null);

  // Helper function to map category name to category ID
  const getCategoryIdFromName = (categoryName: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Groceries & Staples': 'groceries',
      'Fresh Vegetables': 'vegetables',
      'Fresh Fruits': 'fruits',
      'Dairy & Eggs': 'dairy',
      'Beverages': 'beverages',
      'Snacks & Packaged': 'snacks',
      'Household Items': 'household',
      'Health & Wellness': 'health',
    };

    // Try exact match first
    if (categoryMap[categoryName]) {
      return categoryMap[categoryName];
    }

    // Try case-insensitive partial match
    const lowerCategoryName = categoryName.toLowerCase();
    for (const [name, id] of Object.entries(categoryMap)) {
      if (name.toLowerCase().includes(lowerCategoryName) ||
          lowerCategoryName.includes(name.toLowerCase())) {
        return id;
      }
    }

    // Return empty string if no match found
    return '';
  };

  // Helper function to convert Product to ProductFormData
  const getInitialFormData = (): ProductFormData => {
    if (initialData) {
      // Convert existing product data to form format
      return {
        name: initialData.name || '',
        description: initialData.description || '',
        price: String(initialData.price || ''),
        costPrice: String(initialData.costPrice || ''),
        originalPrice: String(initialData.mrp || ''),
        category: getCategoryIdFromName(initialData.category || ''),
        subcategory: initialData.subcategory || '',
        brand: initialData.brand || '',
        sku: initialData.sku || '',
        stockQuantity: String(initialData.stock || ''),
        minStock: String(initialData.minStock || '5'),
        unit: initialData.unit || 'piece',
        weight: initialData.weight ? String(initialData.weight) : '',
        weightUnit: 'g', // Default weight unit
        dimensions: initialData.dimensions ? {
          length: String(initialData.dimensions.length || ''),
          width: String(initialData.dimensions.width || ''),
          height: String(initialData.dimensions.height || ''),
        } : {
          length: '',
          width: '',
          height: '',
        },
        tags: initialData.tags || [],
        images: initialData.images?.map((url, index) => ({
          id: `existing-${index}`,
          uri: url,
          type: 'image' as const,
        })) || [],
      };
    }

    // Default empty form data
    return {
      name: '',
      description: '',
      price: '',
      costPrice: '',
      originalPrice: '',
      category: '',
      subcategory: '',
      brand: '',
      sku: '',
      stockQuantity: '',
      minStock: '5',
      unit: 'piece',
      weight: '',
      weightUnit: 'g',
      dimensions: {
        length: '',
        width: '',
        height: '',
      },
      tags: [],
      images: [],
    };
  };

  const [formData, setFormData] = useState<ProductFormData>(getInitialFormData());

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const totalSteps = 3;

  // Validation
  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (formData.images.length === 0) newErrors.images = 'At least one image is required';
        break;
      case 2:
        if (!formData.price.trim()) newErrors.price = 'Price is required';
        if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
        if (formData.costPrice.trim() && parseFloat(formData.costPrice) < 0) newErrors.costPrice = 'Cost price cannot be negative';
        if (!formData.stockQuantity.trim()) newErrors.stockQuantity = 'Stock quantity is required';
        if (parseInt(formData.stockQuantity) < 0) newErrors.stockQuantity = 'Stock cannot be negative';
        if (formData.minStock.trim() && parseInt(formData.minStock) < 0) newErrors.minStock = 'Minimum stock cannot be negative';
        break;
      case 3:
        // Optional fields, no validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } else {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100);
      }
      return;
    }

    // If onSubmit prop is provided (edit mode), use it instead
    if (onSubmit && isEditing) {
      setLoading(true);
      try {
        // Get category name from category ID
        const selectedCat = productCategories.find(c => c.id === formData.category);
        const categoryName = selectedCat?.name || formData.category;

        // Build update payload
        const updatePayload: UpdateProductRequest = {
          id: initialData?.id || '',
          name: formData.name.trim(),
          description: formData.description.trim(),
          sku: formData.sku?.trim() || initialData?.sku || '',
          category: categoryName,
          subcategory: formData.subcategory || undefined,
          brand: formData.brand || undefined,
          price: parseFloat(formData.price),
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : parseFloat(formData.price),
          mrp: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
          stock: parseInt(formData.stockQuantity || '0', 10) || 0,
          minStock: parseInt(formData.minStock || '5', 10) || 5,
          unit: formData.unit,
          weight: formData.weight && formData.weight.trim() ? parseFloat(formData.weight.trim()) : undefined,
          dimensions: (formData.dimensions.length?.trim() || formData.dimensions.width?.trim() || formData.dimensions.height?.trim())
            ? {
                length: formData.dimensions.length?.trim() ? parseFloat(formData.dimensions.length.trim()) || 0 : 0,
                width: formData.dimensions.width?.trim() ? parseFloat(formData.dimensions.width.trim()) || 0 : 0,
                height: formData.dimensions.height?.trim() ? parseFloat(formData.dimensions.height.trim()) || 0 : 0,
              }
            : undefined,
          images: formData.images.map(img => img.uri),
          tags: formData.tags || [],
        };

        await onSubmit(updatePayload);
      } catch (error) {
        // Error is handled by parent component
        console.error('Error in form submit:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Create mode
    setLoading(true);
    try {
      // 1) Upload images if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        const files = new FormData();
        formData.images.forEach((img, idx) => {
          // Best-effort mime type; backend validates image/*
          const name = `product_${Date.now()}_${idx}.jpg`;
          const type = 'image/jpeg';
          files.append('images', { uri: img.uri, name, type } as any);
        });

        try {
          const uploadRes = await ProductsApi.uploadProductImages(files);
          imageUrls = (uploadRes as any).urls || uploadRes?.data?.urls || [];
        } catch (uploadErr: any) {
          console.warn('Image upload failed, proceeding without images:', uploadErr?.message || uploadErr);
        }
      }

      // 2) Generate SKU if not provided
      let finalSku = formData.sku?.trim();
      if (!finalSku) {
        try {
          // Get category name from category ID
          const selectedCat = productCategories.find(c => c.id === formData.category);
          const categoryName = selectedCat?.name || formData.category;

          const skuRes = await ProductsApi.generateSKU(formData.name.trim(), categoryName);
          finalSku = skuRes?.sku || '';
        } catch (e) {
          finalSku = '';
        }
      }

      // Get category name from category ID
      const selectedCat = productCategories.find(c => c.id === formData.category);
      const categoryName = selectedCat?.name || formData.category;

      // 3) Build payload
      const payload: CreateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        sku: finalSku || `${formData.name.trim().slice(0,3).toUpperCase()}-${Date.now()}`,
        category: categoryName,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : parseFloat(formData.price), // Use selling price as cost price if not specified
        mrp: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        stock: parseInt(formData.stockQuantity || '0', 10) || 0,
        minStock: parseInt(formData.minStock || '5', 10) || 5,
        unit: formData.unit,
        weight: formData.weight && formData.weight.trim() ? parseFloat(formData.weight.trim()) : undefined,
        dimensions: (formData.dimensions.length?.trim() || formData.dimensions.width?.trim() || formData.dimensions.height?.trim())
          ? {
              length: formData.dimensions.length?.trim() ? parseFloat(formData.dimensions.length.trim()) || 0 : 0,
              width: formData.dimensions.width?.trim() ? parseFloat(formData.dimensions.width.trim()) || 0 : 0,
              height: formData.dimensions.height?.trim() ? parseFloat(formData.dimensions.height.trim()) || 0 : 0,
            }
          : undefined,
        images: imageUrls,
        tags: formData.tags || [],
      };

      // 4) Create product
      await ProductsApi.createProduct(payload);

      Alert.alert('Success! 🎉', 'Your product has been added successfully.', [
        {
          text: 'Add Another',
          onPress: () => {
            setFormData({
              name: '',
              description: '',
              price: '',
              costPrice: '',
              originalPrice: '',
              category: '',
              subcategory: '',
              brand: '',
              sku: '',
              stockQuantity: '',
              minStock: '5',
              unit: 'piece',
              weight: '',
              weightUnit: 'g',
              dimensions: { length: '', width: '', height: '' },
              tags: [],
              images: [],
            });
            setCurrentStep(1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          },
        },
        {
          text: 'View Products',
          onPress: () => router.push('/(seller)/inventory' as any),
          style: 'default',
        },
      ]);
    } catch (error) {
      const message = (error as any)?.message || 'Failed to add product. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
      tagInputRef.current?.clear();
    }
  };

  const selectedCategory = productCategories.find(cat => cat.id === formData.category);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              color: '#0F172A',
              marginBottom: 24,
              textAlign: 'center'
            }}>
              📝 Basic Information
            </Text>

            <FormInput
              label="Product Name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter product name"
              icon="create-outline"
              required
              maxLength={100}
              error={errors.name}
            />

            <FormInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your product in detail..."
              icon="document-text-outline"
              multiline
              required
              maxLength={500}
              error={errors.description}
            />

            <CategorySelector
              categories={productCategories}
              selectedCategory={formData.category}
              onSelectCategory={(category) => setFormData(prev => ({ ...prev, category, subcategory: '' }))}
            />

            {selectedCategory && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: 12
                }}>
                  <Ionicons name="list-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
                  Subcategory
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {selectedCategory.subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      onPress={() => setFormData(prev => ({ ...prev, subcategory: sub }))}
                      style={{
                        marginRight: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: formData.subcategory === sub ? '#10B981' : '#E2E8F0',
                        backgroundColor: formData.subcategory === sub ? '#ECFDF5' : '#FFFFFF',
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: formData.subcategory === sub ? '#065F46' : '#64748B'
                      }}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <ImageUploader
              images={formData.images}
              onAddImages={(newImages) => setFormData(prev => ({ 
                ...prev, 
                images: [...prev.images, ...newImages].slice(0, 10) 
              }))}
              onRemoveImage={(imageId) => setFormData(prev => ({ 
                ...prev, 
                images: prev.images.filter(img => img.id !== imageId) 
              }))}
            />
            {errors.images && (
              <Text style={{ color: '#EF4444', fontSize: 14, marginTop: -16, marginBottom: 16 }}>
                {errors.images}
              </Text>
            )}
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              color: '#0F172A',
              marginBottom: 24,
              textAlign: 'center'
            }}>
              💰 Pricing & Inventory
            </Text>

            <PriceInput
              price={formData.price}
              originalPrice={formData.originalPrice}
              onPriceChange={(price) => setFormData(prev => ({ ...prev, price }))}
              onOriginalPriceChange={(originalPrice) => setFormData(prev => ({ ...prev, originalPrice }))}
            />
            {errors.price && (
              <Text style={{ color: '#EF4444', fontSize: 14, marginTop: -16, marginBottom: 16 }}>
                {errors.price}
              </Text>
            )}

            <NumericInput
              label="Cost Price (Optional)"
              value={formData.costPrice}
              onChangeText={(text) => setFormData(prev => ({ ...prev, costPrice: text }))}
              placeholder="What you paid for this product"
              icon="calculator-outline"
              error={errors.costPrice}
              allowDecimal={true}
              maxLength={10}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <NumericInput
                  label="Stock Quantity"
                  value={formData.stockQuantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stockQuantity: text }))}
                  placeholder="0"
                  icon="cube-outline"
                  required
                  error={errors.stockQuantity}
                  allowDecimal={false}
                  maxLength={6}
                />
              </View>
              <View style={{ flex: 1 }}>
                <NumericInput
                  label="Min Stock Alert"
                  value={formData.minStock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, minStock: text }))}
                  placeholder="5"
                  icon="alert-circle-outline"
                  error={errors.minStock}
                  allowDecimal={false}
                  maxLength={4}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DropdownInput
                  label="Unit"
                  value={formData.unit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  options={units}
                  placeholder="Select unit"
                  icon="apps-outline"
                  required
                />
              </View>
            </View>

            <FormInput
              label="Brand"
              value={formData.brand}
              onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
              placeholder="Enter brand name"
              icon="ribbon-outline"
            />

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="barcode-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#0F172A',
                  }}>
                    SKU / Product Code
                  </Text>
                </View>
                {!formData.sku && formData.name && formData.category && (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const skuRes = await ProductsApi.generateSKU(formData.name.trim(), formData.category);
                        setFormData(prev => ({ ...prev, sku: skuRes?.sku || '' }));
                      } catch (error) {
                        Alert.alert('Error', 'Failed to generate SKU. Please try again.');
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: '#10B981',
                      borderRadius: 8,
                      gap: 4,
                    }}
                  >
                    <Ionicons name="refresh" size={14} color="#FFFFFF" />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#FFFFFF'
                    }}>
                      Generate
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                value={formData.sku}
                onChangeText={(text) => setFormData(prev => ({ ...prev, sku: text }))}
                placeholder="e.g., PROD-001 or click Generate"
                placeholderTextColor="#94A3B8"
                style={{
                  borderWidth: 1.5,
                  borderColor: formData.sku ? '#10B981' : '#E2E8F0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              />
              {formData.sku && (
                <View style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: '#ECFDF5',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                }}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 6 }} />
                  <Text style={{
                    fontSize: 12,
                    color: '#065F46',
                    fontWeight: '500',
                    flex: 1
                  }}>
                    SKU: {formData.sku}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, sku: '' }))}
                    style={{ padding: 2 }}
                  >
                    <Ionicons name="close-circle" size={16} color="#10B981" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              color: '#0F172A',
              marginBottom: 24,
              textAlign: 'center'
            }}>
              📦 Additional Details
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 2 }}>
                <NumericInput
                  label="Weight"
                  value={formData.weight}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                  placeholder="e.g., 500, 1.5"
                  icon="scale-outline"
                  allowDecimal={true}
                  maxLength={8}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DropdownInput
                  label="Weight Unit"
                  value={formData.weightUnit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, weightUnit: value }))}
                  options={weightUnits}
                  placeholder="Unit"
                  icon="fitness-outline"
                />
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#0F172A',
                marginBottom: 12
              }}>
                <Ionicons name="resize-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
                Dimensions (L × W × H)
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={formData.dimensions.length}
                    onChangeText={(text) => {
                      const filteredText = text.replace(/[^0-9.]/g, '');
                      const parts = filteredText.split('.');
                      const cleanText = parts.length > 2
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : filteredText;
                      setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, length: cleanText }
                      }));
                    }}
                    placeholder="Length"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                    style={{
                      borderWidth: 1.5,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  />
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, color: '#64748B', fontWeight: '700' }}>×</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={formData.dimensions.width}
                    onChangeText={(text) => {
                      const filteredText = text.replace(/[^0-9.]/g, '');
                      const parts = filteredText.split('.');
                      const cleanText = parts.length > 2
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : filteredText;
                      setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, width: cleanText }
                      }));
                    }}
                    placeholder="Width"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                    style={{
                      borderWidth: 1.5,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  />
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, color: '#64748B', fontWeight: '700' }}>×</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={formData.dimensions.height}
                    onChangeText={(text) => {
                      const filteredText = text.replace(/[^0-9.]/g, '');
                      const parts = filteredText.split('.');
                      const cleanText = parts.length > 2
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : filteredText;
                      setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, height: cleanText }
                      }));
                    }}
                    placeholder="Height"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                    style={{
                      borderWidth: 1.5,
                      borderColor: '#E2E8F0',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  />
                </View>
              </View>
              <Text style={{
                fontSize: 12,
                color: '#64748B',
                marginTop: 6,
                textAlign: 'center'
              }}>
                Enter dimensions in cm (optional)
              </Text>
            </View>

            {/* Tags Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#0F172A',
                marginBottom: 12
              }}>
                <Ionicons name="pricetags-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
                Tags
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#64748B',
                marginBottom: 12,
                lineHeight: 20
              }}>
                Add relevant keywords to help customers find your product (e.g., "wireless", "waterproof", "organic")
              </Text>
              
              {/* Tags Display */}
              {formData.tags.length > 0 && (
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: 12,
                  gap: 8
                }}>
                  {formData.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#EFF6FF',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#DBEAFE',
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: '#1E40AF',
                        fontWeight: '600',
                        marginRight: 6
                      }}>
                        {tag}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== index)
                        }))}
                      >
                        <Ionicons name="close-circle" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  ref={tagInputRef}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Type a tag..."
                  placeholderTextColor="#94A3B8"
                  style={{
                    flex: 1,
                    borderWidth: 1.5,
                    borderColor: '#E2E8F0',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                  }}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={addTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 10}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    backgroundColor: (!tagInput.trim() || formData.tags.length >= 10) ? '#94A3B8' : '#10B981',
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={{
                fontSize: 12,
                color: '#64748B',
                marginTop: 6
              }}>
                {formData.tags.length}/10 tags
              </Text>
            </View>

            {/* Product Preview */}
            <View style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#0F172A',
                marginBottom: 16,
                textAlign: 'center'
              }}>
                📋 Product Preview
              </Text>
              
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '600', width: 80 }}>Name:</Text>
                  <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600', flex: 1 }}>
                    {formData.name || 'Not specified'}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '600', width: 80 }}>Price:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 16, color: '#10B981', fontWeight: '800' }}>
                      ₹{formData.price || '0'}
                    </Text>
                    {formData.originalPrice && (
                      <Text style={{
                        fontSize: 14,
                        color: '#94A3B8',
                        fontWeight: '600',
                        textDecorationLine: 'line-through',
                        marginLeft: 8
                      }}>
                        ₹{formData.originalPrice}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '600', width: 80 }}>Stock:</Text>
                  <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600', flex: 1 }}>
                    {formData.stockQuantity || '0'} {formData.unit}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '600', width: 80 }}>Category:</Text>
                  <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600', flex: 1 }}>
                    {selectedCategory?.name || 'Not selected'}
                    {formData.subcategory && ` > ${formData.subcategory}`}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '600', width: 80 }}>Images:</Text>
                  <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600', flex: 1 }}>
                    {formData.images.length} uploaded
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => {
              if (currentStep > 1) {
                prevStep();
              } else {
                router.back();
              }
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#F1F5F9',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#64748B" />
          </TouchableOpacity>
          
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#0F172A',
              marginBottom: 4
            }}>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#64748B'
              }}>
                Step {currentStep} of {totalSteps}
              </Text>
            </View>
          </View>
          
          <View style={{ width: 44 }} />
        </View>

        {/* Progress Bar */}
        <View style={{
          height: 6,
          backgroundColor: '#E2E8F0',
          borderRadius: 3,
          marginTop: 16,
          overflow: 'hidden'
        }}>
          <View style={{
            height: '100%',
            width: `${(currentStep / totalSteps) * 100}%`,
            backgroundColor: '#10B981',
            borderRadius: 3,
          }} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={prevStep}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: '#E2E8F0',
                  backgroundColor: '#FFFFFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={20} color="#64748B" />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#64748B'
                }}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={currentStep === totalSteps ? handleSubmit : nextStep}
              disabled={loading}
              style={{
                flex: currentStep === 1 ? 1 : 2,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: loading ? '#94A3B8' : '#10B981',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: '#FFFFFF'
                  }}>
                    {currentStep === totalSteps ? submitButtonText : 'Continue'}
                  </Text>
                  {currentStep < totalSteps && (
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                  )}
                  {currentStep === totalSteps && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
