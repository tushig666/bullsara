'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  addDoc,
  runTransaction,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { UI } from '@/lib/i18n';
import { z } from 'zod';
import { Lottery, LotteryStatus, Order, Ticket, UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

const authCredentialsSchema = z.object({ email: emailSchema, password: passwordSchema });

// Auth Actions
export async function signUpUser({ email, password }: z.infer<typeof authCredentialsSchema>) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'user',
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signInUser({ email, password }: z.infer<typeof authCredentialsSchema>) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Нэвтрэх нэр эсвэл нууц үг буруу байна." };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    // The client will handle API call to clear session cookie
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Lottery Actions
export async function getLotteries(status?: LotteryStatus): Promise<Lottery[]> {
  try {
    const lotteriesRef = collection(db, 'lotteries');
    const q = status ? query(lotteriesRef, where('status', '==', status)) : lotteriesRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lottery));
  } catch (error) {
    console.error("Error getting lotteries:", error);
    return [];
  }
}

export async function getLottery(id: string): Promise<Lottery | null> {
  try {
    const docRef = doc(db, 'lotteries', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Lottery;
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
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId: user.id,
      lotteryId,
      quantity,
      totalPrice,
      status: 'pending',
      createdAt: serverTimestamp(),
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
    await addDoc(collection(db, 'lotteries'), {
      ...values,
      images: values.images.split(',').map(s => s.trim()),
      remainingTickets: values.totalTickets,
      status: 'active',
      winnerTicket: null,
      winnerUser: null,
      createdAt: serverTimestamp(),
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
    const lotteryRef = doc(db, 'lotteries', id);
    await updateDoc(lotteryRef, {
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
    await deleteDoc(doc(db, 'lotteries', id));
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
    const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

export async function confirmPayment(orderId: string) {
    await verifyAdmin();
    try {
        await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, "orders", orderId);
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists() || orderDoc.data().status === 'paid') {
                throw "Захиалга олдсонгүй эсвэл аль хэдийн төлөгдсөн байна.";
            }
            
            const orderData = orderDoc.data();
            const lotteryRef = doc(db, "lotteries", orderData.lotteryId);
            const lotteryDoc = await transaction.get(lotteryRef);

            if (!lotteryDoc.exists()) {
                throw "Сугалаа олдсонгүй.";
            }

            const lotteryData = lotteryDoc.data();
            if (lotteryData.remainingTickets < orderData.quantity) {
                throw "Үлдэгдэл хүрэлцэхгүй байна.";
            }

            const newRemainingTickets = lotteryData.remainingTickets - orderData.quantity;
            transaction.update(lotteryRef, { remainingTickets: newRemainingTickets });
            transaction.update(orderRef, { status: 'paid' });

            // Ticket generation
            const ticketsCollectionRef = collection(db, "tickets");
            const startTicketNumber = lotteryData.totalTickets - lotteryData.remainingTickets + 1;
            for (let i = 0; i < orderData.quantity; i++) {
                const ticketNumber = startTicketNumber + i;
                const ticketRef = doc(ticketsCollectionRef);
                transaction.set(ticketRef, {
                    userId: orderData.userId,
                    lotteryId: orderData.lotteryId,
                    ticketNumber: ticketNumber,
                    orderId: orderId,
                    createdAt: serverTimestamp(),
                });
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

        const ticketsQuery = query(collection(db, "tickets"), where("lotteryId", "==", lotteryId));
        const ticketsSnapshot = await getDocs(ticketsQuery);
        const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));

        if (tickets.length === 0) {
            throw "Энэ сугалаанд зарагдсан тасалбар байхгүй байна.";
        }
        
        const winningTicketIndex = Math.floor(Math.random() * tickets.length);
        const winningTicket = tickets[winningTicketIndex];

        const winnerUserRef = doc(db, 'users', winningTicket.userId);
        const winnerUserDoc = await getDoc(winnerUserRef);
        const winner = winnerUserDoc.exists() ? (winnerUserDoc.data() as UserProfile) : null;
        
        const lotteryRef = doc(db, "lotteries", lotteryId);
        await updateDoc(lotteryRef, {
            status: 'finished',
            winnerTicket: winningTicket.ticketNumber,
            winnerUser: winner ? winner.email : winningTicket.userId,
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
        const ticketsQuery = query(collection(db, "tickets"), where("userId", "==", user.id), orderBy("createdAt", "desc"));
        const ticketsSnapshot = await getDocs(ticketsQuery);
        const tickets = ticketsSnapshot.docs.map(doc => doc.data() as Omit<Ticket, "id">);
        
        // Group tickets by lottery
        const groupedByLottery: Record<string, {lottery?: Lottery, ticketNumbers: number[]}> = {};

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
