'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UI } from '@/lib/i18n';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createOrder } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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

  const handlePaymentConfirm = async () => {
    setIsLoading(true);
    const result = await createOrder(lotteryId, quantity);
    
    if (result.success) {
      toast({
        title: UI.GENERAL.SUCCESS,
        description: UI.PAYMENT.PROCESSING,
      });
      onClose();
      router.push('/profile');
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: UI.GENERAL.ERROR,
        description: result.error,
      });
    }
    setIsLoading(false);
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
