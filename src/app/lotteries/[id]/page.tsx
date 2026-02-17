'use client';

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UI } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { TicketPanel } from "./ticket-panel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Lottery, UserProfile } from "@/lib/types";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

function LotteryDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                    <div className="bg-card border rounded-xl p-6 md:p-8 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}


export default function LotteryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const lotteryRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'lotteries', id);
  }, [firestore, id]);

  const { data: lottery, isLoading: isLotteryLoading } = useDoc<Lottery>(lotteryRef);

  // This is the robust check to prevent premature 404s.
  // It only calls notFound() after it has finished loading and confirmed the document doesn't exist.
  useEffect(() => {
    if (
      lotteryRef &&      // 1. An attempt to create a reference was made.
      !isLotteryLoading && // 2. The loading process is complete.
      !lottery             // 3. The final result is that no document was found.
    ) {
      notFound();
    }
  }, [lotteryRef, isLotteryLoading, lottery]);


  if (isUserLoading || isLotteryLoading || !lottery) {
      return <LotteryDetailSkeleton />;
  }

  let finalImages: ImagePlaceholder[] = [];
  
  if (lottery.images && lottery.images.length > 0 && lottery.images[0]) {
    const firstImage = lottery.images[0];
    if (firstImage.startsWith('http') || firstImage.startsWith('https')) {
        finalImages = lottery.images.map((url, i) => ({
            id: `url-${i}`,
            imageUrl: url,
            imageHint: lottery.carModel,
            description: `${lottery.title} - view ${i + 1}`,
        }));
    } else {
        finalImages = lottery.images
          .map(id => PlaceHolderImages.find(img => img.id === id))
          .filter((img): img is ImagePlaceholder => !!img);
    }
  }
  
  if (finalImages.length === 0) {
    const lowerCaseCarModel = lottery.carModel.toLowerCase();
    finalImages = PlaceHolderImages.filter(img => 
        img.imageHint.toLowerCase().includes(lowerCaseCarModel)
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
            <Carousel className="w-full">
                <CarouselContent>
                {finalImages.length > 0 ? finalImages.map((image, index) => (
                    <CarouselItem key={image.id + index}>
                    <Card className="overflow-hidden rounded-xl">
                        <CardContent className="p-0">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            width={800}
                            height={600}
                            data-ai-hint={image.imageHint}
                            className="w-full h-auto object-cover aspect-[4/3]"
                            priority={index === 0}
                        />
                        </CardContent>
                    </Card>
                    </CarouselItem>
                )) : (
                    <CarouselItem>
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                        <Image
                            src="https://picsum.photos/seed/placeholder/800/600"
                            alt={`${lottery.title} - placeholder`}
                            width={800}
                            height={600}
                            data-ai-hint="car"
                            className="w-full h-auto object-cover aspect-[4/3]"
                            priority={true}
                        />
                        </CardContent>
                    </Card>
                    </CarouselItem>
                )}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>

            <div className="bg-card border rounded-xl p-6 md:p-8">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary-foreground mb-2 font-headline">
                    {lottery.carModel}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">{lottery.title}</p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground mb-6 border-b pb-4">
                    <span>{UI.LOTTERY.YEAR}: <span className="font-semibold text-foreground">{lottery.year}</span></span>
                    <Badge variant={lottery.status === 'active' ? 'secondary' : 'destructive'}>
                        {lottery.status === 'active' ? `Идэвхтэй` : 'Дууссан'}
                    </Badge>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-4">{UI.LOTTERY.DESCRIPTION}</h2>
                <div className="text-muted-foreground leading-relaxed">
                    <p>{lottery.description}</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1">
            <div className="sticky top-24">
                 {lottery.status === 'active' ? (
                    <TicketPanel lottery={lottery} user={user as UserProfile | null} />
                ) : (
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-muted-foreground">Сугалаа дууссан</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Энэхүү сугалааны үйл ажиллагаа дууссан байна.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

    