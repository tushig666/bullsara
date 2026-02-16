'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { UI } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

const formSchema = z.object({
  email: z.string().email({ message: 'И-мэйл хаягаа зөв оруулна уу.' }),
  password: z.string().min(6, { message: 'Нууц үг 6-аас доошгүй тэмдэгттэй байх ёстой.' }),
});

async function setSessionCookie(idToken: string) {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    throw new Error('Failed to set session cookie');
  }
}

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!auth || !firestore) {
        toast({
            variant: 'destructive',
            title: UI.GENERAL.ERROR,
            description: "Authentication or Database service is not available.",
        });
        setIsSubmitting(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        role: 'user',
        createdAt: serverTimestamp(),
      });
      
      const idToken = await user.getIdToken();
      await setSessionCookie(idToken);
      
      toast({
        title: UI.GENERAL.SUCCESS,
        description: "Амжилттай бүртгүүлж, нэвтэрлээ.",
      });
      
      router.push('/');
      router.refresh();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: UI.GENERAL.ERROR,
        description: error.message,
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-primary-foreground font-headline">
          {UI.AUTH.SIGNUP_TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.AUTH.EMAIL}</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.AUTH.PASSWORD}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full glow-on-hover rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? UI.GENERAL.LOADING : UI.GENERAL.SIGNUP}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {UI.AUTH.HAVE_ACCOUNT}{' '}
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href="/login">{UI.GENERAL.LOGIN}</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
