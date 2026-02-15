'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteLottery, drawWinner } from '@/app/actions';
import { Lottery } from '@/lib/types';
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

export function AdminLotteryActions({ lottery }: { lottery: Lottery }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteLottery(lottery.id);
    if (result.success) {
      toast({ title: UI.GENERAL.SUCCESS, description: 'Сугалаа устгагдлаа.' });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: result.error });
    }
    setIsDeleting(false);
  };
  
  const handleDrawWinner = async () => {
    setIsDrawing(true);
    const result = await drawWinner(lottery.id);
    if (result.success) {
      toast({ title: UI.GENERAL.SUCCESS, description: `Ялагч тодорлоо! Азын дугаар: ${result.winnerTicket}` });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: result.error });
    }
    setIsDrawing(false);
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
              <AlertDialogDescription>{UI.ADMIN.CONFIRM_DELETE}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{UI.GENERAL.CANCEL}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDrawWinner} >{UI.ADMIN.DRAW}</AlertDialogAction>
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
