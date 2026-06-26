'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import type { UserProfile, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, ArrowRight, FileText } from 'lucide-react';
import { CreditsBadge } from '@/components/mobile/CreditsBadge';
import { UpsellBanner } from '@/components/mobile/UpsellBanner';

export default function MobileAccueilPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const lastProductPath = useMemo(() => (user ? `users/${user.uid}/products` : null), [user]);
  const { data: lastProducts, isLoading: lastProductLoading } = useCollection<Product>(
    lastProductPath ? query(collection(firestore, lastProductPath), orderBy('createdAt', 'desc'), limit(1)) : null
  );
  const lastProduct = lastProducts?.[0];

  return (
    <div className="space-y-6 p-4 pt-6">
      <div>
        <p className="text-sm text-muted-foreground">Bonjour {user?.displayName || ''} 👋</p>
        <h1 className="font-headline text-2xl font-bold">Ton compte Woosenteur</h1>
      </div>

      <CreditsBadge profile={profile} loading={profileLoading} variant="full" />

      <Card className="border-[#C2553B]/20 bg-gradient-to-br from-[#C2553B]/10 to-transparent">
        <CardContent className="space-y-3 p-5">
          <Sparkles className="h-6 w-6 text-[#C2553B]" />
          <div>
            <h2 className="font-headline text-lg font-bold">Créer une fiche</h2>
            <p className="text-sm text-muted-foreground">Décris ton produit en quelques mots, on s'occupe du reste.</p>
          </div>
          <Button asChild className="w-full bg-[#C2553B] hover:bg-[#A23F29] text-white">
            <Link href="/m/generateur">
              Créer une fiche
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Dernier résultat</h3>
        {lastProductLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : lastProduct ? (
          <Link href={`/m/resultat/${lastProduct.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="h-5 w-5 flex-shrink-0 text-[#C2553B]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{lastProduct.seo?.productTitle || lastProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{lastProduct.productType}</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Tu n'as pas encore créé de fiche. Lance-toi !
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Connecté avec le même compte que sur woosenteur.fr — tes fiches sont synchronisées automatiquement.
      </p>

      <UpsellBanner profile={profile} />
    </div>
  );
}
