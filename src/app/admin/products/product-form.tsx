'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UI } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Заавал бөглөнө үү' }),
  carModel: z.string().min(1, { message: 'Заавал бөглөнө үү' }),
  year: z.coerce.number().min(1900, { message: 'Зөв он оруулна уу' }),
  description: z.string().min(1, { message: 'Заавал бөглөнө үү' }),
  images: z.string().refine((value) => {
    if (!value.trim()) return true; // Allow empty or whitespace-only string
    const urls = value.split('\n').filter(url => url.trim() !== '');
    return urls.every(url => z.string().url().safeParse(url.trim()).success);
  }, { message: "URL тус бүр хүчинтэй байх ёстой бөгөөд мөр тус бүрд нэг байна." }),
  price: z.coerce.number().min(0, { message: 'Үнэ 0-ээс бага байж болохгүй' }),
  stock: z.coerce.number().min(0, { message: 'Тоо 0-ээс бага байж болохгүй' }),
});

type ProductFormProps = {
  product?: Product;
};

export function ProductForm({ product }: ProductFormProps) {
  const isEditMode = !!product;
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title || '',
      carModel: product?.carModel || '',
      year: product?.year || new Date().getFullYear(),
      description: product?.description || '',
      images: product?.images?.join('\n') || '',
      price: product?.price || 50000,
      stock: product?.stock || 100,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
        const dataPayload = {
            ...values,
            images: values.images.split('\n').map(url => url.trim()).filter(url => url),
        };

        if (isEditMode && product) {
            const productRef = doc(firestore, 'products', product.id);
            await setDoc(productRef, {
                ...dataPayload,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } else {
            const productsCollection = collection(firestore, 'products');
            const newDocRef = await addDoc(productsCollection, {
                ...dataPayload,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            // When adding a new document, we need to manually set the ID
            await setDoc(newDocRef, { id: newDocRef.id }, { merge: true });
        }

        toast({
            title: UI.GENERAL.SUCCESS,
            description: `Бүтээгдэхүүн амжилттай ${isEditMode ? 'шинэчлэгдлээ' : 'үүслээ'}.`,
        });
        router.push('/admin/products');
        router.refresh();
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
                <Textarea
                  placeholder="https://example.com/image1.png&#10;https://example.com/image2.png"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Зураг тус бүрийн URL-г шинэ мөрөн дээр оруулна уу.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.PRICE}</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        <FormField control={form.control} name="stock" render={({ field }) => (
            <FormItem>
              <FormLabel>{UI.ADMIN.STOCK}</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
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
