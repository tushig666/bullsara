'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UI } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lottery } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Заавал бөглөнө үү' }),
  carModel: z.string().min(1, { message: 'Заавал бөглөнө үү' }),
  year: z.coerce.number().min(1900, { message: 'Зөв он оруулна уу' }),
  description: z.string().min(1, { message: 'Заавал бөглөнө үү' }),
  images: z.string().url({ message: "Хүчинтэй URL хаяг оруулна уу." }).or(z.literal('')),
  pricePerTicket: z.coerce.number().min(0, { message: 'Үнэ 0-ээс бага байж болохгүй' }),
  totalTickets: z.coerce.number().min(1, { message: 'Тоо 1-ээс бага байж болохгүй' }),
});

type LotteryFormProps = {
  lottery?: Lottery;
};

export function LotteryForm({ lottery }: LotteryFormProps) {
  const isEditMode = !!lottery;
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: lottery?.title || '',
      carModel: lottery?.carModel || '',
      year: lottery?.year || new Date().getFullYear(),
      description: lottery?.description || '',
      images: lottery?.images?.[0] || '',
      pricePerTicket: lottery?.pricePerTicket || 50000,
      totalTickets: lottery?.totalTickets || 10000,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
        const dataPayload = {
            ...values,
            images: values.images ? [values.images] : [],
        };

        if (isEditMode && lottery) {
            const lotteryRef = doc(firestore, 'lotteries', lottery.id);
            await setDoc(lotteryRef, {
                ...dataPayload,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } else {
            const lotteriesCollection = collection(firestore, 'lotteries');
            await addDoc(lotteriesCollection, {
                ...dataPayload,
                remainingTickets: values.totalTickets,
                nextTicketNumber: 1,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        toast({
            title: UI.GENERAL.SUCCESS,
            description: `Сугалаа амжилттай ${isEditMode ? 'шинэчлэгдлээ' : 'үүслээ'}.`,
        });
        router.push('/admin/lotteries');
        router.refresh(); // To ensure the list page is up-to-date
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: UI.GENERAL.ERROR,
            description: error.message || 'An unknown error occurred.',
        });
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>{UI.ADMIN.TITLE}</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="carModel" render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.CAR_MODEL}</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        <FormField control={form.control} name="year" render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.YEAR}</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.DESCRIPTION}</FormLabel>
              <FormControl><Textarea rows={5} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.IMAGES}</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="pricePerTicket" render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.PRICE_PER_TICKET}</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        <FormField control={form.control} name="totalTickets" render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.TOTAL_TICKETS}</FormLabel>
              <FormControl><Input type="number" {...field} disabled={isEditMode} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {UI.GENERAL.SUBMIT}
        </Button>
      </form>
    </Form>
  );
}
