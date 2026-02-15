'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lottery } from '@/lib/types';
import { UI } from '@/lib/i18n';
import { Badge } from './ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface LotteryCardProps {
  lottery: Lottery;
  index: number;
}

export function LotteryCard({ lottery, index }: LotteryCardProps) {
    const image = PlaceHolderImages.find(img => img.id === lottery.images[0]);
    const imageUrl = image?.imageUrl || 'https://picsum.photos/seed/placeholder/800/600';
    const imageHint = image?.imageHint || 'car';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -5 }}>
      <Link href={`/lotteries/${lottery.id}`} className="block group">
        <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-accent/20">
          <div className="overflow-hidden">
            <Image
              src={imageUrl}
              alt={lottery.title}
              width={800}
              height={600}
              data-ai-hint={imageHint}
              className="w-full h-auto object-cover aspect-[4/3] transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-primary-foreground mb-1 font-headline">{lottery.carModel}</h3>
                <p className="text-sm text-muted-foreground">{lottery.year}</p>
              </div>
              <Badge variant="secondary">{`${UI.LOTTERY.REMAINING_TICKETS}: ${lottery.remainingTickets}`}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{lottery.description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
