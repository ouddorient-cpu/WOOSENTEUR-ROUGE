'use client';

import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

interface UpsellBannerProps {
  profile: UserProfile | null;
}

// Place de choix pour brancher plus tard un achat de pack in-app (voir src/lib/mobile/iap.ts).
export function UpsellBanner({ profile }: UpsellBannerProps) {
  const isUnlimited = profile?.isUnlimited || profile?.role === 'superadmin';
  if (isUnlimited) return null;

  const isFree = !profile?.subscriptionPlan || profile.subscriptionPlan === 'free';
  const creditsLow = (profile?.creditBalance ?? 0) <= 2;
  if (!isFree && !creditsLow) return null;

  return (
    <Link
      href="/pricing"
      className="flex items-center gap-3 rounded-xl border border-[#C2553B]/30 bg-[#C2553B]/5 px-4 py-3 text-sm transition-colors hover:bg-[#C2553B]/10"
    >
      <Sparkles className="h-5 w-5 flex-shrink-0 text-[#C2553B]" />
      <span className="flex-1">
        <span className="font-semibold">Besoin de plus de fiches ?</span>{' '}
        <span className="text-muted-foreground">Passe à un plan supérieur.</span>
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </Link>
  );
}
