'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
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
import { doc, deleteDoc } from 'firebase/firestore';

export function AdminProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!firestore) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(firestore, 'products', product.id));
      toast({ title: UI.GENERAL.SUCCESS, description: 'Бүтээгдэхүүн устгагдлаа.' });
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: UI.GENERAL.ERROR, description: error.message });
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/products/${product.id}/edit`}>{UI.ADMIN.EDIT_PRODUCT}</Link>
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
