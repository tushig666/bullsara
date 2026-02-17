'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lottery } from '@/lib/types';
import { UI } from '@/lib/i18n';
import { Badge } from './ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';

interface LotteryCardProps {
  lottery: Lottery;
  index: number;
}

export function LotteryCard({ lottery, index }: LotteryCardProps) {
    let imageUrl;
    let imageHint = 'car';

    const firstImage = lottery.images?.[0];

    if (firstImage && (firstImage.startsWith('http') || firstImage.startsWith('https'))) {
        imageUrl = firstImage;
        imageHint = lottery.carModel;
    } else {
        let image;
        if (firstImage) {
            image = PlaceHolderImages.find(img => img.id === firstImage);
        }

        if (!image) {
            const lowerCaseCarModel = lottery.carModel.toLowerCase();
            image = PlaceHolderImages.find(img => 
                lowerCaseCarModel.includes(img.imageHint.toLowerCase()) && 
                !img.imageHint.toLowerCase().includes('interior')
            );
        }
        
        imageUrl = image?.imageUrl || 'https://picsum.photos/seed/placeholder/800/450';
        imageHint = image?.imageHint || 'car';
    }

  return (
    <div className="transition-transform duration-300 ease-in-out hover:-translate-y-1.5">
      <Link href={`/lotteries/${lottery.id}`} className="block group">
        <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-accent/20">
          <div className="overflow-hidden">
            <Image
              src={imageUrl}
              alt={lottery.title}
              width={800}
              height={450}
              data-ai-hint={imageHint}
              className="w-full h-auto object-cover aspect-video transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1 font-headline">{lottery.title}</h3>
                <p className="text-sm text-muted-foreground">{lottery.carModel} - {lottery.year}</p>
              </div>
              <Badge variant="secondary">{`${UI.LOTTERY.REMAINING_TICKETS}: ${lottery.remainingTickets}`}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{lottery.description}</p>
            <div className="mt-6 pt-4 border-t border-border/40">
              <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Нэгж үнэ</span>
                  <span className="text-lg font-bold text-foreground">{lottery.pricePerTicket.toLocaleString()} ₮</span>
              </div>
            </div>
             <div className="mt-4">
                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                    Дэлгэрэнгүйг үзэх
                </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
