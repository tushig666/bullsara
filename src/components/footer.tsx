import { Logo } from './ui/logo';
import { UI } from '@/lib/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center text-center gap-4">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-2xl">
          {UI.HOME.SUBTITLE}
        </p>
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Bullsara. {`Бүх эрх хуулиар хамгаалагдсан.`}
        </p>
      </div>
    </footer>
  );
}
