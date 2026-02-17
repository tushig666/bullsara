import { notFound } from "next/navigation";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UI } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { TicketPanel } from "./ticket-panel";
import { PlaceHolderImages, ImagePlaceholder } from "@/lib/placeholder-images";
import { Lottery, UserProfile } from "@/lib/types";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth";

async function getLottery(id: string): Promise<Lottery | null> {
  const lotterySnap = await adminDb.collection('lotteries').doc(id).get();
  if (!lotterySnap.exists) {
    return null;
  }
  return { id: lotterySnap.id, ...lotterySnap.data() } as Lottery;
}

export default async function LotteryDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch lottery data and user data in parallel on the server.
  const [lottery, user] = await Promise.all([
    getLottery(id),
    getCurrentUser()
  ]);

  // If the lottery doesn't exist, show the 404 page.
  if (!lottery) {
    notFound();
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
