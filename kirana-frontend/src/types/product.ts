export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  costPrice: number;
  mrp: number;
  stock: number;
  minStock: number;
  unit: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  tags: string[];
  isActive: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  sku: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  costPrice: number;
  mrp: number;
  stock: number;
  minStock: number;
  unit: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  tags: string[];
  sellerId?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
  isActive?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  subcategories: string[];
}

export const PRODUCT_UNITS = [
  'kg', 'g', 'lbs', 'piece', 'liter', 'ml', 'meter', 'cm', 'packet', 'box', 'dozen'
] as const;

export type ProductUnit = typeof PRODUCT_UNITS[number];

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  {
    id: '1',
    name: 'Groceries',
    subcategories: ['Rice & Grains', 'Pulses & Lentils', 'Oil & Ghee', 'Spices', 'Dry Fruits']
  },
  {
    id: '2',
    name: 'Dairy',
    subcategories: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Paneer']
  },
  {
    id: '3',
    name: 'Vegetables',
    subcategories: ['Fresh Vegetables', 'Leafy Greens', 'Root Vegetables', 'Exotic Vegetables']
  },
  {
    id: '4',
    name: 'Fruits',
    subcategories: ['Fresh Fruits', 'Seasonal Fruits', 'Imported Fruits', 'Dry Fruits']
  },
  {
    id: '5',
    name: 'Beverages',
    subcategories: ['Soft Drinks', 'Juices', 'Tea & Coffee', 'Energy Drinks', 'Water']
  },
  {
    id: '6',
    name: 'Snacks',
    subcategories: ['Chips', 'Biscuits', 'Namkeen', 'Chocolates', 'Sweets']
  }
];