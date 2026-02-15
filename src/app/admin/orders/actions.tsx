'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { confirmPayment } from '@/app/actions';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UI } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

export function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    const result = await confirmPayment(order.id);
    if (result.success) {
      toast({ title: UI.GENERAL.SUCCESS, description: UI.ADMIN.ORDER_CONFIRMED });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: result.error });
    }
    setIsConfirming(false);
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
