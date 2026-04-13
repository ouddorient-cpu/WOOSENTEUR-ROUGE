'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useTrialCredits } from '@/hooks/use-trial-credits';
import { generateSeoOptimizedProductDescription } from '@/ai/flows/generate-seo-optimized-product-description';
import UpsellModal from '@/components/landing/UpsellModal';
import ProductResultModal from '@/components/landing/ProductResultModal';

const heroSchema = z.object({
  productName: z.string().min(2, { message: 'Au moins 2 caractères.' }),
});

type HeroFormValues = z.infer<typeof heroSchema>;

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

interface HeroProductFormProps {
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function HeroProductForm({ inputRef }: HeroProductFormProps) {
  const { toast } = useToast();
  const {
    creditsUsed,
    creditsRemaining,
    canGenerate,
    consumeCredit,
    isLimitReached,
    isHydrated,
  } = useTrialCredits();

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [generatedProduct, setGeneratedProduct] = useState<TrialProduct | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: { productName: '' },
  });

  // Progress animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && progress < 90) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) { clearInterval(timer); return prev; }
          return prev + 1;
        });
      }, 220);
    }
    return () => clearInterval(timer);
  }, [isGenerating, progress]);

  // Upsell 30s après la modal résultat
  useEffect(() => {
    if (showResultModal && !isLimitReached) {
      const timer = setTimeout(() => setShowUpsell(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [showResultModal, isLimitReached]);

  // Upsell si limite atteinte
  useEffect(() => {
    if (isLimitReached && isHydrated && showResultModal) setShowUpsell(true);
  }, [isLimitReached, isHydrated, showResultModal]);

  const onSubmit = useCallback(async (data: HeroFormValues) => {
    if (!canGenerate) { setShowUpsell(true); return; }

    setIsGenerating(true);
    setProgress(0);
    setProgressMessage('Woody part chercher les infos sur votre produit...');

    try {
      consumeCredit();
      setProgressMessage('Woody rédige votre fiche SEO...');

      const result = await generateSeoOptimizedProductDescription({
        productName: data.productName,
        brand: '',
        productMode: 'marque-connue',
        category: 'Parfum',
        language: 'French',
      });

      if (!result.success) throw new Error(result.error);

      setProgress(100);
      setGeneratedProduct({
        name: data.productName,
        brand: '',
        productType: 'Parfum',
        seo: result.data,
      });
      setIsGenerating(false);
      setShowResultModal(true);

      toast({ variant: 'success', title: 'Fiche produit générée !' });
    } catch (error: any) {
      setIsGenerating(false);
      setProgress(0);
      let msg = error.message || 'La génération a échoué. Veuillez réessayer.';
      if (msg.includes('API key')) msg = 'Le service IA est temporairement indisponible.';
      toast({ variant: 'destructive', title: 'Erreur', description: msg });
    }
  }, [canGenerate, consumeCredit, toast]);

  const handleNewGeneration = useCallback(() => {
    setGeneratedProduct(null);
    setProgress(0);
    form.reset();
  }, [form]);

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] bg-card">
        {/* Browser chrome */}
        <div className="h-9 bg-muted/60 flex items-center gap-1.5 px-4 border-b border-border/50">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 text-[11px] text-muted-foreground font-mono tracking-wide">
            Woosenteur — Générateur de fiches produits
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Badge crédits */}
          {isHydrated && (
            <div className="flex items-center justify-between">
              <Badge
                variant={isLimitReached ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {isLimitReached
                  ? 'Limite atteinte'
                  : `${creditsRemaining} génération(s) gratuite(s)`}
              </Badge>
              <span className="text-[10px] text-muted-foreground">Sans carte bancaire</span>
            </div>
          )}

          <div>
            <h3 className="font-headline text-base font-bold text-foreground">
              Teste maintenant — gratuit
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Écris un nom de parfum, Woody génère la fiche SEO complète.
            </p>
          </div>

          {/* Formulaire */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                name="productName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          if (inputRef && el) {
                            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                          }
                        }}
                        placeholder="ex: La Vie Est Belle, Sauvage Dior, Oud Al Fakhama..."
                        autoComplete="off"
                        className="text-sm"
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Champs grisés — visuels uniquement */}
              <div className="grid grid-cols-2 gap-2 opacity-45 pointer-events-none select-none">
                <div className="flex items-center gap-1.5 bg-muted/70 rounded-md px-3 py-2 text-xs border border-border/40">
                  <span className="text-muted-foreground">Catégorie :</span>
                  <span className="font-medium text-foreground">Parfum</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/70 rounded-md px-3 py-2 text-xs border border-border/40">
                  <span className="text-muted-foreground">Mode :</span>
                  <span className="font-medium text-foreground">Auto</span>
                </div>
              </div>

              {isGenerating ? (
                <Button type="button" disabled className="w-full">
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Génération en cours...
                </Button>
              ) : isLimitReached ? (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setShowUpsell(true)}
                >
                  <Rocket className="mr-2 h-3.5 w-3.5" />
                  Débloquer plus de crédits
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={!isHydrated}
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Générer ma fiche — Gratuit
                </Button>
              )}
            </form>
          </Form>

          {/* Barre de progression */}
          {isGenerating && (
            <div className="space-y-1.5">
              <p className="text-xs text-primary font-medium animate-pulse">{progressMessage}</p>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Résultat en ~30 secondes · 5 fiches gratuites
          </p>
        </div>
      </div>

      <ProductResultModal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        product={generatedProduct}
        onNewGeneration={handleNewGeneration}
        creditsRemaining={creditsRemaining}
        isLimitReached={isLimitReached}
      />

      <UpsellModal
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        creditsUsed={creditsUsed}
      />
    </>
  );
}
