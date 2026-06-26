'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, query, orderBy } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection, useFirestore } from '@/firebase';
import type { Product } from '@/lib/types';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, ChevronRight } from 'lucide-react';

export default function MobileHistoriquePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const productsPath = useMemo(() => (user ? `users/${user.uid}/products` : null), [user]);
  const { data: products, isLoading } = useCollection<Product>(
    productsPath ? query(collection(firestore, productsPath), orderBy('createdAt', 'desc')) : null
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <div>
      <MobileHeader title="Tes fiches" />
      <div className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une fiche…"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune fiche pour le moment. Crée ta première fiche depuis l'onglet Générateur.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((product) => (
              <Link key={product.id} href={`/m/resultat/${product.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <FileText className="h-5 w-5 flex-shrink-0 text-[#C2553B]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.seo?.productTitle || product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.productType}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
