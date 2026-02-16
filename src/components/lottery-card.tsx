'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lottery } from '@/lib/types';
import { UI } from '@/lib/i18n';
import { Badge } from './ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface LotteryCardProps {
  lottery: Lottery;
  index: number;
}

export function LotteryCard({ lottery, index }: LotteryCardProps) {
    let image;
    // If the lottery has a specific image ID, use it.
    if (lottery.images && lottery.images.length > 0) {
        image = PlaceHolderImages.find(img => img.id === lottery.images[0]);
    }

    // If no specific image, try to find one based on car model hint
    if (!image) {
        const lowerCaseCarModel = lottery.carModel.toLowerCase();
        // Find an image where the hint is included in the car model name, but exclude interior shots.
        image = PlaceHolderImages.find(img => 
            lowerCaseCarModel.includes(img.imageHint.toLowerCase()) && 
            !img.imageHint.toLowerCase().includes('interior')
        );
    }
    
    const imageUrl = image?.imageUrl || 'https://picsum.photos/seed/placeholder/800/450';
    const imageHint = image?.imageHint || 'car';

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
                <h3 className="text-xl font-bold text-primary-foreground mb-1 font-headline">{lottery.title}</h3>
                <p className="text-sm text-muted-foreground">{lottery.carModel} - {lottery.year}</p>
              </div>
              <Badge variant="secondary">{`${UI.LOTTERY.REMAINING_TICKETS}: ${lottery.remainingTickets}`}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{lottery.description}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
