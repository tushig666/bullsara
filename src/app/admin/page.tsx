'use client';

import { UI } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, ListOrdered } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, getCountFromServer, collectionGroup } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "./AdminContext";

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
  const { isAuthorized } = useAdmin();
  const [stats, setStats] = useState<{products: number | null, orders: number | null}>({
      products: null,
      orders: null,
  });

  useEffect(() => {
    if (!firestore || !isAuthorized) return;

    async function fetchStats() {
        try {
            const [productsSnap, ordersSnap] = await Promise.all([
                getCountFromServer(collection(firestore, "products")),
                getCountFromServer(collectionGroup(firestore, "orders")),
            ]);
            setStats({
                products: productsSnap.data().count,
                orders: ordersSnap.data().count,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            setStats({ products: 0, orders: 0 }); // Show 0 on error
        }
    }
    fetchStats();
  }, [firestore, isAuthorized]);


  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.DASHBOARD}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title={UI.ADMIN.PRODUCTS} icon={Ticket} value={stats.products} />
        <StatCard title={UI.ADMIN.ORDERS} icon={ListOrdered} value={stats.orders} />
      </div>
    </div>
  );
}
