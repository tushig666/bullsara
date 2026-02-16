'use client';
import { UI } from "@/lib/i18n";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "./actions";
import { format } from "date-fns";
import { Order, Timestamp } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

function formatClientTimestamp(timestamp: Timestamp): string {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'yyyy-MM-dd HH:mm');
    }
    return "Invalid Date";
}

function OrdersTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Нийт дүн</TableHead>
                    <TableHead>Огноо</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{UI.ADMIN.ORDERS}</h1>
            </div>
            
            <div className="bg-card rounded-lg border">
                {isLoading ? <OrdersTableSkeleton /> : (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>User ID</TableHead>
                                <TableHead>Нийт дүн</TableHead>
                                <TableHead>Огноо</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead className="text-right">Үйлдэл</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                    <TableCell className="font-mono text-xs">{order.userId}</TableCell>
                                    <TableCell>{order.totalPrice.toLocaleString()} ₮</TableCell>
                                    <TableCell>{formatClientTimestamp(order.createdAt)}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'paid' ? 'secondary' : 'outline'}>
                                            {order.status === 'paid' ? 'Төлөгдсөн' : 'Хүлээгдэж буй'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <OrderActions order={order} />
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
