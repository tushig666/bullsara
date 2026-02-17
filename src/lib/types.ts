import type { Timestamp as ClientTimestamp } from 'firebase/firestore';

// This allows us to use the type in both client and server components
export type Timestamp = ClientTimestamp;

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}

export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  title: string;
  carModel: string;
  year: number;
  description: string;
  images: string[];
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type OrderStatus = 'pending' | 'paid';

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
