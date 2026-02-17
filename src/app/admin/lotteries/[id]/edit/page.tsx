'use client';
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { Lottery } from "@/lib/types";
import { doc } from "firebase/firestore";
import { UI } from "@/lib/i18n";
import { notFound, useParams } from "next/navigation";
import { LotteryForm } from "../../lottery-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        if (!id || !firestore) return null;
        return doc(firestore, 'lotteries', id);
    }, [id, firestore]);

    const { data: lottery, isLoading: isDocLoading, error } = useDoc<Lottery>(lotteryDocRef);
    
    // We are loading if the query reference hasn't been created yet OR if the document is actively being fetched.
    const isLoading = !lotteryDocRef || isDocLoading;

    if (isLoading) {
        return <EditLotteryPageSkeleton />;
    }

    if (error) {
        console.error("Error fetching lottery:", error);
        return (
            <div className="container flex items-center justify-center min-h-[50vh]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-destructive">{UI.GENERAL.ERROR}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">
                            Could not load lottery details for editing.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // If loading is finished and we have no data, then the document doesn't exist.
    if (!lottery) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
            <LotteryForm lottery={lottery} />
        </div>
    );
}
