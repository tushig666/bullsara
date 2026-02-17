'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UI } from '@/lib/i18n';
import { Lottery, UserProfile } from '@/lib/types';
import { Minus, Plus } from 'lucide-react';
import { PaymentModal } from '@/components/payment-modal';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

interface TicketPanelProps {
  lottery: Lottery;
  user: UserProfile | null;
}

export function TicketPanel({ lottery, user }: TicketPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > lottery.remainingTickets) return lottery.remainingTickets;
      return newQuantity;
    });
  };

  const handleBuyClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const totalPrice = quantity * lottery.pricePerTicket;
  const canPurchase = lottery.remainingTickets > 0;
  const progressValue = (lottery.totalTickets - lottery.remainingTickets) / lottery.totalTickets * 100;


  return (
    <>
      <Card className="sticky top-24 shadow-lg">
        <CardHeader>
          <CardTitle>{UI.LOTTERY.PARTICIPATE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{UI.LOTTERY.REMAINING_TICKETS}</span>
                <span>{lottery.remainingTickets} / {lottery.totalTickets}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="space-y-2 text-sm border-t border-b py-4">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Нэгж үнэ (MNT):</span>
                <span className="font-semibold text-foreground">{lottery.pricePerTicket.toLocaleString()} ₮</span>
            </div>
             <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">{UI.LOTTERY.QUANTITY}</span>
                <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || !canPurchase}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold w-12 text-center text-foreground">{quantity}</span>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= lottery.remainingTickets || !canPurchase}
                >
                    <Plus className="h-4 w-4" />
                </Button>
                </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xl font-bold">
            <span>{UI.LOTTERY.TOTAL_PRICE}:</span>
            <span className="text-primary">{totalPrice.toLocaleString()} ₮</span>
          </div>

          <Button 
            className="w-full text-lg py-6 rounded-xl glow-on-hover"
            onClick={handleBuyClick}
            disabled={!canPurchase}
          >
            {canPurchase ? 'Захиалах' : UI.LOTTERY.NO_TICKETS_LEFT}
          </Button>
        </CardContent>
      </Card>
      {canPurchase && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          lotteryId={lottery.id}
          quantity={quantity}
          totalPrice={totalPrice}
        />
      )}
    </>
  );
}
