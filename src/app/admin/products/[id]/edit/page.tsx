'use client';
import { UI } from "@/lib/i18n";
import { ProductForm } from "../../product-form";
import { notFound, useParams } from "next/navigation";
import { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

function EditProductPageSkeleton() {
  return (
    <div>
        <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_PRODUCT}</h1>
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

export default function EditProductPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const productRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'products', id);
    }, [firestore, id]);

    const { data: product, isLoading } = useDoc<Product>(productRef);

    if (isLoading) {
        return <EditProductPageSkeleton />;
    }

    if (!product) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_PRODUCT}</h1>
            <ProductForm product={product} />
        </div>
    );
}
