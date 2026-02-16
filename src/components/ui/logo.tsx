import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('relative block h-14 w-[240px]', className)}>
      <Image src="https://files.catbox.moe/dg3rej.png" alt="Bullsara Logo" fill priority sizes="240px" />
    </Link>
  );
}
