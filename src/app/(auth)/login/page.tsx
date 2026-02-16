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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';

const formSchema = z.object({
  email: z.string().email({ message: 'И-мэйл хаягаа зөв оруулна уу.' }),
  password: z.string().min(6, { message: 'Нууц үг 6-аас доошгүй тэмдэгттэй байх ёстой.' }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!auth) {
        toast({
            variant: 'destructive',
            title: UI.GENERAL.ERROR,
            description: "Authentication service is not available.",
        });
        setIsSubmitting(false);
        return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The AuthListener will handle syncing the session and refreshing the page.
      
      toast({
        title: UI.GENERAL.SUCCESS,
        description: UI.AUTH.LOGIN_SUCCESS,
      });

      // We just need to wait for the AuthListener to do its job.
      // A small delay can help ensure the session is set before we navigate,
      // but router.refresh() in the listener is more reliable.
      router.replace('/');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: UI.GENERAL.ERROR,
        description: "Нэвтрэх нэр эсвэл нууц үг буруу байна.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-primary-foreground font-headline">
          {UI.AUTH.LOGIN_TITLE}
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
              {isSubmitting ? UI.GENERAL.LOADING : UI.GENERAL.LOGIN}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {UI.AUTH.NO_ACCOUNT}{' '}
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href="/signup">{UI.GENERAL.SIGNUP}</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
