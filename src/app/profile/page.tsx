'use client';
import { UI } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { redirect } from "next/navigation";
import { collection, query, where, getDoc, doc, orderBy } from "firebase/firestore";
import { Lottery, Ticket } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

type TicketGroup = {
  lottery: Lottery | null;
  ticketNumbers: number[];
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
    return query(collection(firestore, "tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
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

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-primary-foreground mb-2 font-headline">{UI.PROFILE.TITLE}</h1>
      <p className="text-muted-foreground mb-12">{user.email}</p>

      <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">{UI.PROFILE.MY_TICKETS}</h2>
      
      {ticketGroups.length === 0 ? (
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
                    <span className="text-destructive">{UI.LOTTERY.WINNER_DETERMINED}</span> : 
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
                   {group.lottery.winnerTicket && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="font-semibold">{UI.LOTTERY.WINNER_ANNOUNCEMENT}:</p>
                        <p>{UI.LOTTERY.WINNING_TICKET}: <Badge variant="default">{group.lottery.winnerTicket}</Badge></p>
                        {group.ticketNumbers.includes(group.lottery.winnerTicket) && <p className="text-green-400 font-bold mt-2">🎉 Та азтан боллоо! 🎉</p>}
                    </div>
                   )}
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}
