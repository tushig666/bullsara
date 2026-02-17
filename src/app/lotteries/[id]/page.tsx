'use client';

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UI } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { TicketPanel } from "./ticket-panel";
import { PlaceHolderImages, ImagePlaceholder } from "@/lib/placeholder-images";
import { Lottery, UserProfile } from "@/lib/types";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

function LotteryDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                    <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                </div>
                <div className="space-y-8">
                    <div>
                        <Skeleton className="h-12 w-3/4 mb-2" />
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <div className="flex items-center gap-4 mb-6">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                    <Skeleton className="h-64 w-full rounded-lg" />
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

  const { data: lottery, isLoading: isLotteryLoading, error } = useDoc<Lottery>(lotteryRef);

  useEffect(() => {
    // This effect handles the case where the document doesn't exist.
    // It will only call notFound() if:
    // 1. We have tried to create a document reference (lotteryRef is not null).
    // 2. The loading process for that document has finished (!isLotteryLoading).
    // 3. The document was not found (lottery is null).
    if (lotteryRef && !isLotteryLoading && !lottery) {
        notFound();
    }
  }, [lotteryRef, isLotteryLoading, lottery]);


  // Show skeleton while any data is loading, or if we haven't determined
  // if the lottery exists yet. The useEffect above will handle the 404 case.
  if (isLotteryLoading || isUserLoading || !lottery) {
      return <LotteryDetailSkeleton />;
  }

  if (error) {
    // This should be handled by the FirebaseErrorListener
    console.error(error);
    // Potentially render a user-friendly error message
    return <p className="text-center py-16 text-destructive">Сугалааг ачаалахад алдаа гарлаа.</p>;
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
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
        </div>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground mb-2 font-headline">
              {lottery.carModel}
            </h1>
             <p className="text-xl text-muted-foreground mb-4">{lottery.title}</p>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <span>{UI.LOTTERY.YEAR}: {lottery.year}</span>
              <Badge variant={lottery.status === 'active' ? 'secondary' : 'destructive'}>
                {lottery.status === 'active' ? `Идэвхтэй` : 'Дууссан'}
              </Badge>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              {lottery.description}
            </p>
          </div>

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
  );
}
