'use client';

import { LotteryCard } from '@/components/lottery-card';
import { UI } from '@/lib/i18n';
import type { Lottery } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

function LotteryGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ActiveLotteries() {
  const firestore = useFirestore();

  const lotteriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'lotteries'), where('status', '==', 'active'));
  }, [firestore]);

  const { data: lotteries, isLoading, error } = useCollection<Lottery>(lotteriesQuery);

  if (isLoading) {
    return <LotteryGridSkeleton />;
  }

  if (error) {
    console.error("Error fetching lotteries:", error);
    return <p className="text-center text-destructive">Сугалааг ачааллахад алдаа гарлаа.</p>;
  }
  
  if (!lotteries || lotteries.length === 0) {
    return <p className="text-center text-muted-foreground">Одоогоор идэвхтэй сугалаа байхгүй байна.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      {lotteries.map((lottery, index) => (
        <LotteryCard key={lottery.id} lottery={lottery} index={index} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 font-headline">
                {UI.HOME.TITLE}
            </h1>
        </div>
        <ActiveLotteries />
    </div>
  );
}
