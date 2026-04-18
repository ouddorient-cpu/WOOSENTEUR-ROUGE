'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Sparkles, Loader2, Download,
  Rocket, ShoppingCart, Star, Link as LinkIcon, Image as ImageIcon,
  PenLine, Layers, ImagePlus, Zap, LayoutDashboard, Globe,
} from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTrialCredits } from '@/hooks/use-trial-credits';
import { generateSeoOptimizedProductDescription } from '@/ai/flows/generate-seo-optimized-product-description';
import { generateProductCsv } from '@/ai/flows/generate-csv-flow';
import UpsellModal from './UpsellModal';
import { WoodyEmoji } from '@/components/ui/woody-emoji';

const CERTIFICATIONS = [
  { id: 'bio', label: 'Bio / Organic' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'cruelty-free', label: 'Cruelty-Free' },
  { id: 'made-in-france', label: 'Made in France' },
  { id: 'sans-paraben', label: 'Sans Parabène' },
  { id: 'naturel', label: 'Naturel / Clean' },
  { id: 'eco', label: 'Eco-responsable' },
];

const trialSchema = z.object({
  productName: z.string().min(2, { message: 'Le nom du produit doit contenir au moins 2 caractères.' }),
  productMode: z.enum(['marque-connue', 'mon-produit']).default('marque-connue'),
  brand: z.string().optional(),
  category: z.enum(['Parfum', 'Soin', 'Cosmétique', "parfum d'intérieur", 'Sport', 'Habillement', 'Maison', 'Autres'], {
    required_error: 'Veuillez sélectionner un type de produit.',
  }),
  productDescription: z.string().optional(),
  certifications: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  if (data.productMode === 'marque-connue' && (!data.brand || data.brand.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La marque doit contenir au moins 2 caractères.',
      path: ['brand'],
    });
  }
});

type TrialFormValues = z.infer<typeof trialSchema>;
type TrialStep = 'form' | 'generating' | 'preview';

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

