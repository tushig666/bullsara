'use client';

import { UI } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, ListOrdered, Users } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, icon: Icon, value }: { title: string; icon: React.ElementType; value: number | null }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {value === null ? (
                    <Skeleton className="h-8 w-16" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
  const firestore = useFirestore();
  const [stats, setStats] = useState<{lotteries: number | null, orders: number | null, users: number | null}>({
      lotteries: null,
      orders: null,
      users: null,
  });

  useEffect(() => {
    if (!firestore) return;

    async function fetchStats() {
        try {
            const [lotteriesSnap, ordersSnap, usersSnap] = await Promise.all([
                getCountFromServer(collection(firestore, "lotteries")),
                getCountFromServer(collection(firestore, "orders")),
                getCountFromServer(collection(firestore, "users")),
            ]);
            setStats({
                lotteries: lotteriesSnap.data().count,
                orders: ordersSnap.data().count,
                users: usersSnap.data().count,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            setStats({ lotteries: 0, orders: 0, users: 0 }); // Show 0 on error
        }
    }
    fetchStats();
  }, [firestore]);


  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.DASHBOARD}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title={UI.ADMIN.LOTTERIES} icon={Ticket} value={stats.lotteries} />
        <StatCard title={UI.ADMIN.ORDERS} icon={ListOrdered} value={stats.orders} />
        <StatCard title={UI.ADMIN.USERS} icon={Users} value={stats.users} />
      </div>
    </div>
  );
}
