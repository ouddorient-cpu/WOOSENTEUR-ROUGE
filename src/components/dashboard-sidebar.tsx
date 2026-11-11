'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import {
  Home,
  Package,
  Sparkles,
  FileUp,
  User as UserIcon,
  LogOut,
  CreditCard,
  PanelLeft,
  Shield,
  Users,
  Key,
  Plug,
  Zap,
  Flame,
  ArrowUpRight,
  Settings,
  HelpCircle,
  FolderKanban,
  Image as ImageIcon,
} from 'lucide-react';
import Logo from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Badge } from './ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from './ui/separator';

const C = {
  orange: '#E55625',
  orangeHover: '#C2451C',
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isMobile?: boolean;
}

const NavLink: React.FC<NavItemProps> = ({ href, icon, label, badge, isMobile = false }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hrefPath, hrefQuery] = href.split('?');
  let isActive: boolean;
  if (hrefQuery) {
    const hrefParams = new URLSearchParams(hrefQuery);
    isActive = pathname === hrefPath && Array.from(hrefParams.entries()).every(([k, v]) => searchParams.get(k) === v);
  } else {
    isActive = pathname === hrefPath;
  }

  if (isMobile) {
    return (
      <SheetClose asChild>
        <Link
          href={href}
          className={cn(
            'flex items-center justify-between rounded-xl px-4 py-3 text-muted-foreground transition-all hover:bg-[#E55625]/10 hover:text-[#E55625]',
            isActive && 'bg-[#E55625] text-white shadow-md hover:bg-[#E55625] hover:text-white font-semibold'
          )}
        >
          <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
          </div>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
              {badge}
            </span>
          )}
        </Link>
      </SheetClose>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center justify-between rounded-xl px-3 py-2 text-xs md:text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground w-full',
        isActive && 'bg-[#E55625] text-white shadow-sm hover:bg-[#E55625] hover:text-white font-semibold'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn('shrink-0 transition-transform group-hover:scale-105', isActive && 'text-white')}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.2 rounded-full',
            isActive ? 'bg-white/20 text-white' : 'bg-[#E55625]/15 text-[#E55625]'
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

// Main Navigation Groups (Style Camb.ai Studio)
const primaryNav = [
  { href: '/dashboard', icon: <Home className="h-4 w-4" />, label: 'Home (Accueil)' },
  { href: '/dashboard/generate', icon: <Sparkles className="h-4 w-4" />, label: 'Générateur IA Fiches', badge: 'IA' },
  { href: '/dashboard/products', icon: <Package className="h-4 w-4" />, label: 'Catalogue & Produits' },
  { href: '/dashboard/social-visuals', icon: <ImageIcon className="h-4 w-4" />, label: 'Visuel réseaux sociaux' },
  { href: '/dashboard/import', icon: <FileUp className="h-4 w-4" />, label: 'Import / Export CSV' },
];

const integrationNav = [
  { href: '/dashboard/profile#api', icon: <Key className="h-4 w-4" />, label: 'Clés API Développeurs', badge: 'NOUVEAU' },
  { href: '/dashboard/profile', icon: <Plug className="h-4 w-4" />, label: 'Connecter WooCommerce' },
  { href: '/dashboard/billing', icon: <CreditCard className="h-4 w-4" />, label: 'Facturation & Plans' },
];

const adminNav = [
  { href: '/dashboard/admin', icon: <Users className="h-4 w-4" />, label: 'Utilisateurs & Admin' },
];

