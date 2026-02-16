'use client';
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { Lottery } from "@/lib/types";
import { doc } from "firebase/firestore";
import { UI } from "@/lib/i18n";
import { notFound, useParams } from "next/navigation";
import { LotteryForm } from "../../lottery-form";
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

export default function EditLotteryPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const firestore = useFirestore();

    const lotteryDocRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'lotteries', id);
    }, [firestore, id]);

    const { data: lottery, isLoading: isDocLoading } = useDoc<Lottery>(lotteryDocRef);

    const isLoading = isDocLoading || !id;

    if (isLoading) {
        return <EditLotteryPageSkeleton />;
    }

    if (!lottery) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
            <LotteryForm lottery={lottery} />
        </div>
    )
}
