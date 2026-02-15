import { LotteryCard } from '@/components/lottery-card';
import { getLotteries } from '@/app/actions';
import { UI } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function LotteryGrid() {
  const lotteries = await getLotteries('active');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      {lotteries.map((lottery, index) => (
        <LotteryCard key={lottery.id} lottery={lottery} index={index} />
      ))}
    </div>
  );
}

function LotteryGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground mb-4 font-headline">
          {UI.HOME.TITLE}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {UI.HOME.SUBTITLE}
        </p>
      </div>
      <Suspense fallback={<LotteryGridSkeleton />}>
        <LotteryGrid />
      </Suspense>
    </div>
  );
}
