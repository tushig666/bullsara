'use server';

import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { UI } from '@/lib/i18n';
import { z } from 'zod';
import { Lottery, LotteryStatus, Order, Ticket, UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

// Lottery Actions
export async function getLotteries(status?: LotteryStatus): Promise<Lottery[]> {
  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('lotteries');
    if (status) {
      query = query.where('status', '==', status);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
        } as Lottery
    });
  } catch (error) {
    console.error("Error getting lotteries:", error);
    return [];
  }
}

export async function getLottery(id: string): Promise<Lottery | null> {
  try {
    const docRef = adminDb.collection('lotteries').doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
       return { 
            id: docSnap.id, 
            ...data,
        } as Lottery
    }
    return null;
  } catch (error) {
    console.error("Error getting lottery:", error);
    return null;
  }
}

// Order Actions
export async function createOrder(lotteryId: string, quantity: number) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Нэвтэрч орно уу.' };
  }

  const lottery = await getLottery(lotteryId);
  if (!lottery) {
    return { success: false, error: 'Сугалаа олдсонгүй.' };
  }

  if (lottery.remainingTickets < quantity) {
    return { success: false, error: 'Үлдэгдэл хүрэлцэхгүй байна.' };
  }

  try {
    const totalPrice = lottery.pricePerTicket * quantity;
    const orderRef = await adminDb.collection('orders').add({
      userId: user.id,
      lotteryId,
      quantity,
      totalPrice,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return { success: true, orderId: orderRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Admin Actions
async function verifyAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return user;
}

const lotterySchema = z.object({
  title: z.string().min(1),
  carModel: z.string().min(1),
  year: z.coerce.number().min(1900),
  description: z.string().min(1),
  images: z.string(),
  pricePerTicket: z.coerce.number().min(0),
  totalTickets: z.coerce.number().min(1),
});

export async function createLottery(values: z.infer<typeof lotterySchema>) {
  await verifyAdmin();
  try {
    await adminDb.collection('lotteries').add({
      ...values,
      images: values.images.split(',').map(s => s.trim()),
      remainingTickets: values.totalTickets,
      status: 'active',
      winnerTicket: null,
      winnerUser: null,
      createdAt: Timestamp.now(),
    });
    revalidatePath('/admin/lotteries');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLottery(id: string, values: z.infer<typeof lotterySchema>) {
  await verifyAdmin();
  try {
    const lotteryRef = adminDb.collection('lotteries').doc(id);
    await lotteryRef.update({
        ...values,
        images: values.images.split(',').map(s => s.trim()),
    });
    revalidatePath(`/admin/lotteries`);
    revalidatePath(`/lotteries/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLottery(id: string) {
  await verifyAdmin();
  try {
    await adminDb.collection('lotteries').doc(id).delete();
    revalidatePath('/admin/lotteries');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrders(): Promise<Order[]> {
  await verifyAdmin();
  try {
    const snapshot = await adminDb.collection('orders').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

export async function confirmPayment(orderId: string) {
    await verifyAdmin();
    try {
        await adminDb.runTransaction(async (transaction) => {
            const orderRef = adminDb.collection("orders").doc(orderId);
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists || orderDoc.data()?.status === 'paid') {
                throw "Захиалга олдсонгүй эсвэл аль хэдийн төлөгдсөн байна.";
            }
            
            const orderData = orderDoc.data()!;
            const lotteryRef = adminDb.collection("lotteries").doc(orderData.lotteryId);
            const lotteryDoc = await transaction.get(lotteryRef);

            if (!lotteryDoc.exists) {
                throw "Сугалаа олдсонгүй.";
            }

            const lotteryData = lotteryDoc.data()!;
            if (lotteryData.remainingTickets < orderData.quantity) {
                throw "Үлдэгдэл хүрэлцэхгүй байна.";
            }

            const newRemainingTickets = lotteryData.remainingTickets - orderData.quantity;
            transaction.update(lotteryRef, { remainingTickets: newRemainingTickets });
            transaction.update(orderRef, { status: 'paid' });

            // Ticket generation
            const ticketsCollectionRef = adminDb.collection("users").doc(orderData.userId).collection("tickets");
            const lotteryTicketsCollectionRef = adminDb.collection("lotteries").doc(orderData.lotteryId).collection("tickets");

            const startTicketNumber = lotteryData.totalTickets - lotteryData.remainingTickets + 1;
            for (let i = 0; i < orderData.quantity; i++) {
                const ticketNumber = startTicketNumber + i;
                const newTicket = {
                    userId: orderData.userId,
                    lotteryId: orderData.lotteryId,
                    ticketNumber: ticketNumber,
                    orderId: orderId,
                    createdAt: Timestamp.now(),
                };
                
                const ticketDocRef = ticketsCollectionRef.doc();
                transaction.set(ticketDocRef, newTicket);
                transaction.set(lotteryTicketsCollectionRef.doc(ticketDocRef.id), newTicket);
            }
        });
        
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function drawWinner(lotteryId: string) {
    await verifyAdmin();

    try {
        const lottery = await getLottery(lotteryId);
        if (!lottery || lottery.status === 'finished') {
            throw "Сугалаа олдсонгүй эсвэл дууссан байна.";
        }

        const ticketsQuery = adminDb.collection("lotteries").doc(lotteryId).collection("tickets");
        const ticketsSnapshot = await ticketsQuery.get();
        const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));

        if (tickets.length === 0) {
            throw "Энэ сугалаанд зарагдсан тасалбар байхгүй байна.";
        }
        
        const winningTicketIndex = Math.floor(Math.random() * tickets.length);
        const winningTicket = tickets[winningTicketIndex];

        const winnerUserDoc = await adminDb.collection('users').doc(winningTicket.userId).get();
        const winner = winnerUserDoc.exists ? (winnerUserDoc.data() as UserProfile) : null;
        
        const lotteryRef = adminDb.collection("lotteries").doc(lotteryId);
        await lotteryRef.update({
            status: 'finished',
            winnerTicketId: winningTicket.id,
            winnerUserId: winningTicket.userId,
        });

        revalidatePath(`/admin/lotteries`);
        revalidatePath(`/lotteries/${lotteryId}`);
        revalidatePath('/');
        return { success: true, winnerTicket: winningTicket.ticketNumber };

    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function getMyTickets() {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    try {
        const ticketsQuery = adminDb.collection("users").doc(user.id).collection("tickets").orderBy("createdAt", "desc");
        const ticketsSnapshot = await ticketsQuery.get();
        const tickets = ticketsSnapshot.docs.map(doc => doc.data() as Omit<Ticket, "id">);
        
        const groupedByLottery: Record<string, {lottery?: Lottery | null, ticketNumbers: number[]}> = {};

        for (const ticket of tickets) {
            if (!groupedByLottery[ticket.lotteryId]) {
                const lottery = await getLottery(ticket.lotteryId);
                groupedByLottery[ticket.lotteryId] = {
                    lottery: lottery || undefined,
                    ticketNumbers: []
                };
            }
            groupedByLottery[ticket.lotteryId].ticketNumbers.push(ticket.ticketNumber);
        }
        
        return Object.values(groupedByLottery);

    } catch (error) {
        console.error("Error getting my tickets:", error);
        return [];
    }
}

export async function getStats() {
    await verifyAdmin();
    const [lotteriesSnap, ordersSnap, usersSnap] = await Promise.all([
        adminDb.collection("lotteries").count().get(),
        adminDb.collection("orders").count().get(),
        adminDb.collection("users").count().get(),
    ]);
    return {
        lotteries: lotteriesSnap.data().count,
        orders: ordersSnap.data().count,
        users: usersSnap.data().count,
    };
}
