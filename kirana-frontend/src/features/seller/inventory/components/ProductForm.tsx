// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import { Picker } from '@react-native-picker/picker';
// import { CreateProductRequest, DEFAULT_CATEGORIES, PRODUCT_UNITS, ProductUnit } from '@/types/product';
// import { ProductsApi } from '@/api/products.api';
// import { debugAuth, testApiConnection, testDatabaseConnection, testImageUploadEndpoint } from '@/utils/debug';

// interface ProductFormProps {
//   onSubmit: (product: CreateProductRequest) => Promise<void>;
//   initialData?: Partial<CreateProductRequest>;
//   isLoading?: boolean;
// }

// export default function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
//   const [formData, setFormData] = useState<CreateProductRequest>({
//     name: '',
//     description: '',
//     sku: '',
//     category: '',
//     subcategory: '',
//     brand: '',
//     price: 0,
//     costPrice: 0,
//     mrp: 0,
//     stock: 0,
//     minStock: 5,
//     unit: 'piece',
//     weight: 0,
//     dimensions: {
//       length: 0,
//       width: 0,
//       height: 0,
//     },
//     images: [],
//     tags: [],
//     ...initialData,
//   });

//   // Store selected images locally (not uploaded yet)
//   const [selectedImages, setSelectedImages] = useState<Array<{
//     uri: string;
//     name: string;
//     type: string;
//     fileName?: string;
//   }>>([]);

//   const [tagInput, setTagInput] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES[0]);
//   const [imageUploading, setImageUploading] = useState(false);
//   const [skuGenerating, setSkuGenerating] = useState(false);

//   useEffect(() => {
//     if (formData.category) {
//       const category = DEFAULT_CATEGORIES.find(cat => cat.name === formData.category);
//       if (category) {
//         setSelectedCategory(category);
//       }
//     }
//   }, [formData.category]);

//   const handleInputChange = (field: keyof CreateProductRequest, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       dimensions: {
//         ...prev.dimensions!,
//         [dimension]: parseFloat(value) || 0,
//       },
//     }));
//   };

//   const generateSKU = async () => {
//     if (!formData.name || !formData.category) {
//       Alert.alert('Error', 'Please enter product name and select category first');
//       return;
//     }

//     setSkuGenerating(true);
//     try {
//       console.log('Generating SKU for:', { name: formData.name, category: formData.category });

//       // Debug auth first
//       await debugAuth();

//       const response = await ProductsApi.generateSKU(formData.name, formData.category);
//       console.log('SKU generation response:', response);
//       handleInputChange('sku', response.sku);
//     } catch (error) {
//       console.error('SKU generation error:', error);
//       Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate SKU');
//     } finally {
//       setSkuGenerating(false);
//     }
//   };

//   const runDebugTests = async () => {
//     console.log('=== RUNNING DEBUG TESTS ===');

//     // Test auth
//     const authInfo = await debugAuth();
//     console.log('Auth info:', authInfo);

//     // Test API connection
//     const apiTest = await testApiConnection();
//     console.log('API test:', apiTest);

//     // Test database
//     const dbTest = await testDatabaseConnection();
//     console.log('Database test:', dbTest);

//     // Test image upload endpoint
//     const imageUploadTest = await testImageUploadEndpoint();
//     console.log('Image upload test:', imageUploadTest);

//     const message = `
// API: ${apiTest.success ? '✅' : '❌'}
// Database: ${dbTest.success ? '✅' : '❌'}
// Auth: ${authInfo?.hasToken ? '✅' : '❌'}
// Image Upload: ${imageUploadTest.success ? '✅' : '❌'}

// ${!dbTest.success || !dbTest.data?.tables?.products_exists ?
//   'NOTE: You may need to run the database schema!' :
//   'Database tables are ready!'}

// ${!imageUploadTest.success ?
//   'NOTE: Image upload endpoint is not accessible!' :
//   `Image endpoint status: ${imageUploadTest.post?.status}`}
//     `;

//     Alert.alert('Debug Results', message);
//   };

//   const pickImage = async () => {
//     try {
//       const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

