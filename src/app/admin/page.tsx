import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UI } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, ListOrdered, Users } from "lucide-react";

async function getStats() {
    const [lotteriesSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "lotteries")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
    ]);
    return {
        lotteries: lotteriesSnap.size,
        orders: ordersSnap.size,
        users: usersSnap.size,
    };
}


export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.DASHBOARD}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{UI.ADMIN.LOTTERIES}</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.lotteries}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{UI.ADMIN.ORDERS}</CardTitle>
                <ListOrdered className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.orders}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{UI.ADMIN.USERS}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
