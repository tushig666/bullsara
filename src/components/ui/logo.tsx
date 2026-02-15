import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('relative block h-10 w-[150px]', className)}>
      <Image src="/logo.png" alt="Bullsara Logo" fill priority sizes="150px" />
    </Link>
  );
}
