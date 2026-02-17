'use client';
import { UI } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { redirect, useRouter } from "next/navigation";
import { collection, query, getDoc, doc, orderBy, writeBatch, updateDoc } from "firebase/firestore";
import { Product, Order, UserProfile, Timestamp } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type OrderGroup = {
  product: Product | null;
  orders: Order[];
}

function formatClientTimestamp(timestamp: Timestamp): string {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'yyyy-MM-dd HH:mm');
    }
    return "Invalid Date";
}

const profileFormSchema = z.object({
  displayName: z.string().max(50, { message: "Нэр 50 тэмдэгтээс хэтрэхгүй байх ёстой." }).min(2, {
    message: "Нэр 2-оос доошгүй тэмдэгттэй байх ёстой.",
  }),
  photoURL: z.string().url({ message: "Хүчинтэй URL оруулна уу." }).or(z.literal('')),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfileCustomizer({ userProfile }: { userProfile: UserProfile }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userProfile.displayName || "",
      photoURL: userProfile.photoURL || "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!firestore || !userProfile) return;
    setIsSubmitting(true);
    
    try {
      const userRef = doc(firestore, 'users', userProfile.id);
      await updateDoc(userRef, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });
      toast({
        title: UI.GENERAL.SUCCESS,
        description: "Профайл амжилттай шинэчлэгдлээ.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: UI.GENERAL.ERROR,
        description: "Профайл шинэчлэхэд алдаа гарлаа: " + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle>{UI.PROFILE.EDIT_PROFILE}</CardTitle>
        <CardDescription>{UI.PROFILE.EDIT_PROFILE_DESC}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={form.watch('photoURL') || userProfile.photoURL || undefined} alt={userProfile.displayName} />
                    <AvatarFallback className="text-2xl">
                        {(userProfile.displayName || userProfile.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name="photoURL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{UI.PROFILE.PHOTO_URL}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/photo.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </div>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{UI.PROFILE.DISPLAY_NAME}</FormLabel>
                  <FormControl>
                    <Input placeholder="Таны нэр" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {UI.PROFILE.SAVE}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


function AdminPromotion() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPromoting, setIsPromoting] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);
  
  const { data: adminRoleDoc, isLoading } = useDoc(adminRoleRef);

  const handlePromote = async () => {
    if (!firestore || !user) return;
    setIsPromoting(true);
    
    const batch = writeBatch(firestore);
    
    // This is not standard practice, but for dev purposes, we ensure role is set on user doc.
    const userRef = doc(firestore, 'users', user.uid);
    batch.set(userRef, { role: 'admin' }, { merge: true });

    // This is the source of truth for security rules.
    const newAdminRoleRef = doc(firestore, 'roles_admin', user.uid);
    batch.set(newAdminRoleRef, { isAdmin: true, promotedAt: new Date() });

    try {
      await batch.commit();
      toast({
        title: "Амжилттай",
        description: "Та одоо админ эрхтэй боллоо. Хуудсыг дахин ачаална уу.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: error.message,
      });
    } finally {
      setIsPromoting(false);
    }
  };
  
  if (isLoading) {
    return <Skeleton className="h-36 w-full mt-12" />;
  }

  if (adminRoleDoc) {
    return null;
  }

  return (
     <Card className="mt-12 bg-destructive/10 border-destructive">
      <CardHeader>
        <div className="flex items-center gap-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <CardTitle className="text-destructive">Хөгжүүлэлтийн хэрэгсэл</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          Админ самбарт нэвтрэх эрх авахын тулд доорх товчийг дарна уу. Энэ бол зөвхөн хөгжүүлэлтийн үед ашиглах түр боломж бөгөөд бодит орчинд ашиглах боломжгүйг анхаарна уу.
        </p>
        <Button onClick={handlePromote} disabled={isPromoting} variant="destructive">
          {isPromoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Намайг Админ болгох"}
        </Button>
      </CardContent>
    </Card>
  );
}


function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="mb-12">
              <CardHeader>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-72 mt-2" />
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">{UI.PROFILE.MY_ORDERS}</h2>
            <div className="space-y-8">
                {Array.from({ length: 1 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-20 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "orders"), orderBy("createdAt", "desc"));
  }, [firestore, user]);

  const { data: orders, isLoading: isOrdersCollectionLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (isOrdersCollectionLoading) return;
    if (!orders) {
      setIsOrdersLoading(false);
      return;
    };
    if (!firestore) return;

    const groupOrders = async () => {
        const groupedByProduct: Record<string, OrderGroup> = {};
        const productCache: Record<string, Product> = {};

        for (const order of orders) {
            if (!groupedByProduct[order.productId]) {
                let product = productCache[order.productId];
                if (!product) {
                    const productRef = doc(firestore, 'products', order.productId);
                    const productDoc = await getDoc(productRef);
                    if (productDoc.exists()) {
                        product = { id: productDoc.id, ...productDoc.data() } as Product;
                        productCache[order.productId] = product;
                    }
                }

                groupedByProduct[order.productId] = {
                    product: product || null,
                    orders: []
                };
            }
            groupedByProduct[order.productId].orders.push(order);
        }
        
        const finalGroups = Object.values(groupedByProduct).filter(g => g.product);
        setOrderGroups(finalGroups);
        setIsOrdersLoading(false);
    };
    
    groupOrders();
  }, [orders, firestore, isOrdersCollectionLoading]);
  
  const isLoading = isUserLoading || isProfileLoading;
  
  if (isLoading) {
     return <ProfileSkeleton />;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {userProfile ? (
        <ProfileCustomizer userProfile={userProfile} />
      ) : (
        <Card className="mb-12">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-72 mt-2" />
            </CardHeader>
            <CardContent className="pt-6">
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
      )}

      <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-8 font-headline">{UI.PROFILE.MY_ORDERS}</h2>
      
      {isOrdersLoading ? (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-20 mt-1" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
      ) : orderGroups.length === 0 ? (
        <p className="text-muted-foreground">{UI.PROFILE.NO_ORDERS}</p>
      ) : (
        <div className="space-y-8">
          {orderGroups.map((group, index) => (
            group.product && (
              <Card key={group.product.id + index}>
                <CardHeader>
                  <CardTitle>{group.product.title}</CardTitle>
                  <CardDescription>
                    {group.product.carModel} - {group.product.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.orders.map(order => (
                      <div key={order.id} className="p-4 border rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <p><span className="font-semibold">Тоо ширхэг:</span> {order.quantity}</p>
                          <p><span className="font-semibold">Нийт дүн:</span> {order.totalPrice.toLocaleString()} ₮</p>
                          <p className="text-xs text-muted-foreground">Захиалгын огноо: {formatClientTimestamp(order.createdAt)}</p>
                        </div>
                        <Badge variant={order.status === 'paid' ? 'secondary' : 'outline'}>
                          {order.status === 'paid' ? 'Төлөгдсөн' : 'Хүлээгдэж буй'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
      <AdminPromotion />
    </div>
  );
}