//       if (permissionResult.granted === false) {
//         Alert.alert('Permission required', 'Permission to access camera roll is required!');
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//         base64: false, // Don't include base64 for better performance
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const asset = result.assets[0];
//         console.log('Selected image:', asset);

//         // Store image locally instead of uploading immediately
//         const imageData = {
//           uri: asset.uri,
//           type: asset.mimeType || 'image/jpeg',
//           name: asset.fileName || 'product-image.jpg',
//           fileName: asset.fileName || 'product-image.jpg',
//         };

//         setSelectedImages(prev => [...prev, imageData]);
//         console.log('Image stored locally:', imageData);
//       }
//     } catch (error) {
//       console.error('Image picker error:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };

//   const removeSelectedImage = (index: number) => {
//     const newImages = selectedImages.filter((_, i) => i !== index);
//     setSelectedImages(newImages);
//   };

//   const removeUploadedImage = (index: number) => {
//     const newImages = formData.images.filter((_, i) => i !== index);
//     handleInputChange('images', newImages);
//   };

//   const addTag = () => {
//     if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
//       handleInputChange('tags', [...formData.tags, tagInput.trim()]);
//       setTagInput('');
//     }
//   };

//   const removeTag = (tag: string) => {
//     handleInputChange('tags', formData.tags.filter(t => t !== tag));
//   };

//   const handleSubmit = async () => {
//     console.log('Form data before submit:', formData);

//     if (!formData.name || !formData.category || !formData.sku || formData.price <= 0) {
//       Alert.alert('Error', 'Please fill in all required fields (Name, Category, SKU, Price)');
//       return;
//     }

//     try {
//       setImageUploading(true);

//       // Upload selected images first if any
//       let uploadedImageUrls: string[] = [];

//       if (selectedImages.length > 0) {
//         console.log('Uploading', selectedImages.length, 'selected images...');

//         for (const imageData of selectedImages) {
//           const imageFormData = new FormData();
//           imageFormData.append('images', {
//             uri: imageData.uri,
//             type: imageData.type,
//             name: imageData.name,
//           } as any);

//           console.log('Uploading image:', imageData.name);
//           const uploadResponse = await ProductsApi.uploadProductImages(imageFormData);
//           uploadedImageUrls.push(...uploadResponse.urls);
//         }

//         console.log('All images uploaded successfully:', uploadedImageUrls);
//       }

//       // Combine uploaded images with existing form images
//       const allImages = [...formData.images, ...uploadedImageUrls];

//       // Create product with all images
//       const productDataWithImages = {
//         ...formData,
//         images: allImages,
//       };

//       console.log('Submitting product data with uploaded images:', productDataWithImages);
//       await onSubmit(productDataWithImages);

//       // Clear selected images after successful submission
//       setSelectedImages([]);

//     } catch (error) {
//       console.error('Error during product creation:', error);
//       Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create product');
//     } finally {
//       setImageUploading(false);
//     }
//   };

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
//       <View style={{ padding: 20, gap: 20 }}>
//         {/* Basic Information */}
//         <View style={{
//           backgroundColor: '#fff',
//           borderRadius: 16,
//           padding: 16,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//           elevation: 3,
//         }}>
//           <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
//             Basic Information
//           </Text>

//           <View style={{ gap: 16 }}>
//             <View>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 Product Name *
//               </Text>
//               <TextInput
//                 style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 16,
//                   backgroundColor: '#fff',
//                 }}
//                 value={formData.name}
//                 onChangeText={(value) => handleInputChange('name', value)}
//                 placeholder="Enter product name"
//               />
//             </View>

//             <View>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 Description
//               </Text>
//               <TextInput
//                 style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 16,
//                   backgroundColor: '#fff',
//                   minHeight: 80,
//                 }}
//                 value={formData.description}
//                 onChangeText={(value) => handleInputChange('description', value)}
//                 placeholder="Enter product description"
//                 multiline
//                 numberOfLines={3}
//               />
//             </View>

