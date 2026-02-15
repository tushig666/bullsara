import { getLottery } from "@/app/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { UI } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { TicketPanel } from "./ticket-panel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getCurrentUser } from "@/lib/auth";

export default async function LotteryDetailPage({ params }: { params: { id: string } }) {
  const lottery = await getLottery(params.id);
  const user = await getCurrentUser();

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
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
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
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground mb-3 font-headline">
              {lottery.carModel}
            </h1>
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

          {lottery.status === 'finished' && lottery.winnerTicket ? (
            <Card className="bg-card/80">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-primary mb-4">{UI.LOTTERY.WINNER_ANNOUNCEMENT}</h3>
                    <div className="space-y-2">
                        <p className="text-muted-foreground">{UI.LOTTERY.WINNING_TICKET}: <span className="font-bold text-lg text-primary-foreground">{lottery.winnerTicket}</span></p>
                        <p className="text-muted-foreground">Ялагч: <span className="font-bold text-lg text-primary-foreground">{lottery.winnerUser}</span></p>
                    </div>
                </CardContent>
            </Card>
          ) : (
            <TicketPanel lottery={lottery} user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
