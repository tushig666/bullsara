import { getLotteries } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { UI } from "@/lib/i18n";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminLotteryActions } from "./actions";
import { getLottery } from "@/app/actions";
import { Ticket as TicketIcon } from "lucide-react";


async function WinnerInfo({ lottery }: { lottery: any }) {
    if (lottery.status !== 'finished' || !lottery.winnerTicketId) {
        return <>-</>;
    }
    
    // In the new structure, we have winnerTicketId and winnerUserId
    // We need to fetch the ticket to get the number
    const winningTicket = null; // Ideally fetch this, but for now we just show we have a winner
    const winningUserEmail = lottery.winnerUser; // This might be populated from the old structure

    if(lottery.winnerTicket) {
      return <>#{lottery.winnerTicket}</>
    }

    return <>Ялагч тодорсон</>;
}


export default async function AdminLotteriesPage() {
    const lotteries = await getLotteries();
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{UI.ADMIN.LOTTERIES}</h1>
                <Button asChild>
                    <Link href="/admin/lotteries/new">{UI.ADMIN.CREATE_LOTTERY}</Link>
                </Button>
            </div>
            
            <div className="bg-card rounded-lg border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{UI.ADMIN.TITLE}</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>{UI.LOTTERY.REMAINING_TICKETS}</TableHead>
                            <TableHead>{UI.LOTTERY.WINNER_ANNOUNCEMENT}</TableHead>
                            <TableHead className="text-right">Үйлдэл</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lotteries.map((lottery) => (
                            <TableRow key={lottery.id}>
                                <TableCell className="font-medium">{lottery.title}</TableCell>
                                <TableCell>
                                    <Badge variant={lottery.status === 'active' ? 'secondary' : 'destructive'}>
                                        {lottery.status === 'active' ? 'Идэвхтэй' : 'Дууссан'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{lottery.remainingTickets} / {lottery.totalTickets}</TableCell>
                                <TableCell>
                                    <WinnerInfo lottery={lottery} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <AdminLotteryActions lottery={lottery} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
