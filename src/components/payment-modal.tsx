'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UI } from '@/lib/i18n';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { Lottery } from '@/lib/types';


interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotteryId: string;
  quantity: number;
  totalPrice: number;
}

export function PaymentModal({ isOpen, onClose, lotteryId, quantity, totalPrice }: PaymentModalProps) {
  const qrImage = PlaceHolderImages.find(img => img.id === 'qpay-qr');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const handlePaymentConfirm = async () => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: 'Нэвтэрч орно уу.' });
        return;
    }
    setIsLoading(true);

    try {
        // We run a transaction to ensure the lottery has enough tickets before creating an order.
        const orderRef = await runTransaction(firestore, async (transaction) => {
            const lotteryRef = doc(firestore, 'lotteries', lotteryId);
            const lotteryDoc = await transaction.get(lotteryRef);

            if (!lotteryDoc.exists()) {
                throw new Error("Сугалаа олдсонгүй.");
            }

            const lotteryData = lotteryDoc.data() as Lottery;
            if (lotteryData.remainingTickets < quantity) {
                throw new Error("Үлдэгдэл хүрэлцэхгүй байна.");
            }

            // This transaction is only for checking. The actual ticket deduction happens on payment confirmation by admin.
            // A real app might "reserve" tickets here by decrementing a counter.
            
            const newOrderRef = doc(collection(firestore, "orders"));
            transaction.set(newOrderRef, {
                userId: user.uid,
                lotteryId,
                quantity,
                totalPrice,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return newOrderRef;
        });

        toast({
            title: UI.GENERAL.SUCCESS,
            description: UI.PAYMENT.PROCESSING,
        });
        onClose();
        router.push('/profile');
        router.refresh();

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: UI.GENERAL.ERROR,
            description: error.message || "Захиалга үүсгэхэд алдаа гарлаа.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center font-headline text-2xl">{UI.PAYMENT.TITLE}</DialogTitle>
          <DialogDescription className="text-center">{UI.PAYMENT.INSTRUCTION}</DialogDescription>
        </DialogHeader>
        <div className="py-8 flex flex-col items-center gap-4">
          {qrImage && (
            <Image
              src={qrImage.imageUrl}
              alt={qrImage.description}
              width={300}
              height={300}
              data-ai-hint={qrImage.imageHint}
              className="rounded-lg"
            />
          )}
          <p className="text-lg font-bold">{totalPrice.toLocaleString()} ₮</p>
        </div>
        <DialogFooter>
          <Button 
            className="w-full rounded-xl" 
            onClick={handlePaymentConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {UI.PAYMENT.CONFIRM_PAYMENT}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
