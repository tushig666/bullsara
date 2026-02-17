'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UI } from '@/lib/i18n';
import { Product, UserProfile } from '@/lib/types';
import { Minus, Plus } from 'lucide-react';
import { PaymentModal } from '@/components/payment-modal';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

interface PurchasePanelProps {
  product: Product;
  user: UserProfile | null;
}

export function PurchasePanel({ product, user }: PurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > product.stock) return product.stock;
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

  const totalPrice = quantity * product.price;
  const canPurchase = product.stock > 0;

  return (
    <>
      <Card className="sticky top-24 shadow-lg">
        <CardHeader>
          <CardTitle>{UI.PRODUCT.PARTICIPATE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{UI.PRODUCT.STOCK}</span>
                <span>{product.stock}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-b py-4">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Нэгж үнэ (MNT):</span>
                <span className="font-semibold text-foreground">{product.price.toLocaleString()} ₮</span>
            </div>
             <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">{UI.PRODUCT.QUANTITY}</span>
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
                    disabled={quantity >= product.stock || !canPurchase}
                >
                    <Plus className="h-4 w-4" />
                </Button>
                </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xl font-bold">
            <span>{UI.PRODUCT.TOTAL_PRICE}:</span>
            <span className="text-primary">{totalPrice.toLocaleString()} ₮</span>
          </div>

          <Button 
            className="w-full text-lg py-6 rounded-xl glow-on-hover"
            onClick={handleBuyClick}
            disabled={!canPurchase}
          >
            {canPurchase ? UI.PRODUCT.ORDER : UI.PRODUCT.NO_STOCK}
          </Button>
        </CardContent>
      </Card>
      {canPurchase && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={product.id}
          quantity={quantity}
          totalPrice={totalPrice}
        />
      )}
    </>
  );
}
