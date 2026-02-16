'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">{UI.LOTTERY.PARTICIPATE}</h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <span>{UI.LOTTERY.REMAINING_TICKETS}</span>
                <span>{lottery.remainingTickets} / {lottery.totalTickets}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center mb-4">
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
              <span className="text-lg font-bold w-12 text-center">{quantity}</span>
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

          <div className="flex justify-between items-center text-xl font-bold mb-6">
            <span>{UI.LOTTERY.TOTAL_PRICE}:</span>
            <span className="text-primary">{totalPrice.toLocaleString()} ₮</span>
          </div>

          <Button 
            className="w-full text-lg py-6 rounded-xl glow-on-hover"
            onClick={handleBuyClick}
            disabled={!canPurchase}
          >
            {canPurchase ? UI.LOTTERY.BUY_TICKET : UI.LOTTERY.NO_TICKETS_LEFT}
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
