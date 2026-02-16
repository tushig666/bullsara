'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lottery, Ticket } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UI } from '@/lib/i18n';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc, writeBatch, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';

export function AdminLotteryActions({ lottery }: { lottery: Lottery }) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDelete = async () => {
    if (!firestore) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(firestore, 'lotteries', lottery.id));
      toast({ title: UI.GENERAL.SUCCESS, description: 'Сугалаа устгагдлаа.' });
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: error.message });
      setIsDeleting(false);
    }
  };
  
  const handleDrawWinner = async () => {
    if(!firestore) return;
    setIsDrawing(true);
    
    try {
        const ticketsCollectionRef = collection(firestore, "tickets");
        const q = query(ticketsCollectionRef, where("lotteryId", "==", lottery.id));

        const ticketsSnapshot = await getDocs(q);
        const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));

        if (tickets.length === 0) {
            throw new Error("Энэ сугалаанд зарагдсан тасалбар байхгүй байна.");
        }
        
        const winningTicketIndex = Math.floor(Math.random() * tickets.length);
        const winningTicket = tickets[winningTicketIndex];

        const userDocRef = doc(firestore, 'users', winningTicket.userId);
        // In a real app you would fetch user data, but for now we just need the id.
        
        const lotteryRef = doc(firestore, "lotteries", lottery.id);
        await updateDoc(lotteryRef, {
            status: 'finished',
            winnerTicketId: winningTicket.id,
            winnerUserId: winningTicket.userId,
            winnerTicket: winningTicket.ticketNumber,
        });

      toast({ title: UI.GENERAL.SUCCESS, description: `Ялагч тодорлоо! Азын дугаар: ${winningTicket.ticketNumber}` });
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: error.message });
    } finally {
        setIsDrawing(false);
    }
  };


  return (
    <div className="flex gap-2 justify-end">
      {lottery.status === 'active' && (
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDrawing}>
              {isDrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : UI.ADMIN.DRAW_WINNER}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{UI.ADMIN.DRAW_WINNER}?</AlertDialogTitle>
              <AlertDialogDescription>Энэ үйлдэл нь санамсаргүйгээр ялагчийг сонгоно. Та итгэлтэй байна уу?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{UI.GENERAL.CANCEL}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDrawWinner}>{UI.ADMIN.DRAW}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/lotteries/${lottery.id}/edit`}>{UI.ADMIN.EDIT_LOTTERY}</Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : UI.ADMIN.DELETE}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{UI.ADMIN.ARE_YOU_SURE}?</AlertDialogTitle>
            <AlertDialogDescription>{UI.ADMIN.CONFIRM_DELETE}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{UI.GENERAL.CANCEL}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {UI.ADMIN.DELETE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
