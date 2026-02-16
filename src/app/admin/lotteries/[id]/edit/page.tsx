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
        // useMemoFirebase will return null if firestore or id is not available yet,
        // and useDoc will handle the null ref by waiting.
        if (!firestore || !id) return null;
        return doc(firestore, 'lotteries', id);
    }, [firestore, id]);

    // useDoc returns the loading state. We should rely on it.
    const { data: lottery, isLoading, error } = useDoc<Lottery>(lotteryDocRef);

    // 1. First, handle loading state
    if (isLoading) {
        return <EditLotteryPageSkeleton />;
    }

    // 2. Second, handle errors
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
    
    // 3. After loading and no errors, if data is still null, it's a 404.
    // This check only happens once isLoading is false.
    if (!lottery) {
        notFound();
    }

    // 4. If all checks pass, render the form with the data.
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
            {/* Pass the validated lottery data to the form */}
            <LotteryForm lottery={lottery} />
        </div>
    );
}
