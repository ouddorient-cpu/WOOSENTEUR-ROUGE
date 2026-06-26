'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  /** Affiche un bouton retour qui fait router.back() au lieu d'une simple navigation par onglet. */
  showBack?: boolean;
}

export function MobileHeader({ title, showBack = false }: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur-sm"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          className="-ml-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Retour"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="font-headline text-lg font-bold">{title}</h1>
    </header>
  );
}
