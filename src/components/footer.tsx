import { Logo } from './ui/logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between">
        <Logo className="w-32" />
        <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
          &copy; {currentYear} Bullsara. {`Бүх эрх хуулиар хамгаалагдсан.`}
        </p>
      </div>
    </footer>
  );
}
