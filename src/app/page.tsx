'use client';

import { ProductCard } from '@/components/product-card';
import { UI } from '@/lib/i18n';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row space-x-0 md:space-x-6 border rounded-xl overflow-hidden">
                    <Skeleton className="h-56 w-full md:w-1/3" />
                    <div className="space-y-4 flex-1 p-6 md:p-0 md:py-6">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full mt-4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProductList() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), where('status', '==', 'active'));
  }, [firestore]);

  const { data: products, isLoading, error } = useCollection<Product>(productsQuery);

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (error) {
    console.error("Error fetching products:", error);
    return <p className="text-center text-destructive">Бүтээгдэхүүн ачааллахад алдаа гарлаа.</p>;
  }
  
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground">Одоогоор онцлох бүтээгдэхүүн байхгүй байна.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
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
        <ProductList />
    </div>
  );
}
