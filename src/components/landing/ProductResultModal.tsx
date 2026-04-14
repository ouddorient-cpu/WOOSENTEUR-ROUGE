'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Star, ShoppingCart, Link as LinkIcon, Image as ImageIcon,
  Sparkles, Loader2, Rocket, X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { WoodyEmoji } from '@/components/ui/woody-emoji';
import { generateProductCsv } from '@/ai/flows/generate-csv-flow';

interface GeneratedSeo {
  focusKeyword?: string;
  productTitle?: string;
  shortDescription?: string;
  longDescription?: string;
  category?: string;
  contenance?: string;
  mainNotes?: string;
  slug?: string;
  tags?: string;
  imageAltText?: string;
}

interface TrialProduct {
  name: string;
  brand: string;
  productType: string;
  seo: GeneratedSeo;
}

interface ProductResultModalProps {
  open: boolean;
  onClose: () => void;
  product: TrialProduct | null;
  onNewGeneration: () => void;
  creditsRemaining: number;
  isLimitReached: boolean;
}

export default function ProductResultModal({
  open,
  onClose,
  product,
  onNewGeneration,
  creditsRemaining,
  isLimitReached,
}: ProductResultModalProps) {
  const { toast } = useToast();

  const handleDownloadCsv = useCallback(async () => {
    if (!product) return;
    try {
      const result = await generateProductCsv({
        product: {
          name: product.name,
          brand: product.brand,
          productType: product.productType,
          seo: product.seo,
        },
        format: 'woocommerce-fr',
      });
      const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const fileName = product.seo?.slug ? `${product.seo.slug}.csv` : 'product.csv';
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ variant: 'success', title: 'Export réussi !', description: 'Votre fichier CSV a été téléchargé.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur CSV', description: 'Impossible de générer le fichier CSV.' });
    }
  }, [product, toast]);

  const handleNewGeneration = useCallback(() => {
    onNewGeneration();
    onClose();
  }, [onNewGeneration, onClose]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header sticky avec dégradé */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary via-purple-600 to-violet-700 px-6 py-5 text-white flex items-start justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-white leading-tight">
              Ta fiche est prête ! ✨
            </DialogTitle>
            <DialogDescription className="text-white/85 text-sm mt-0.5">
              {product.name} — optimisée pour Google
            </DialogDescription>
            {!isLimitReached && (
              <Badge className="mt-2 bg-white/20 text-white border-white/30 text-xs">
                {creditsRemaining - 1 >= 0 ? creditsRemaining - 1 : 0} génération(s) gratuite(s) restante(s)
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors mt-0.5 ml-4 shrink-0"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-5 space-y-4">
          {/* WooCommerce Product Page Mock-up */}
          <div className="rounded-xl border border-border overflow-hidden shadow-xl">
            <div className="bg-muted/80 px-4 py-2 flex items-center gap-2 border-b border-border">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <span className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 bg-background/60 rounded px-3 py-1 flex items-center gap-2 text-xs text-muted-foreground ml-2">
                <LinkIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">votre-boutique.fr/produit/{product.seo?.slug || 'votre-produit'}</span>
              </div>
            </div>

            <div className="bg-background p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-muted/60 rounded-lg flex flex-col items-center justify-center border border-dashed border-border">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground/50 mt-2">Photo produit</span>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {product.brand || 'Votre marque'} › {product.productType}
                  </p>
                  <h3 className="font-bold text-foreground text-sm leading-tight">
                    {product.seo?.productTitle}
                  </h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(12 avis)</span>
                  </div>
                  <p className="text-xl font-bold text-primary">XX,XX €</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {product.seo?.shortDescription}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 bg-primary/20 text-primary text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 opacity-60 cursor-default">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Ajouter au panier
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex gap-4 mb-3">
                  <span className="text-xs font-semibold border-b-2 border-primary pb-1 text-primary">Description</span>
                  <span className="text-xs text-muted-foreground pb-1">Informations</span>
                </div>
                <div
                  className="prose prose-xs dark:prose-invert max-w-none text-muted-foreground text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.seo?.longDescription || '' }}
                />
              </div>
            </div>
          </div>



          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button size="lg" variant="outline" onClick={handleDownloadCsv}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger CSV
            </Button>
            <Button size="lg" className="bg-primary text-white" asChild>
              <Link href="/signup">
                <Rocket className="mr-2 h-4 w-4" />
                Créer mon compte
              </Link>
            </Button>
            <Button size="lg" variant="secondary" onClick={handleNewGeneration} disabled={isLimitReached}>
              <Sparkles className="mr-2 h-4 w-4" />
              Nouvelle fiche
            </Button>
          </div>

          {isLimitReached && (
            <Alert>
              <WoodyEmoji mood="sad" size={20} className="mt-0.5" />
              <AlertTitle>Limite atteinte</AlertTitle>
              <AlertDescription>
                Vous avez utilisé vos générations gratuites. Passez à un plan payant pour continuer.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
