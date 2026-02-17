'use client';
import { UI } from "@/lib/i18n";
import { LotteryForm } from "../../lottery-form";
import { notFound, useParams } from "next/navigation";
import { Lottery } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

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

export default function EditLotteryPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const lotteryRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'lotteries', id);
    }, [firestore, id]);

    const { data: lottery, isLoading } = useDoc<Lottery>(lotteryRef);

    useEffect(() => {
        // This effect handles the case where the document doesn't exist.
        // It will only call notFound() if:
        // 1. We have tried to create a document reference (lotteryRef is not null).
        // 2. The loading process for that document has finished (!isLoading).
        // 3. The document was not found (lottery is null).
        if (lotteryRef && !isLoading && !lottery) {
            notFound();
        }
    }, [lotteryRef, isLoading, lottery]);


    // Show skeleton while loading, or if we haven't determined if the lottery exists yet.
    // The useEffect above will handle the 404 case.
    if (isLoading || !lottery) {
        return <EditLotteryPageSkeleton />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
            <LotteryForm lottery={lottery} />
        </div>
    );
}