//             <View>
//               <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
//                 <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
//                   SKU *
//                 </Text>
//                 <View style={{ flexDirection: 'row', gap: 8 }}>
//                   <TouchableOpacity
//                     onPress={generateSKU}
//                     disabled={skuGenerating}
//                     style={{
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                       paddingHorizontal: 12,
//                       paddingVertical: 6,
//                       backgroundColor: '#2563EB',
//                       borderRadius: 6,
//                       gap: 4,
//                     }}
//                   >
//                     {skuGenerating ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <Ionicons name="refresh" size={16} color="#fff" />
//                     )}
//                     <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
//                       Generate
//                     </Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={runDebugTests}
//                     style={{
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                       paddingHorizontal: 12,
//                       paddingVertical: 6,
//                       backgroundColor: '#DC2626',
//                       borderRadius: 6,
//                       gap: 4,
//                     }}
//                   >
//                     <Ionicons name="bug" size={16} color="#fff" />
//                     <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
//                       Debug
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <TextInput
//                 style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 16,
//                   backgroundColor: '#fff',
//                 }}
//                 value={formData.sku}
//                 onChangeText={(value) => handleInputChange('sku', value)}
//                 placeholder="Enter SKU or generate"
//               />
//             </View>

//             <View>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 Brand
//               </Text>
//               <TextInput
//                 style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 16,
//                   backgroundColor: '#fff',
//                 }}
//                 value={formData.brand}
//                 onChangeText={(value) => handleInputChange('brand', value)}
//                 placeholder="Enter brand name"
//               />
//             </View>
//           </View>
//         </View>

//         {/* Category & Classification */}
//         <View style={{
//           backgroundColor: '#fff',
//           borderRadius: 16,
//           padding: 16,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//           elevation: 3,
//         }}>
//           <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
//             Category & Classification
//           </Text>

//           <View style={{ gap: 16 }}>
//             <View>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 Category *
//               </Text>
//               <View style={{
//                 borderWidth: 1,
//                 borderColor: '#D1D5DB',
//                 borderRadius: 8,
//                 backgroundColor: '#fff',
//               }}>
//                 <Picker
//                   selectedValue={formData.category}
//                   onValueChange={(value) => handleInputChange('category', value)}
//                   style={{ height: 50 }}
//                 >
//                   <Picker.Item label="Select category" value="" />
//                   {DEFAULT_CATEGORIES.map((category) => (
//                     <Picker.Item key={category.id} label={category.name} value={category.name} />
//                   ))}
//                 </Picker>
//               </View>
//             </View>

//             {selectedCategory.subcategories.length > 0 && (
//               <View>
//                 <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                   Subcategory
//                 </Text>
//                 <View style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   backgroundColor: '#fff',
//                 }}>
//                   <Picker
//                     selectedValue={formData.subcategory}
//                     onValueChange={(value) => handleInputChange('subcategory', value)}
//                     style={{ height: 50 }}
//                   >
//                     <Picker.Item label="Select subcategory" value="" />
//                     {selectedCategory.subcategories.map((subcategory) => (
//                       <Picker.Item key={subcategory} label={subcategory} value={subcategory} />
//                     ))}
//                   </Picker>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>

//         {/* Pricing */}
//         <View style={{
//           backgroundColor: '#fff',
//           borderRadius: 16,
//           padding: 16,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//           elevation: 3,
//         }}>
//           <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
//             Pricing
//           </Text>

//           <View style={{ gap: 16 }}>
//             <View style={{ flexDirection: 'row', gap: 12 }}>
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                   Cost Price
//                 </Text>
//                 <TextInput
//                   style={{
//                     borderWidth: 1,
//                     borderColor: '#D1D5DB',
//                     borderRadius: 8,
//                     padding: 12,
//                     fontSize: 16,
//                     backgroundColor: '#fff',
//                   }}
//                   value={formData.costPrice.toString()}
//                   onChangeText={(value) => handleInputChange('costPrice', parseFloat(value) || 0)}
//                   placeholder="0"
//                   keyboardType="numeric"
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                   Selling Price *
//                 </Text>
//                 <TextInput
//                   style={{
//                     borderWidth: 1,
//                     borderColor: '#D1D5DB',
//                     borderRadius: 8,
//                     padding: 12,
//                     fontSize: 16,
//                     backgroundColor: '#fff',
//                   }}
//                   value={formData.price.toString()}
//                   onChangeText={(value) => handleInputChange('price', parseFloat(value) || 0)}
//                   placeholder="0"
//                   keyboardType="numeric"
//                 />
//               </View>
//             </View>

