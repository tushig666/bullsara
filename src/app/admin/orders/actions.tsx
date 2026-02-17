'use client';

import { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export function OrderActions({ order }: { order: Order }) {

  if (order.status === 'paid') {
    return <Badge variant='secondary'>Баталгаажсан</Badge>;
  }

  return (
    <Badge variant='outline'>Хүлээгдэж буй</Badge>
  );
}

    