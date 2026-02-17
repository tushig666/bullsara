'use client';
import { UI } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { redirect } from "next/navigation";
import { collection, query, getDoc, doc, orderBy, writeBatch } from "firebase/firestore";
import { Lottery, Order, UserProfile, Timestamp } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type OrderGroup = {
  lottery: Lottery | null;
  orders: Order[];
}

function formatClientTimestamp(timestamp: Timestamp): string {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'yyyy-MM-dd HH:mm');
    }
    return "Invalid Date";
}

function AdminPromotion() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPromoting, setIsPromoting] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  const handlePromote = async () => {
    if (!firestore || !user) return;
    setIsPromoting(true);
    
    const batch = writeBatch(firestore);
    const userRef = doc(firestore, 'users', user.uid);
    batch.set(userRef, { id: user.uid, role: 'admin' }, { merge: true });
    const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
    batch.set(adminRoleRef, { isAdmin: true, promotedAt: new Date() });

    try {
      await batch.commit();
      toast({
        title: "Амжилттай",
        description: "Та одоо админ эрхтэй боллоо. Хуудсыг дахин ачаална уу.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: error.message,
      });
    } finally {
      setIsPromoting(false);
    }
  };
  
  if (isLoading) {
    return <Skeleton className="h-36 w-full mt-12" />;
  }

  if (userProfile?.role === 'admin') {
    return null;
  }

  return (
     <Card className="mt-12 bg-destructive/10 border-destructive">
      <CardHeader>
        <div className="flex items-center gap-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <CardTitle className="text-destructive">Хөгжүүлэлтийн хэрэгсэл</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          Админ самбарт нэвтрэх эрх авахын тулд доорх товчийг дарна уу. Энэ бол зөвхөн хөгжүүлэлтийн үед ашиглах түр боломж бөгөөд бодит орчинд ашиглах боломжгүйг анхаарна уу.
        </p>
        <Button onClick={handlePromote} disabled={isPromoting} variant="destructive">
          {isPromoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Намайг Админ болгох"}
        </Button>
      </CardContent>
    </Card>
  );
}


function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-64 mb-12" />

            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">Миний захиалгууд</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-20 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "orders"), orderBy("createdAt", "desc"));
  }, [firestore, user]);

  const { data: orders } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
        setIsLoading(false);
        return;
    };
    if (!orders || !firestore) {
        if(orders === null && !isUserLoading) setIsLoading(false);
        return;
    };

    const groupOrders = async () => {
        setIsLoading(true);
        const groupedByLottery: Record<string, OrderGroup> = {};
        const lotteryCache: Record<string, Lottery> = {};

        for (const order of orders) {
            if (!groupedByLottery[order.lotteryId]) {
                let lottery = lotteryCache[order.lotteryId];
                if (!lottery) {
                    const lotteryRef = doc(firestore, 'lotteries', order.lotteryId);
                    const lotteryDoc = await getDoc(lotteryRef);
                    if (lotteryDoc.exists()) {
                        lottery = { id: lotteryDoc.id, ...lotteryDoc.data() } as Lottery;
                        lotteryCache[order.lotteryId] = lottery;
                    }
                }

                groupedByLottery[order.lotteryId] = {
                    lottery: lottery || null,
                    orders: []
                };
            }
            groupedByLottery[order.lotteryId].orders.push(order);
        }
        
        const finalGroups = Object.values(groupedByLottery).filter(g => g.lottery);
        setOrderGroups(finalGroups);
        setIsLoading(false);
    };
    
    groupOrders();
  }, [orders, firestore, user, isUserLoading]);
  
  if (isUserLoading) {
     return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    redirect('/login');
  }

  if (isLoading && orderGroups.length === 0) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-primary-foreground mb-2 font-headline">{UI.PROFILE.TITLE}</h1>
      <p className="text-muted-foreground mb-12">{user.email}</p>

      <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">Миний захиалгууд</h2>
      
      {orderGroups.length === 0 && !isLoading ? (
        <p className="text-muted-foreground">Танд одоогоор захиалга байхгүй байна.</p>
      ) : (
        <div className="space-y-8">
          {orderGroups.map((group, index) => (
            group.lottery && (
              <Card key={group.lottery.id + index}>
                <CardHeader>
                  <CardTitle>{group.lottery.title}</CardTitle>
                  <CardDescription>
                    {group.lottery.carModel} - {group.lottery.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.orders.map(order => (
                      <div key={order.id} className="p-4 border rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <p><span className="font-semibold">Тоо ширхэг:</span> {order.quantity}</p>
                          <p><span className="font-semibold">Нийт дүн:</span> {order.totalPrice.toLocaleString()} ₮</p>
                          <p className="text-xs text-muted-foreground">Захиалгын огноо: {formatClientTimestamp(order.createdAt)}</p>
                        </div>
                        <Badge variant={order.status === 'paid' ? 'secondary' : 'outline'}>
                          {order.status === 'paid' ? 'Төлөгдсөн' : 'Хүлээгдэж буй'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
      <AdminPromotion />
    </div>
  );
}

    