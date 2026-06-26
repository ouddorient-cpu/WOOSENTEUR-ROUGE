'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { CreditsBadge } from '@/components/mobile/CreditsBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, ShieldCheck, ExternalLink, LogOut } from 'lucide-react';

export default function MobileComptePage() {
  const { user } = useUser();
  const router = useRouter();

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const isSuperAdmin = profile?.role === 'superadmin';
  const hasPaidPlan = profile?.subscriptionPlan && profile.subscriptionPlan !== 'free';

  const handleLogout = async () => {
    await signOut(getAuth());
    router.replace('/m/login');
  };

  return (
    <div>
      <MobileHeader title="Ton compte Woosenteur" />
      <div className="space-y-4 p-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Plan actuel</p>
              <Badge variant={isSuperAdmin ? 'destructive' : 'secondary'} className="capitalize">
                {isSuperAdmin ? 'Admin' : profile?.subscriptionPlan ?? 'Gratuit'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Crédits</p>
              <CreditsBadge profile={profile} loading={profileLoading} />
            </div>
          </CardContent>
        </Card>

        {!isSuperAdmin && hasPaidPlan && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/pricing">
              Gérer mon abonnement
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}

        <Card>
          <CardContent className="divide-y p-0">
            <a
              href="mailto:contact@woosenteur.fr"
              className="flex items-center gap-3 p-4 text-sm transition-colors hover:bg-muted/50"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              Aide / Contact
            </a>
            <Link
              href="/legal/privacy"
              className="flex items-center gap-3 p-4 text-sm transition-colors hover:bg-muted/50"
            >
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Politique de confidentialité
            </Link>
          </CardContent>
        </Card>

        <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
