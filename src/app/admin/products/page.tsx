'use client';

import { Button } from "@/components/ui/button";
import { UI } from "@/lib/i18n";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminProductActions } from "./actions";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Product } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

function ProductsTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{UI.ADMIN.TITLE}</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>{UI.ADMIN.STOCK}</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function AdminProductsPage() {
    const firestore = useFirestore();
    const productsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'products'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: products, isLoading } = useCollection<Product>(productsQuery);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{UI.ADMIN.PRODUCTS}</h1>
                <Button asChild>
                    <Link href="/admin/products/new">{UI.ADMIN.CREATE_PRODUCT}</Link>
                </Button>
            </div>
            
            <div className="bg-card rounded-lg border">
                {isLoading ? <ProductsTableSkeleton /> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{UI.ADMIN.TITLE}</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>{UI.ADMIN.STOCK}</TableHead>
                                <TableHead className="text-right">Үйлдэл</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === 'active' ? 'secondary' : 'destructive'}>
                                            {product.status === 'active' ? 'Идэвхтэй' : 'Архивлагдсан'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell className="text-right">
                                        <AdminProductActions product={product} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
