// Browser-compatible authentication utilities (server-side operations moved to database layer)

export interface User {
  _id?: string;
  id?: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserRole {
  _id?: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  assigned_at?: Date;
  assigned_by?: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  category?: 'Honey' | 'Dorper Sheep' | 'Fruits' | 'Poultry';
  description?: string;
  price: number;
  unit?: string; // "kg", "liter", "unit", "crate", etc.
  stock: number; // stockQty in your schema
  category_id?: string; // Keeping for backward compatibility
  image_url?: string; // Single image for backward compatibility
  imageURL?: string[]; // Multiple images array
  sku?: string;
  is_active?: boolean; // Same as availability
  availability?: boolean;
  tags?: string[]; // For filtering/search (e.g., "organic", "pure", "premium")
  created_at?: Date;
  updated_at?: Date;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: Date;
}

export interface Order {
  _id?: string;
  id?: string;
  orderId?: string; // Unique order reference
  user_id: string;
  customerName?: string;
  email?: string;
  phone?: string;
  productId?: string; // Ref to Products
  quantity?: number;
  total_amount: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  orderType?: 'Product' | 'Bulk' | 'Visit';
  payment_method?: string;
  payment_reference?: string;
  shipping_address?: string;
  notes?: string;
  tracking_number?: string;
  delivery_date?: Date;
  dateOrdered?: Date;
  deliveryDate?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderItem {
  _id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
}

export interface ContactMessage {
  _id?: string;
  name: string;
  email: string;
  inquiry_type: string;
  type?: 'Product Orders' | 'Farm Visits' | 'Bulk Orders' | 'General'; // Enhanced inquiry type
  message: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface FarmVisit {
  _id?: string;
  visitId?: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: Date;
  status?: 'Pending' | 'Confirmed' | 'Completed';
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface NewsletterSubscriber {
  _id?: string;
  email: string;
  name?: string;
  subscribedAt?: Date;
  created_at?: Date;
}

export interface UserFeedback {
  _id?: string;
  id?: string;
  user_id?: string;
  feedback_text: string;
  rating?: number;
  category?: string;
  status?: string;
  admin_response?: string;
  replies?: {
    id: string;
    reply_text: string;
    created_at: string;
    admin_id?: string;
  }[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ImageMetadata {
  _id?: string;
  storage_path: string;
  original_name?: string;
  title?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  uploaded_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ChatMessage {
  _id?: string;
  session_id: string;
  user_id?: string;
  role: string;
  content: string;
  metadata?: any;
  timestamp?: Date;
}

export interface NewsletterSubscription {
  _id?: string;
  email: string;
  created_at?: Date;
}

export interface TransactionLog {
  _id?: string;
  order_id?: string;
  transaction_id?: string;
  checkout_request_id?: string;
  phone_number?: string;
  amount?: number;
  status?: string;
  result_code?: string;
  result_desc?: string;
  created_at?: Date;
}

export interface UserMessage {
  _id?: string;
  user_id?: string;
  subject?: string;
  message: string;
  admin_reply?: string;
  is_read?: boolean;
  replied_at?: Date;
  replied_by?: string;
  created_at?: Date;
}

// Browser-compatible auth utilities for token handling
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};