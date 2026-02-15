import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UI } from "@/lib/i18n";
import { getMyTickets } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const myTicketGroups = await getMyTickets();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-primary-foreground mb-2 font-headline">{UI.PROFILE.TITLE}</h1>
      <p className="text-muted-foreground mb-12">{user.email}</p>

      <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">{UI.PROFILE.MY_TICKETS}</h2>
      
      {myTicketGroups.length === 0 ? (
        <p className="text-muted-foreground">{UI.PROFILE.NO_TICKETS}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myTicketGroups.map((group) => (
            group.lottery && (
              <Card key={group.lottery.id}>
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
