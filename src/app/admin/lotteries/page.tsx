'use client';

import { Button } from "@/components/ui/button";
import { UI } from "@/lib/i18n";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminLotteryActions } from "./actions";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Lottery } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

function WinnerInfo({ lottery }: { lottery: Lottery }) {
    if (lottery.status !== 'finished' || !lottery.winnerTicket) {
        return <>-</>;
    }
    return <>#{lottery.winnerTicket}</>;
}

function LotteriesTableSkeleton() {
    return (
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
                {Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function AdminLotteriesPage() {
    const firestore = useFirestore();
    const lotteriesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'lotteries'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: lotteries, isLoading } = useCollection<Lottery>(lotteriesQuery);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{UI.ADMIN.LOTTERIES}</h1>
                <Button asChild>
                    <Link href="/admin/lotteries/new">{UI.ADMIN.CREATE_LOTTERY}</Link>
                </Button>
            </div>
            
            <div className="bg-card rounded-lg border">
                {isLoading ? <LotteriesTableSkeleton /> : (
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
                            {lotteries?.map((lottery) => (
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
                )}
            </div>
        </div>
    );
}
