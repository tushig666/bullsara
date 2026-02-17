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

export type LotteryStatus = 'active' | 'finished';

export interface Lottery {
  id: string;
  title: string;
  carModel: string;
  year: number;
  description: string;
  images: string[];
  pricePerTicket: number;
  totalTickets: number;
  remainingTickets: number;
  status: LotteryStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type OrderStatus = 'pending' | 'paid';

export interface Order {
  id: string;
  userId: string;
  lotteryId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

    