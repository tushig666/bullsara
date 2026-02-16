import type { Timestamp as ClientTimestamp } from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

// This allows us to use the type in both client and server components
export type Timestamp = ClientTimestamp | AdminTimestamp;

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
  winnerTicketId?: string | null;
  winnerUserId?: string | null;
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