//             <View>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 MRP
//               </Text>
//               <TextInput
//                 style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 16,
//                   backgroundColor: '#fff',
//                 }}
//                 value={formData.mrp.toString()}
//                 onChangeText={(value) => handleInputChange('mrp', parseFloat(value) || 0)}
//                 placeholder="0"
//                 keyboardType="numeric"
//               />
//             </View>
//           </View>
//         </View>

//         {/* Inventory */}
//         <View style={{
//           backgroundColor: '#fff',
//           borderRadius: 16,
//           padding: 16,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//           elevation: 3,
//         }}>
//           <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
//             Inventory
//           </Text>

//           <View style={{ gap: 16 }}>
//             <View style={{ flexDirection: 'row', gap: 12 }}>
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                   Stock Quantity
//                 </Text>
//                 <TextInput
//                   style={{
//                     borderWidth: 1,
//                     borderColor: '#D1D5DB',
//                     borderRadius: 8,
//                     padding: 12,
//                     fontSize: 16,
//                     backgroundColor: '#fff',
//                   }}
//                   value={formData.stock.toString()}
//                   onChangeText={(value) => handleInputChange('stock', parseInt(value) || 0)}
//                   placeholder="0"
//                   keyboardType="numeric"
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                   Unit
//                 </Text>
//                 <View style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   backgroundColor: '#fff',
//                 }}>
//                   <Picker
//                     selectedValue={formData.unit}
//                     onValueChange={(value) => handleInputChange('unit', value)}
//                     style={{ height: 50 }}
//                   >
//                     {PRODUCT_UNITS.map((unit) => (
//                       <Picker.Item key={unit} label={unit} value={unit} />
//                     ))}
//                   </Picker>
//                 </View>
//               </View>
//             </View>

//             <View>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 Minimum Stock Alert
//               </Text>
//               <TextInput
//                 style={{
//                   borderWidth: 1,
//                   borderColor: '#D1D5DB',
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 16,
//                   backgroundColor: '#fff',
//                 }}
//                 value={formData.minStock.toString()}
//                 onChangeText={(value) => handleInputChange('minStock', parseInt(value) || 0)}
//                 placeholder="5"
//                 keyboardType="numeric"
//               />
//             </View>
//           </View>
//         </View>

//         {/* Images */}
//         <View style={{
//           backgroundColor: '#fff',
//           borderRadius: 16,
//           padding: 16,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//           elevation: 3,
//         }}>
//           <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
//             Product Images
//           </Text>

//           <TouchableOpacity
//             onPress={pickImage}
//             disabled={imageUploading || isLoading}
//             style={{
//               borderWidth: 2,
//               borderColor: '#D1D5DB',
//               borderStyle: 'dashed',
//               borderRadius: 8,
//               padding: 20,
//               alignItems: 'center',
//               gap: 8,
//               marginBottom: 16,
//             }}
//           >
//             <Ionicons name="image-outline" size={32} color="#6B7280" />
//             <Text style={{ color: '#6B7280', fontSize: 14 }}>Tap to select images</Text>
//             <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Images will be uploaded when you create the product</Text>
//           </TouchableOpacity>

