import { getOrders } from "@/app/actions";
import { UI } from "@/lib/i18n";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "./actions";
import { format } from "date-fns";

export default async function AdminOrdersPage() {
    const orders = await getOrders();
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{UI.ADMIN.ORDERS}</h1>
            </div>
            
            <div className="bg-card rounded-lg border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User Email</TableHead>
                            <TableHead>Нийт дүн</TableHead>
                            <TableHead>Огноо</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Үйлдэл</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                <TableCell>{order.userId}</TableCell>
                                <TableCell>{order.totalPrice.toLocaleString()} ₮</TableCell>
                                <TableCell>{format(order.createdAt.toDate(), 'yyyy-MM-dd HH:mm')}</TableCell>
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
            </div>
        </div>
    );
}