export default function TrialGenerator() {
  const { toast } = useToast();
  const { creditsUsed, creditsRemaining, canGenerate, consumeCredit, isLimitReached, isHydrated } = useTrialCredits();

  const [step, setStep] = useState<TrialStep>('form');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [, setGenerationError] = useState<string | null>(null);
  const [generatedProduct, setGeneratedProduct] = useState<TrialProduct | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<TrialFormValues>({
    resolver: zodResolver(trialSchema),
    defaultValues: {
      productName: '',
      productMode: 'marque-connue',
      brand: '',
      productDescription: '',
      certifications: [],
    },
  });

  const productMode = form.watch('productMode');
  const isMonProduit = productMode === 'mon-produit';

  // Progress bar animation during generation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'generating' && progress < 90) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) { clearInterval(timer); return prev; }
          return prev + 1;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [step, progress]);

  // Scroll to results when preview is ready
  useEffect(() => {
    if (step === 'preview' && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  // 30s idle timer after generation → show upsell
  useEffect(() => {
    if (step === 'preview' && !isLimitReached) {
      idleTimerRef.current = setTimeout(() => { setShowUpsell(true); }, 30000);
    }
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [step, isLimitReached]);

  // Show upsell when limit reached
  useEffect(() => {
    if (isLimitReached && isHydrated && step === 'preview') { setShowUpsell(true); }
  }, [isLimitReached, isHydrated, step]);

  const onSubmit = useCallback(async (data: TrialFormValues) => {
    if (!canGenerate) { setShowUpsell(true); return; }

    setStep('generating');
    setGenerationError(null);
    setGeneratedProduct(null);
    setProgress(0);
    setProgressMessage(
      data.productMode === 'mon-produit'
        ? 'Woody lit votre description produit...'
        : 'Woody part chercher les infos sur votre produit...'
    );

    try {
      consumeCredit();

      setProgressMessage(
        data.productMode === 'mon-produit'
          ? 'Woody rédige votre fiche à partir de vos infos...'
          : 'Woody vérifie et structure les données...'
      );

      const result = await generateSeoOptimizedProductDescription({
        productName: data.productName,
        brand: data.brand || '',
        productMode: data.productMode,
        productDescription: data.productDescription,
        certifications: data.certifications?.length ? data.certifications.join(', ') : undefined,
        category: data.category,
        language: 'French',
      });
      if (!result.success) {
        throw new Error('La génération a échoué. Veuillez réessayer.');
      }
      const seoData = result.data;

      setProgress(90);
      setProgressMessage('Woody finalise votre fiche SEO... ✨');

      const product: TrialProduct = {
        name: data.productName,
        brand: data.brand || '',
        productType: data.category,
        seo: seoData,
      };

      setProgress(100);
      setGeneratedProduct(product);
      setStep('preview');

      toast({
        variant: 'success',
        title: 'Fiche produit générée !',
        description: `Il vous reste ${creditsRemaining - 1} génération(s) gratuite(s).`,
      });
    } catch (error: any) {
      console.error('Trial generation error:', error);
      let errorMessage = error.message || 'La génération a échoué. Veuillez réessayer.';
      if (errorMessage.includes('API key expired') || errorMessage.includes('API key not valid')) {
        errorMessage = 'Le service IA est temporairement indisponible. Veuillez réessayer plus tard.';
      }
      setGenerationError(errorMessage);
      setStep('form');
      toast({ variant: 'destructive', title: 'Erreur de génération', description: errorMessage });
    }
  }, [canGenerate, consumeCredit, creditsRemaining, toast]);

  const handleDownloadCsv = useCallback(async () => {
    if (!generatedProduct) return;
    try {
      const result = await generateProductCsv({
        product: {
          name: generatedProduct.name,
          brand: generatedProduct.brand,
          productType: generatedProduct.productType,
          seo: generatedProduct.seo,
        },
        format: 'woocommerce-fr',
      });
      const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const fileName = generatedProduct.seo?.slug ? `${generatedProduct.seo.slug}.csv` : 'product.csv';
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ variant: 'success', title: 'Export réussi !', description: 'Votre fichier CSV a été téléchargé.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur CSV', description: 'Impossible de générer le fichier CSV.' });
    }
  }, [generatedProduct, toast]);

  const handleNewGeneration = useCallback(() => {
    setStep('form');
    setGeneratedProduct(null);
    setGenerationError(null);
    setProgress(0);
    form.reset();
  }, [form]);

  return (
    <section id="essai-gratuit" className="py-20 lg:py-24 relative overflow-hidden z-10">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="section-label">Essai gratuit — Aucune inscription requise</span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mt-4">
            Testez notre générateur{' '}
            <span className="text-gradient">en live !</span>
          </h2>
          <p className="mt-4 text-lg text-white/50 max-w-2xl mx-auto">
            Marque connue ou votre propre produit — générez jusqu&apos;à 5 fiches produits SEO gratuitement.
          </p>
          {isHydrated && (
            <div className="mt-4 inline-flex items-center gap-2">
              <Badge
                variant={isLimitReached ? 'destructive' : 'default'}
                className="text-sm px-3 py-1"
              >
                {isLimitReached
                  ? 'Limite atteinte (5/5)'
                  : `${creditsRemaining}/5 générations restantes`}
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm shadow-2xl shadow-primary/10 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Carte formulaire — couleurs explicites pour éviter l'héritage CSS-var */}
            <div className="rounded-xl border border-violet-500/20 bg-[#0d0d22] shadow-lg shadow-violet-500/5">
              {/* Header */}
              <div className="p-6 pb-0">
                <p className="text-xl font-bold leading-none tracking-tight text-white">Informations Produit</p>
                <p className="text-sm text-white/50 mt-1.5">
                  Remplissez les informations essentielles, notre IA s&apos;occupe du reste.
                </p>
              </div>
              {/* Content */}
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {/* Mode toggle */}
                    <FormField
                      control={form.control}
                      name="productMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-medium">Mode de génération</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => field.onChange('marque-connue')}
                              className={cn(
                                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-all',
                                field.value === 'marque-connue'
                                  ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                                  : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                              )}
                            >
                              <Globe className="h-4 w-4" />
                              Marque connue
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange('mon-produit')}
                              className={cn(
                                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-all',
                                field.value === 'mon-produit'
                                  ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                                  : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                              )}
                            >
                              <PenLine className="h-4 w-4" />
                              Mon produit
                            </button>
                          </div>
                          <p className="text-xs text-white/40 mt-1.5">
                            {isMonProduit
                              ? "Décrivez votre produit — l'IA crée la fiche à partir de vos infos."
                              : "L'agent recherche automatiquement le produit en ligne."}
                          </p>
                        </FormItem>
                      )}
                    />

                    {/* Nom du produit */}
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-medium">Nom du produit</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ex: La Vie Est Belle"
                              {...field}
                              autoComplete="off"
                              className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Marque */}
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-medium">
                            {isMonProduit ? 'Nom de votre marque (optionnel)' : 'Marque'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={isMonProduit ? 'ex: Ma marque, ou laisser vide' : 'ex: Lancôme'}
                              {...field}
                              value={field.value ?? ''}
                              autoComplete="off"
                              className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Description libre — mode Mon produit uniquement */}
                    {isMonProduit && (
                      <FormField
                        control={form.control}
                        name="productDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80 font-medium">Description de votre produit</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Ex: Sérum hydratant 30ml à base d'acide hyaluronique et niacinamide. Idéal pour peaux sèches, résultats visibles en 2 semaines. Fabriqué en France, sans parabènes."
                                className="resize-none text-sm bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-white/40 mt-1">
                              Composition, bénéfices, usage… Plus vous en dites, meilleure est la fiche.
                            </p>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Certifications — mode Mon produit uniquement */}
                    {isMonProduit && (
                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80 font-medium">Labels &amp; certifications</FormLabel>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {CERTIFICATIONS.map((cert) => {
                                const checked = (field.value ?? []).includes(cert.id);
                                return (
                                  <div key={cert.id} className="flex items-center gap-2">
                                    <Checkbox
                                      id={`trial-${cert.id}`}
                                      checked={checked}
                                      onCheckedChange={(val) => {
                                        const current = field.value ?? [];
                                        field.onChange(
                                          val ? [...current, cert.id] : current.filter((v: string) => v !== cert.id)
                                        );
                                      }}
                                    />
                                    <label htmlFor={`trial-${cert.id}`} className="text-xs text-white/70 cursor-pointer leading-none">
                                      {cert.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Catégorie */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-medium">Type de Produit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/[0.06] border-white/10 text-white">
                                <SelectValue placeholder="Sélectionner le type..." className="text-white/30" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#141428] border-white/10 text-white">
                              <SelectItem value="Parfum" className="text-white hover:bg-white/10 focus:bg-white/10">Parfum</SelectItem>
                              <SelectItem value="Soin" className="text-white hover:bg-white/10 focus:bg-white/10">Soin</SelectItem>
                              <SelectItem value="Cosmétique" className="text-white hover:bg-white/10 focus:bg-white/10">Cosmétique</SelectItem>
                              <SelectItem value="parfum d'intérieur" className="text-white hover:bg-white/10 focus:bg-white/10">Parfum d&apos;intérieur</SelectItem>
                              <SelectItem value="Sport" className="text-white hover:bg-white/10 focus:bg-white/10">Sport</SelectItem>
                              <SelectItem value="Habillement" className="text-white hover:bg-white/10 focus:bg-white/10">Habillement</SelectItem>
                              <SelectItem value="Maison" className="text-white hover:bg-white/10 focus:bg-white/10">Maison</SelectItem>
                              <SelectItem value="Autres" className="text-white hover:bg-white/10 focus:bg-white/10">Autres</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {step === 'generating' ? (
                      <Button type="button" disabled size="lg" className="w-full">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération en cours...
                      </Button>
                    ) : isLimitReached ? (
                      <Button type="button" size="lg" className="w-full" onClick={() => setShowUpsell(true)}>
                        <Rocket className="mr-2 h-4 w-4" />
                        Débloquer plus de crédits
                      </Button>
                    ) : (
                      <Button type="submit" size="lg" className="w-full btn-primary-glow" disabled={!isHydrated}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Générer ma fiche gratuite
                      </Button>
                    )}
                  </form>
                </Form>
              </div>
            </div>
          </motion.div>

          {/* Right: Result */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {step === 'generating' && (
              <div className="h-full rounded-xl border border-violet-500/20 bg-[#0d0d22]">
                <div className="p-6 pb-0">
                  <p className="text-xl font-bold text-white">Woody est au travail !</p>
                  <p className="text-sm text-white/50 mt-1.5">Notre agent IA rédige votre fiche produit SEO.</p>
                </div>
                <div className="flex flex-col justify-center items-center gap-6 py-10 px-6">
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <NextImage
                      src="/mascotte woosenteur.png"
                      alt="Woosenteur génère votre fiche"
                      width={90}
                      height={90}
                      style={{ width: 90, height: 'auto' }}
                      className="drop-shadow-lg"
                    />
                  </motion.div>
                  <span className="text-base font-medium text-primary text-center">{progressMessage}</span>
                  <Progress value={progress} className="w-full" data-state={progress === 100 ? 'completed' : 'loading'} />
                </div>
              </div>
            )}

            {step === 'preview' && generatedProduct && (
              <div ref={resultRef} className="space-y-4">
                {/* WooCommerce Product Page Mock-up */}
                <div className="rounded-xl border border-white/10 overflow-hidden shadow-xl">
                  {/* Browser chrome bar */}
                  <div className="bg-[#1a1a2e] px-4 py-2 flex items-center gap-2 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400/70" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                      <span className="w-3 h-3 rounded-full bg-green-400/70" />
                    </div>
                    <div className="flex-1 bg-white/[0.07] rounded px-3 py-1 flex items-center gap-2 text-xs text-white/40 ml-2">
                      <LinkIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">votre-boutique.fr/produit/{generatedProduct.seo?.slug || 'votre-produit'}</span>
                    </div>
                  </div>

                  {/* Product page content — fond blanc simulant WooCommerce */}
                  <div className="bg-white p-5 space-y-4 max-h-[520px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Fake product image */}
                      <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300">
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                        <span className="text-xs text-gray-400 mt-2">Photo produit</span>
                      </div>

                      {/* Product info */}
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500">
                          {generatedProduct.brand || 'Votre marque'} › {generatedProduct.productType}
                        </p>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">
                          {generatedProduct.seo?.productTitle}
                        </h3>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">(12 avis)</span>
                        </div>
                        <p className="text-xl font-bold text-violet-600">XX,XX €</p>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                          {generatedProduct.seo?.shortDescription}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex-1 bg-violet-100 text-violet-700 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 opacity-60 cursor-default">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Ajouter au panier
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description longue */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex gap-4 mb-3">
                        <span className="text-xs font-semibold border-b-2 border-violet-600 pb-1 text-violet-600">Description</span>
                        <span className="text-xs text-gray-400 pb-1">Informations</span>
                      </div>
                      <div
                        className="prose prose-xs dark:prose-invert max-w-none text-muted-foreground text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: generatedProduct.seo?.longDescription || '' }}
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
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/signup">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Publier sur WooCommerce
                    </Link>
                  </Button>
                  <Button size="lg" onClick={handleNewGeneration} disabled={isLimitReached}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Nouvelle fiche
                  </Button>
                </div>

                {isLimitReached && (
                  <Alert>
                    <WoodyEmoji mood="sad" size={20} className="mt-0.5" />
                    <AlertTitle>Limite atteinte</AlertTitle>
                    <AlertDescription>
                      Vous avez utilisé vos 5 fiches gratuites. Passez à un plan payant pour continuer.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {step === 'form' && !generatedProduct && (
              <Card className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/20 min-h-[400px]">
                <CardContent className="text-center flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <NextImage
                      src="/woody-white.png"
                      alt="Woody mascotte Woosenteur"
                      width={100}
                      height={100}
                      style={{ width: 100, height: 'auto' }}
                      className="drop-shadow-md"
                    />
                  </motion.div>
                  <div>
                    <h3 className="font-headline text-xl font-semibold text-foreground/70">
                      La fiche produit apparaîtra ici
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Remplissez le formulaire et lancez la génération.
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-2xl px-4 py-2.5 border border-primary/15 shadow-sm max-w-[240px]">
                    <p className="text-xs text-primary font-medium leading-relaxed flex items-center gap-1.5">
                      <WoodyEmoji mood="confused" size={24} />
                      Plus vous décrivez votre produit, meilleure est la fiche !
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
        </div>

        {/* Dashboard teaser — sous le générateur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 max-w-5xl mx-auto"
        >
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border border-primary/20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              {/* Texte gauche */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-wide">Dans votre Dashboard</span>
                </div>
                <h3 className="font-headline text-xl md:text-2xl font-bold text-foreground mb-1">
                  Ce générateur, c&apos;est l&apos;aperçu.
                </h3>
                <p className="text-foreground/70 text-base">
                  Dans votre espace : publication en masse, visuels pour vos réseaux, historique de vos fiches, accès à tous vos exports.
                </p>
              </div>

              {/* Features pills */}
              <div className="flex flex-col gap-3 shrink-0">
                {[
                  { icon: <Layers className="h-4 w-4" />, label: 'Publication en masse', sub: 'Tous vos produits d\'un coup' },
                  { icon: <ImagePlus className="h-4 w-4" />, label: 'Visuels pour vos réseaux', sub: 'Instagram, TikTok, Facebook' },
                  { icon: <Zap className="h-4 w-4" />, label: 'Génération illimitée', sub: 'Sans quota, sans attente' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/80 dark:bg-card/80 rounded-xl px-4 py-2.5 border border-border/60 shadow-sm">
                    <span className="text-primary shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-5 border-t border-primary/15">
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 font-semibold">
                  <Rocket className="mr-2 h-4 w-4" />
                  Accéder à mon Dashboard — Gratuit
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">5 fiches offertes · Sans carte bancaire</p>
            </div>
          </div>
        </motion.div>

      </div>

      <UpsellModal
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        creditsUsed={creditsUsed}
      />
    </section>
  );
}
