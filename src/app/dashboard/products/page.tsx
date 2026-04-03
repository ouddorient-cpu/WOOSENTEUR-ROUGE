
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Package, Search, Filter, LayoutGrid, List, Eye, Clock, Sparkles } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'soin', label: 'Soin' },
  { value: 'cosmetique', label: 'Cosmétique' },
  { value: 'complement', label: 'Complément' },
  { value: 'alimentaire', label: 'Alimentaire' },
  { value: 'vetement', label: 'Vêtement' },
  { value: 'electronique', label: 'Électronique' },
  { value: 'autre', label: 'Autre' },
];

const ProductsSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
    </CardHeader>
    <CardContent>
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-48" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
            <TableHead><Skeleton className="h-5 w-28" /></TableHead>
            <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function ProductsListPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const productsPath = useMemo(() => user ? `users/${user.uid}/products` : null, [user]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(
    productsPath ? query(collection(firestore, productsPath), orderBy('createdAt', 'desc')) : null
  );

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' ||
        p.productType?.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const isLoading = userLoading || productsLoading;

  if (isLoading || !user) {
    return <ProductsSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
            <Package className="mr-2 h-3 w-3" /> Catalogue
          </Badge>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-gradient">Mes Produits</h1>
          <p className="text-muted-foreground">
            Gérez et exportez vos {filteredProducts.length} fiches produits générées.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
          <Link href="/dashboard/generate"><Sparkles className="mr-2 h-4 w-4" /> Nouveau Produit</Link>
        </Button>
      </div>

      <Card className="mb-8 border-none bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou marque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-12 bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] h-12 bg-background">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {paginatedProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col studio-card">
                <div className="aspect-[16/10] relative bg-muted flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name || 'Produit'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/dashboard/products/${product.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> Détails
                      </Link>
                    </Button>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                    {product.productType || 'Produit'}
                  </Badge>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{product.brand}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {product.createdAt ? new Date(product.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                    <Button asChild size="sm" variant="link" className="text-xs h-auto p-0 font-bold text-primary">
                      <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-1 group/link">
                        Éditer <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed rounded-xl bg-muted/20">
            {products && products.length > 0 ? (
              <>
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-semibold">Aucun résultat</h3>
                <p className="text-muted-foreground">Nous n'avons trouvé aucun produit correspondant à vos filtres.</p>
                <Button variant="link" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }} className="mt-2">
                  Réinitialiser les filtres
                </Button>
              </>
            ) : (
              <>
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-semibold">Votre catalogue est vide</h3>
                <p className="text-muted-foreground mb-6">Commencez par générer votre première fiche produit avec l'IA.</p>
                <Button asChild size="lg">
                  <Link href="/dashboard/generate"><Sparkles className="mr-2 h-4 w-4" /> Commencer une génération</Link>
                </Button>
              </>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page <span className="font-bold text-foreground">{currentPage}</span> sur <span className="font-bold text-foreground">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 px-4"
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-9 px-4"
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
