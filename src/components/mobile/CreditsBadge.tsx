'use client';

import { Infinity as InfinityIcon, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';

interface CreditsBadgeProps {
  profile: UserProfile | null;
  loading?: boolean;
  variant?: 'compact' | 'full';
  className?: string;
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  essential: 'Essentiel',
  standard: 'Standard',
  premium: 'Premium',
};

export function CreditsBadge({ profile, loading, variant = 'compact', className }: CreditsBadgeProps) {
  if (loading) return <Skeleton className={cn('h-7 w-24 rounded-full', className)} />;

  const isUnlimited = profile?.isUnlimited || profile?.role === 'superadmin';
  const planLabel = profile?.subscriptionPlan ? PLAN_LABELS[profile.subscriptionPlan] ?? profile.subscriptionPlan : 'Gratuit';

  return (
    <Badge
      variant="secondary"
      className={cn('flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold', className)}
    >
      {isUnlimited ? <InfinityIcon className="h-4 w-4 text-[#C2553B]" /> : <CreditCard className="h-4 w-4 text-[#C2553B]" />}
      {isUnlimited ? 'Illimité' : `${profile?.creditBalance ?? 0} crédit${(profile?.creditBalance ?? 0) === 1 ? '' : 's'}`}
      {variant === 'full' && <span className="text-muted-foreground font-normal">· {planLabel}</span>}
    </Badge>
  );
}
