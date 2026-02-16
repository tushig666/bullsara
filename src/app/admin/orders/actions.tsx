'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lottery, Order, Ticket } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UI } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, runTransaction, serverTimestamp, collection } from 'firebase/firestore';

export function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if(!firestore) return;
    setIsConfirming(true);

    try {
        await runTransaction(firestore, async (transaction) => {
            const orderRef = doc(firestore, "orders", order.id);
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists() || orderDoc.data()?.status === 'paid') {
                throw new Error("Захиалга олдсонгүй эсвэл аль хэдийн төлөгдсөн байна.");
            }
            
            const orderData = orderDoc.data() as Order;
            const lotteryRef = doc(firestore, "lotteries", orderData.lotteryId);
            const lotteryDoc = await transaction.get(lotteryRef);

            if (!lotteryDoc.exists()) {
                throw new Error("Сугалаа олдсонгүй.");
            }

            const lotteryData = lotteryDoc.data() as Lottery;
            if (lotteryData.remainingTickets < orderData.quantity) {
                throw new Error("Үлдэгдэл хүрэлцэхгүй байна.");
            }

            const newRemainingTickets = lotteryData.remainingTickets - orderData.quantity;
            const nextTicketStart = lotteryData.nextTicketNumber || (lotteryData.totalTickets - lotteryData.remainingTickets + 1);

            // Update lottery
            transaction.update(lotteryRef, { 
                remainingTickets: newRemainingTickets,
                nextTicketNumber: nextTicketStart + orderData.quantity
            });

            // Update order
            transaction.update(orderRef, { status: 'paid', updatedAt: serverTimestamp() });

            // Create tickets within the transaction
            for (let i = 0; i < orderData.quantity; i++) {
                const ticketNumber = nextTicketStart + i;
                const newTicketRef = doc(collection(firestore, "tickets"));
                const newTicketData: Omit<Ticket, 'id'> = {
                    userId: orderData.userId,
                    lotteryId: orderData.lotteryId,
                    ticketNumber: ticketNumber,
                    orderId: order.id,
                    createdAt: serverTimestamp(),
                };
                transaction.set(newTicketRef, newTicketData);
            }
        });
        
        toast({ title: UI.GENERAL.SUCCESS, description: UI.ADMIN.ORDER_CONFIRMED });
        router.refresh();

    } catch (error: any) {
        toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: error.message });
    } finally {
        setIsConfirming(false);
    }
  };

  if (order.status === 'paid') {
    return <span className="text-sm text-muted-foreground">Баталгаажсан</span>;
  }

  return (
    <Button variant="outline" size="sm" onClick={handleConfirm} disabled={isConfirming}>
      {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {UI.ADMIN.CONFIRM_ORDER}
    </Button>
  );
}
