'use client';

import { LotteryCard } from '@/components/lottery-card';
import { getLotteries } from '@/app/actions';
import { UI } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Lottery } from '@/lib/types';

function SplashScreen() {
    return (
        <div
            className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center text-center p-4"
        >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground mb-4 font-headline">
              {UI.HOME.TITLE}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {UI.HOME.SUBTITLE}
            </p>
        </div>
    );
}

function LotteryGrid({ lotteries }: { lotteries: Lottery[] }) {
  if (!lotteries) return null;
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
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Home() {
    const [showSplash, setShowSplash] = useState(true);
    const [lotteries, setLotteries] = useState<Lottery[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only show splash screen on first visit per session
        if (sessionStorage.getItem('splashShown')) {
            setShowSplash(false);
        } else {
            const timer = setTimeout(() => {
                setShowSplash(false);
                sessionStorage.setItem('splashShown', 'true');
            }, 2000); // Show for 2 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (showSplash) return;

        async function fetchLotteries() {
            setIsLoading(true);
            const activeLotteries = await getLotteries('active');
            setLotteries(activeLotteries);
            setIsLoading(false);
        }
        fetchLotteries();
    }, [showSplash]);

  return (
    <>
      {showSplash && <SplashScreen />}
      
      {!showSplash && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground mb-4 font-headline">
                {UI.HOME.TITLE}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {UI.HOME.SUBTITLE}
                </p>
            </div>
            {isLoading ? <LotteryGridSkeleton /> : <LotteryGrid lotteries={lotteries} />}
        </div>
      )}
    </>
  );
}
