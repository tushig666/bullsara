import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('block', className)}>
      <Image
        src="/logo.png"
        alt="Bullsara Logo"
        width={1000}
        height={374}
        priority
        className="w-full h-auto"
      />
    </Link>
  );
}