export const MobileNav = () => {
  const { user } = useUser();
  const router = useRouter();

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfilePath);

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  const isSuperAdmin = userProfile?.isUnlimited || userProfile?.role === 'superadmin';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 backdrop-blur-md px-4 sm:hidden">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="h-9 w-9">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col p-4">
            <div className="flex items-center gap-2 pb-4 border-b">
              <Logo className="h-8 w-8" />
              <div>
                <span className="font-headline text-lg font-bold">Woosenteur</span>
                <span className="text-[10px] text-muted-foreground block -mt-1">Studio IA</span>
              </div>
            </div>

            <nav className="grid gap-1 py-4 flex-1 overflow-y-auto">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3 mb-1">
                Espace Studio
              </div>
              {primaryNav.map((item) => (
                <NavLink key={item.href} {...item} isMobile />
              ))}

              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3 mt-4 mb-1">
                Intégrations & API
              </div>
              {integrationNav.map((item) => (
                <NavLink key={item.href} {...item} isMobile />
              ))}

              {isSuperAdmin && (
                <>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3 mt-4 mb-1">
                    Administration
                  </div>
                  {adminNav.map((item) => (
                    <NavLink key={item.href} {...item} isMobile />
                  ))}
                </>
              )}
            </nav>

            {/* Bottom Credits & Logout Mobile */}
            <div className="pt-3 border-t space-y-3">
              <Button asChild size="sm" className="w-full bg-[#E55625] hover:bg-[#C2451C] text-white font-bold">
                <Link href="/dashboard/billing">
                  <Flame className="h-4 w-4 mr-1.5 fill-current" />
                  Upgrade Plan / Crédits
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-bold text-sm">Woosenteur</span>
        </Link>
      </div>

      <Link
        href="/dashboard/profile"
        className="h-8 w-8 rounded-full bg-[#E55625] text-white flex items-center justify-center text-xs font-bold"
      >
        {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
      </Link>
    </header>
  );
};

export default function DashboardSidebar() {
  const { user } = useUser();
  const router = useRouter();

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfilePath);
  const isSuperAdmin = !!(userProfile?.isUnlimited || userProfile?.role === 'superadmin');

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  const creditBalance = userProfile?.creditBalance ?? 0;
  const planName = userProfile?.subscriptionPlan || 'Gratuit';
  const planQuota = planName === 'standard' ? 200 : planName === 'essential' ? 50 : 5;
  const progressPercent = Math.min(100, Math.max(10, Math.round((creditBalance / planQuota) * 100)));

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background/95 backdrop-blur-sm sm:flex">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Logo className="h-9 w-9 transition-transform group-hover:scale-105" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-base font-extrabold tracking-tight text-foreground">
                Woosenteur
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#E55625] text-white">
                STUDIO
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">
              IA E-commerce Rank Math
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation (Scrollable) */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto space-y-4">
        {/* Section 1 : Général */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 px-3 mb-1">
            Studio
          </div>
          {primaryNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Section 2 : Connecteurs & API */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 px-3 mb-1">
            Intégrations & API
          </div>
          {integrationNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Section 3 : Admin */}
        {isSuperAdmin && (
          <div className="space-y-1 pt-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-600 px-3 mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              SuperAdmin
            </div>
            {adminNav.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        )}
      </nav>

      {/* ── BOTTOM CARD (EXACTEMENT LE STYLE CAMB.AI "ADD MORE CREDITS / UPGRADE PLAN") ── */}
      <div className="p-3 border-t space-y-3 bg-muted/20">
        {isSuperAdmin ? (
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 mb-1">
              <Shield className="h-4 w-4" />
              <span>Accès SuperAdmin</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Crédits illimités et administration complète de la plateforme.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Ajouter des crédits</span>
              <Badge variant="secondary" className="text-[10px] capitalize px-1.5 font-semibold">
                {planName}
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground leading-tight">
              Sans engagement · fiches prêtes à l'emploi.
            </p>

            {/* Camb.ai Progress Meter */}
            <div className="space-y-1 pt-0.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E55625] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span className="text-foreground">{creditBalance} crédits</span>
                <span>{planQuota} quota</span>
              </div>
            </div>

            {/* Prominent Orange Upgrade Button */}
            <Button
              asChild
              size="sm"
              className="w-full h-8 text-xs font-bold bg-[#E55625] hover:bg-[#C2451C] text-white shadow-sm transition-all hover:shadow-md"
            >
              <Link href="/dashboard/billing">
                <Flame className="h-3.5 w-3.5 mr-1.5 fill-current" />
                Upgrade Plan
              </Link>
            </Button>
          </div>
        )}

        {/* ── USER PROFILE PILL AT BOTTOM (STYLE CAMB.AI) ── */}
        <div className="pt-1 flex items-center justify-between">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 min-w-0 group hover:opacity-85 transition-opacity"
            title="Gérer mon compte"
          >
            <div className="h-8 w-8 rounded-full bg-[#E55625] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-[#E55625] transition-colors">
                {user?.displayName || user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isSuperAdmin ? 'Administrateur' : 'Propriétaire'}
              </p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
