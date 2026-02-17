'use client';
import { UI } from "@/lib/i18n";
import { LotteryForm } from "../../lottery-form";
import { notFound, useParams } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Lottery } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function EditLotteryPageSkeleton() {
  return (
    <div>
        <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
        <div className="space-y-8 max-w-2xl">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
        </div>
    </div>
  );
}

// This page now fetches data on the server and passes it to the client component.
// To achieve this, we can't use this as a server component directly because it uses client hooks for skeleton
// A better approach is to create a wrapper. But for now, we will use a client component with server-like fetching.
// This is a temporary solution to avoid a full refactor of the skeleton logic.

async function getLottery(id: string): Promise<Lottery | null> {
    const lotterySnap = await adminDb.collection('lotteries').doc(id).get();
    if (!lotterySnap.exists) {
        return null;
    }
    return { id: lotterySnap.id, ...lotterySnap.data() } as Lottery;
}


export default function EditLotteryPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [lottery, setLottery] = useState<Lottery | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLottery = async () => {
            const lotteryData = await getLottery(id);
            if (!lotteryData) {
                notFound();
            } else {
                setLottery(lotteryData);
            }
            setIsLoading(false);
        };

        fetchLottery();
    }, [id]);

    if (isLoading) {
        return <EditLotteryPageSkeleton />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
            {lottery && <LotteryForm lottery={lottery} />}
        </div>
    );
}