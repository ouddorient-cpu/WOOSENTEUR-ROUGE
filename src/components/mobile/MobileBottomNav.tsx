'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/m/accueil', label: 'Accueil', icon: Home },
  { href: '/m/generateur', label: 'Générateur', icon: Sparkles },
  { href: '/m/historique', label: 'Historique', icon: Clock },
  { href: '/m/compte', label: 'Compte', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-background/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors',
              isActive ? 'text-[#C2553B] font-semibold' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
