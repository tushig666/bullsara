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
        if (!firestore || !id) return null;
        return doc(firestore, 'lotteries', id);
    }, [firestore, id]);

    const { data: lottery, isLoading: isDocLoading, error } = useDoc<Lottery>(lotteryDocRef);
    
    // We are loading if the doc is loading, or if we don't have a valid ref yet
    // because id or firestore is missing. This prevents any premature rendering.
    if (isDocLoading || !lotteryDocRef) {
        return <EditLotteryPageSkeleton />;
    }

    // After loading, we can check for errors.
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
    
    // If loading is finished and there's no error, but the data is null,
    // it means the document was not found. This is a definitive 404.
    if (!lottery) {
        notFound();
    }

    // If all checks pass, render the form with the data.
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
            {/* Pass the validated lottery data to the form */}
            <LotteryForm lottery={lottery} />
        </div>
    );
}
