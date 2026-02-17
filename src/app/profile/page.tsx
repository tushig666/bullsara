'use client';
import { UI } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { redirect } from "next/navigation";
import { collection, query, getDoc, doc, orderBy, setDoc, writeBatch } from "firebase/firestore";
import { Lottery, Ticket, UserProfile } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type TicketGroup = {
  lottery: Lottery | null;
  ticketNumbers: number[];
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
    
    // Create a batch write to update both documents atomically.
    const batch = writeBatch(firestore);

    // 1. Update the user's role in the /users/{userId} document
    const userRef = doc(firestore, 'users', user.uid);
    // Note: We include the 'id' field here to satisfy the security rule that prevents the id from being changed.
    batch.set(userRef, { id: user.uid, role: 'admin' }, { merge: true });

    // 2. Create a document in /roles_admin/{userId} to grant security rule permissions
    const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
    batch.set(adminRoleRef, { isAdmin: true, promotedAt: new Date() }); // The content doesn't strictly matter, only existence.

    try {
      await batch.commit();
      toast({
        title: "Амжилттай",
        description: "Та одоо админ эрхтэй боллоо. Хуудсыг дахин ачаална уу.",
      });
      // The useDoc hook for userProfile will refresh, and the header will update.
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
    return null; // Don't show if already an admin
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

            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">{UI.PROFILE.MY_TICKETS}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-20 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-5 w-32 mb-4" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-10 rounded-full" />
                                <Skeleton className="h-6 w-10 rounded-full" />
                                <Skeleton className="h-6 w-10 rounded-full" />
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
  const [ticketGroups, setTicketGroups] = useState<TicketGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "tickets"), orderBy("createdAt", "desc"));
  }, [firestore, user]);

  const { data: tickets } = useCollection<Ticket>(ticketsQuery);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
        setIsLoading(false);
        return;
    };
    if (!tickets || !firestore) {
        if(tickets === null && !isUserLoading) setIsLoading(false);
        return;
    };

    const groupTickets = async () => {
        setIsLoading(true);
        const groupedByLottery: Record<string, {lottery: Lottery | null, ticketNumbers: number[]}> = {};
        const lotteryCache: Record<string, Lottery> = {};

        for (const ticket of tickets) {
            if (!groupedByLottery[ticket.lotteryId]) {
                let lottery = lotteryCache[ticket.lotteryId];
                if (!lottery) {
                    const lotteryRef = doc(firestore, 'lotteries', ticket.lotteryId);
                    const lotteryDoc = await getDoc(lotteryRef);
                    if (lotteryDoc.exists()) {
                        lottery = { id: lotteryDoc.id, ...lotteryDoc.data() } as Lottery;
                        lotteryCache[ticket.lotteryId] = lottery;
                    }
                }

                groupedByLottery[ticket.lotteryId] = {
                    lottery: lottery || null,
                    ticketNumbers: []
                };
            }
            groupedByLottery[ticket.lotteryId].ticketNumbers.push(ticket.ticketNumber);
        }
        
        const finalGroups = Object.values(groupedByLottery).filter(g => g.lottery);
        setTicketGroups(finalGroups);
        setIsLoading(false);
    };
    
    groupTickets();
  }, [tickets, firestore, user, isUserLoading]);
  
  if (isUserLoading) {
     return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    redirect('/login');
  }

  if (isLoading && ticketGroups.length === 0) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-primary-foreground mb-2 font-headline">{UI.PROFILE.TITLE}</h1>
      <p className="text-muted-foreground mb-12">{user.email}</p>

      <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">{UI.PROFILE.MY_TICKETS}</h2>
      
      {ticketGroups.length === 0 && !isLoading ? (
        <p className="text-muted-foreground">{UI.PROFILE.NO_TICKETS}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ticketGroups.map((group, index) => (
            group.lottery && (
              <Card key={group.lottery.id + index}>
                <CardHeader>
                  <CardTitle>{group.lottery.title}</CardTitle>
                  <CardDescription>
                    {group.lottery.status === 'finished' ? 
                    <span className="text-destructive">Дууссан</span> : 
                    <span className="text-green-500">Идэвхтэй</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-4">{UI.PROFILE.TICKET_NUMBERS}:</p>
                  <div className="flex flex-wrap gap-2">
                    {group.ticketNumbers.sort((a, b) => a - b).map(num => (
                        <Badge key={num} variant="secondary">{num}</Badge>
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