//           {/* Selected Images (not uploaded yet) */}
//           {selectedImages.length > 0 && (
//             <View style={{ marginBottom: 16 }}>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 Selected Images ({selectedImages.length})
//               </Text>
//               <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//                 {selectedImages.map((imageData, index) => (
//                   <View key={index} style={{ position: 'relative' }}>
//                     <Image
//                       source={{ uri: imageData.uri }}
//                       style={{ width: 80, height: 80, borderRadius: 8 }}
//                     />
//                     <TouchableOpacity
//                       onPress={() => removeSelectedImage(index)}
//                       style={{
//                         position: 'absolute',
//                         top: -8,
//                         right: -8,
//                         backgroundColor: '#EF4444',
//                         borderRadius: 12,
//                         width: 24,
//                         height: 24,
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                       }}
//                     >
//                       <Ionicons name="close" size={16} color="#fff" />
//                     </TouchableOpacity>
//                     {/* Indicator that it's not uploaded yet */}
//                     <View style={{
//                       position: 'absolute',
//                       bottom: 2,
//                       right: 2,
//                       backgroundColor: '#F59E0B',
//                       borderRadius: 8,
//                       paddingHorizontal: 4,
//                       paddingVertical: 2,
//                     }}>
//                       <Text style={{ color: '#fff', fontSize: 8, fontWeight: '600' }}>PENDING</Text>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Already Uploaded Images */}
//           {formData.images.length > 0 && (
//             <View>
//               <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
//                 Uploaded Images ({formData.images.length})
//               </Text>
//               <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//                 {formData.images.map((image, index) => (
//                   <View key={index} style={{ position: 'relative' }}>
//                     <Image
//                       source={{ uri: image }}
//                       style={{ width: 80, height: 80, borderRadius: 8 }}
//                     />
//                     <TouchableOpacity
//                       onPress={() => removeUploadedImage(index)}
//                       style={{
//                         position: 'absolute',
//                         top: -8,
//                         right: -8,
//                         backgroundColor: '#EF4444',
//                         borderRadius: 12,
//                         width: 24,
//                         height: 24,
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                       }}
//                     >
//                       <Ionicons name="close" size={16} color="#fff" />
//                     </TouchableOpacity>
//                     {/* Indicator that it's uploaded */}
//                     <View style={{
//                       position: 'absolute',
//                       bottom: 2,
//                       right: 2,
//                       backgroundColor: '#10B981',
//                       borderRadius: 8,
//                       paddingHorizontal: 4,
//                       paddingVertical: 2,
//                     }}>
//                       <Text style={{ color: '#fff', fontSize: 8, fontWeight: '600' }}>UPLOADED</Text>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Tags */}
//         <View style={{
//           backgroundColor: '#fff',
//           borderRadius: 16,
//           padding: 16,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//           elevation: 3,
//         }}>
//           <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
//             Tags
//           </Text>

//           <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
//             <TextInput
//               style={{
//                 flex: 1,
//                 borderWidth: 1,
//                 borderColor: '#D1D5DB',
//                 borderRadius: 8,
//                 padding: 12,
//                 fontSize: 16,
//                 backgroundColor: '#fff',
//               }}
//               value={tagInput}
//               onChangeText={setTagInput}
//               placeholder="Enter tag and press Add"
//               onSubmitEditing={addTag}
//             />
//             <TouchableOpacity
//               onPress={addTag}
//               style={{
//                 paddingHorizontal: 16,
//                 paddingVertical: 12,
//                 backgroundColor: '#2563EB',
//                 borderRadius: 8,
//                 justifyContent: 'center',
//               }}
//             >
//               <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
//             </TouchableOpacity>
//           </View>

//           {formData.tags.length > 0 && (
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//               {formData.tags.map((tag) => (
//                 <TouchableOpacity
//                   key={tag}
//                   onPress={() => removeTag(tag)}
//                   style={{
//                     backgroundColor: '#EEF2FF',
//                     paddingHorizontal: 12,
//                     paddingVertical: 6,
//                     borderRadius: 16,
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     gap: 4,
//                   }}
//                 >
//                   <Text style={{ color: '#2563EB', fontSize: 14 }}>{tag}</Text>
//                   <Ionicons name="close" size={14} color="#2563EB" />
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Submit Button */}
//         <TouchableOpacity
//           onPress={handleSubmit}
//           disabled={isLoading || imageUploading}
//           style={{
//             backgroundColor: (isLoading || imageUploading) ? '#9CA3AF' : '#2563EB',
//             borderRadius: 12,
//             paddingVertical: 16,
//             alignItems: 'center',
//             flexDirection: 'row',
//             justifyContent: 'center',
//             gap: 8,
//             marginBottom: 40,
//           }}
//         >
//           {(isLoading || imageUploading) && <ActivityIndicator size="small" color="#fff" />}
//           <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
//             {imageUploading ? 'Uploading Images...' : (isLoading ? 'Creating Product...' : 'Create Product')}
//           </Text>
//         </TouchableOpacity>

