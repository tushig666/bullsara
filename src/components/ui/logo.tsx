import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('relative block h-10 w-[240px]', className)}>
      <Image src="https://i.postimg.cc/mDDB9tqC/Bullsara-1.png" alt="Bullsara Logo" fill priority sizes="240px" />
    </Link>
  );
}
