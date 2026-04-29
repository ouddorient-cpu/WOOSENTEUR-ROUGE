
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowRight, Package, Search, Filter, LayoutGrid, List, Eye, Clock, Sparkles, Download, CheckSquare, Trash2, Loader2 } from 'lucide-react';
import { useMemo, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

function escapeCsvField(value: string | undefined | null): string {
  const str = value ?? '';
  // Always quote fields to avoid any ambiguity with commas in descriptions
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function exportProductsToCsv(selected: Product[]) {
  // WooCommerce importer expects comma as delimiter for fresh CSV files
  const SEP = ',';

  const headers = [
    'ID',
    'Type',
    'Nom',
    'Publié',
    'Description courte',
    'Description',
    'Tarif régulier',
    'Catégories',
    'Étiquettes',
    'Poids (kg)',
    'Meta: rank_math_title',
    'Meta: rank_math_description',
    'Meta: rank_math_focus_keyword',
    'Meta: _woosenteur_generated_by',
  ];

  const rows = selected.map((p) => [
    '',                                                                         // ID (vide = nouveau produit)
    'simple',                                                                   // Type
    escapeCsvField(p.name),
    '1',                                                                        // Publié
    escapeCsvField(p.seo?.shortDescription),
    escapeCsvField(p.seo?.longDescription),
    escapeCsvField(p.price != null ? String(p.price) : ''),
    escapeCsvField(p.productType),
    escapeCsvField(p.seo?.tags),
    escapeCsvField(p.weight ? (parseFloat(p.weight) / 1000).toFixed(3) : ''),
    escapeCsvField(p.seo?.productTitle),
    escapeCsvField(p.seo?.shortDescription),
    escapeCsvField(p.seo?.focusKeyword),
    'woosenteur',
  ]);

  const csvContent = [headers.join(SEP), ...rows.map((r) => r.join(SEP))].join('\r\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `woosenteur-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ProductsSkeleton = () => (
  <Card>
    <div className="p-6">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-80" />
    </div>
    <div className="p-6 pt-0">
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
    </div>
  </Card>
);

export default function ProductsListPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('products-view') as 'grid' | 'list') || 'grid';
    return 'grid';
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteSelectionOpen, setDeleteSelectionOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const productsPath = useMemo(() => user ? `users/${user.uid}/products` : null, [user]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(
    productsPath ? query(collection(firestore, productsPath), orderBy('createdAt', 'desc')) : null
  );

  useEffect(() => {
    if (!userLoading && !user) router.push('/login');
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

  useEffect(() => { setCurrentPage(1); }, [searchQuery, categoryFilter]);

  const allPageSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.has(p.id));

  const toggleProduct = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAllPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) paginatedProducts.forEach((p) => next.delete(p.id));
      else paginatedProducts.forEach((p) => next.add(p.id));
      return next;
    });
  }, [allPageSelected, paginatedProducts]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  }, [filteredProducts]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleExport = useCallback(() => {
    if (!products) return;
    exportProductsToCsv(products.filter((p) => selectedIds.has(p.id)));
  }, [products, selectedIds]);

  const deleteOne = useCallback(async (product: Product) => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/products`, product.id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
      toast({ title: 'Produit supprimé', description: product.name });
    } catch {
      toast({ title: 'Erreur', description: 'La suppression a échoué.', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [user, firestore, toast]);

  const deleteSelection = useCallback(async () => {
    if (!user || selectedIds.size === 0) return;
    setDeleting(true);
    let failed = 0;
    for (const id of selectedIds) {
      try {
        await deleteDoc(doc(firestore, `users/${user.uid}/products`, id));
      } catch {
        failed++;
      }
    }
    const deleted = selectedIds.size - failed;
    toast({
      title: `${deleted} produit${deleted > 1 ? 's' : ''} supprimé${deleted > 1 ? 's' : ''}`,
      description: failed > 0 ? `${failed} échec(s)` : undefined,
      variant: failed > 0 ? 'destructive' : 'default',
    });
    setSelectedIds(new Set());
    setDeleteSelectionOpen(false);
    setDeleting(false);
  }, [user, firestore, selectedIds, toast]);

  const isLoading = userLoading || productsLoading;
  if (isLoading || !user) return <ProductsSkeleton />;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
            <Package className="mr-2 h-3 w-3" /> Catalogue
          </Badge>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-white">Mes Produits</h1>
          <p className="text-muted-foreground">
            Gérez et exportez vos {filteredProducts.length} fiches produits générées.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
          <Link href="/dashboard/generate"><Sparkles className="mr-2 h-4 w-4" /> Nouveau Produit</Link>
        </Button>
      </div>

      {/* Filters */}
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
            <div className="flex gap-2 items-center">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] h-12 bg-background">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center w-12 h-12 bg-background border border-border rounded-lg" title="Sélectionner la page">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAllPage}
                  className="data-[state=checked]:bg-primary"
                  aria-label="Sélectionner toute la page"
                />
              </div>

              <div className="flex border border-border rounded-lg overflow-hidden h-12">
                <button
                  onClick={() => { setViewMode('grid'); localStorage.setItem('products-view', 'grid'); }}
                  className={`px-3 flex items-center transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                  title="Vue grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setViewMode('list'); localStorage.setItem('products-view', 'list'); }}
                  className={`px-3 flex items-center transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <div className="space-y-6">
        {paginatedProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`group overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col studio-card ${selectedIds.has(product.id) ? 'border-primary shadow-md shadow-primary/20' : 'border-border hover:border-primary/30'}`}
                >
                  <div className="aspect-[16/10] relative bg-muted flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name || 'Produit'} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/dashboard/products/${product.id}`}><Eye className="mr-2 h-4 w-4" /> Détails</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => { e.preventDefault(); setDeleteTarget(product); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded border-2 bg-background/90 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                        style={{ borderColor: selectedIds.has(product.id) ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                        onClick={(e) => { e.preventDefault(); toggleProduct(product.id); }}
                      >
                        {selectedIds.has(product.id) && <div className="w-3 h-3 rounded-sm bg-primary" />}
                      </div>
                      <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                        {product.productType || 'Produit'}
                      </Badge>
                    </div>
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
            <Card className="studio-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allPageSelected}
                        onCheckedChange={toggleAllPage}
                        className="data-[state=checked]:bg-primary"
                        aria-label="Sélectionner toute la page"
                      />
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} className={`group transition-colors ${selectedIds.has(product.id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name || ''} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.brand || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{product.productType || 'Produit'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {product.createdAt ? new Date(product.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild size="sm" variant="ghost" className="h-8">
                            <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-1">
                              Éditer <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(product)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )
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
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 px-4">
                Précédent
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 px-4">
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background border border-border shadow-2xl rounded-2xl px-5 py-3 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm font-medium text-foreground">
            <span className="font-bold text-primary">{selectedIds.size}</span> produit{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="w-px h-5 bg-border" />
          {selectedIds.size < filteredProducts.length && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={selectAll}>
              <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
              Tout sélectionner ({filteredProducts.length})
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearSelection}>
            Annuler
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteSelectionOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Supprimer
          </Button>
          <Button size="sm" className="h-8 shadow-lg shadow-primary/20" onClick={handleExport}>
            <Download className="mr-2 h-3.5 w-3.5" />
            Exporter CSV
          </Button>
        </div>
      )}

      {/* Confirm delete single */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span> sera définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => deleteTarget && deleteOne(deleteTarget)}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete selection */}
      <AlertDialog open={deleteSelectionOpen} onOpenChange={setDeleteSelectionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selectedIds.size} produit{selectedIds.size > 1 ? 's' : ''} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les {selectedIds.size} produits sélectionnés seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={deleteSelection}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Supprimer tout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
