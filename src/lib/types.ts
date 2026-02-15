import type { Timestamp } from 'firebase/firestore';

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
  winnerTicket?: number | null;
  winnerUser?: string | null;
  createdAt: Timestamp;
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
}

export interface Ticket {
  id: string;
  userId: string;
  lotteryId: string;
  ticketNumber: number;
  orderId: string;
  createdAt: Timestamp;
}
