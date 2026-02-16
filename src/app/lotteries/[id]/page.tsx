'use client';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UI } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { TicketPanel } from "./ticket-panel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { Lottery } from "@/lib/types";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function LotteryDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <Skeleton className="w-full aspect-[4/3] rounded-lg" />
        </div>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-12 w-3/4 mb-3" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

function WinnerInfoCard({ lottery }: { lottery: Lottery }) {
    if (lottery.status !== 'finished' || (!lottery.winnerTicket && !lottery.winnerUserId)) {
        return null;
    }

    return (
        <Card className="bg-green-500/10 border-green-500/50">
            <CardHeader>
                <CardTitle className="text-green-400 font-headline">🎉 {UI.LOTTERY.WINNER_ANNOUNCEMENT} 🎉</CardTitle>
                <CardDescription className="text-green-400/80">
                   {UI.LOTTERY.WINNER_DETERMINED} on {lottery.updatedAt ? format(lottery.updatedAt.toDate(), 'yyyy-MM-dd') : ''}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {lottery.winnerTicket && (
                    <p className="text-muted-foreground">{UI.LOTTERY.WINNING_TICKET}: <span className="font-bold text-lg text-primary-foreground">#{lottery.winnerTicket}</span></p>
                )}
                {lottery.winnerUserId && (
                    <p className="text-muted-foreground">Ялагч хэрэглэгч: <span className="font-mono text-xs text-primary-foreground">{lottery.winnerUserId}</span></p>
                )}
            </CardContent>
        </Card>
    );
}

export default function LotteryDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const firestore = useFirestore();
  const { user } = useUser();

  const lotteryDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'lotteries', id);
  }, [firestore, id]);

  const { data: lottery, isLoading: isDocLoading } = useDoc<Lottery>(lotteryDocRef);

  const isLoading = isDocLoading || !id;

  if (isLoading) {
    return <LotteryDetailSkeleton />;
  }

  if (!lottery) {
    notFound();
  }
  
  const images = lottery.images.map(id => PlaceHolderImages.find(img => img.id === id)).filter(Boolean);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {images.length > 0 ? images.map((image, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden rounded-xl">
                    <CardContent className="p-0">
                      <Image
                        src={image!.imageUrl}
                        alt={`${lottery.title} - view ${index + 1}`}
                        width={800}
                        height={600}
                        data-ai-hint={image!.imageHint}
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
                {lottery.status === 'active' ? `Идэвхтэй` : UI.LOTTERY.WINNER_DETERMINED}
              </Badge>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              {lottery.description}
            </p>
          </div>

          {lottery.status === 'finished' ? (
            <WinnerInfoCard lottery={lottery} />
          ) : (
            <TicketPanel lottery={lottery} user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