//         {selectedImages.length > 0 && (
//           <View style={{
//             backgroundColor: '#FEF3C7',
//             borderRadius: 8,
//             padding: 12,
//             marginBottom: 20,
//             flexDirection: 'row',
//             alignItems: 'center',
//             gap: 8,
//           }}>
//             <Ionicons name="information-circle" size={20} color="#D97706" />
//             <Text style={{ color: '#D97706', fontSize: 14, flex: 1 }}>
//               {selectedImages.length} image(s) will be uploaded when you create the product
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// }





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
  originalPrice: string;
  category: string;
  subcategory: string;
  brand: string;
  sku: string;
  stockQuantity: string;
  unit: string;
  weight: string;
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

// Categories data with proper typing
const productCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'phone-portrait-outline',
    subcategories: ['Smartphones', 'Laptops', 'Accessories', 'Audio', 'Smart Home']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: 'shirt-outline',
    subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Accessories', 'Bags']
  },
  {
    id: 'home',
    name: 'Home & Garden',
    icon: 'home-outline',
    subcategories: ['Furniture', 'Kitchen', 'Garden', 'Decor', 'Storage']
  },
  {
    id: 'beauty',
    name: 'Beauty & Health',
    icon: 'flower-outline',
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Supplements', 'Personal Care']
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    icon: 'football-outline',
    subcategories: ['Exercise Equipment', 'Outdoor Sports', 'Team Sports', 'Fitness Apparel']
  },
  {
    id: 'books',
    name: 'Books & Media',
    icon: 'book-outline',
    subcategories: ['Books', 'eBooks', 'Audio Books', 'Games', 'Music']
  }
];

const units = ['pcs', 'kg', 'g', 'ml', 'l', 'pack', 'box', 'set'];

// Custom Components
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
              onChangeText={onPriceChange}
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
              onChangeText={onOriginalPriceChange}
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

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const tagInputRef = useRef<TextInput>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    stockQuantity: '',
    unit: 'pcs',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    tags: [],
    images: [],
  });

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
        if (!formData.stockQuantity.trim()) newErrors.stockQuantity = 'Stock quantity is required';
        if (parseInt(formData.stockQuantity) < 0) newErrors.stockQuantity = 'Stock cannot be negative';
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

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success! 🎉',
        'Your product has been added successfully and is now live in your store.',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                category: '',
                subcategory: '',
                brand: '',
                sku: '',
                stockQuantity: '',
                unit: 'pcs',
                weight: '',
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
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add product. Please try again.');
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

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 2 }}>
                <FormInput
                  label="Stock Quantity"
                  value={formData.stockQuantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stockQuantity: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                  icon="cube-outline"
                  required
                  error={errors.stockQuantity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: 8
                }}>
                  Unit
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 24 }}
                >
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => setFormData(prev => ({ ...prev, unit }))}
                      style={{
                        marginRight: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: formData.unit === unit ? '#10B981' : '#E2E8F0',
                        backgroundColor: formData.unit === unit ? '#ECFDF5' : '#FFFFFF',
                        minWidth: 50,
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: formData.unit === unit ? '#065F46' : '#64748B',
                        textAlign: 'center'
                      }}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <FormInput
              label="Brand"
              value={formData.brand}
              onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
              placeholder="Enter brand name"
              icon="ribbon-outline"
            />

            <FormInput
              label="SKU / Product Code"
              value={formData.sku}
              onChangeText={(text) => setFormData(prev => ({ ...prev, sku: text }))}
              placeholder="e.g., PROD-001"
              icon="barcode-outline"
            />
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

            <FormInput
              label="Weight"
              value={formData.weight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
              placeholder="e.g., 500g, 1.5kg"
              icon="scale-outline"
            />

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
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      dimensions: { ...prev.dimensions, length: text } 
                    }))}
                    placeholder="Length"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
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
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      dimensions: { ...prev.dimensions, width: text } 
                    }))}
                    placeholder="Width"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
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
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      dimensions: { ...prev.dimensions, height: text } 
                    }))}
                    placeholder="Height"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
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
              Add New Product
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
                    {currentStep === totalSteps ? 'Add Product' : 'Continue'}
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