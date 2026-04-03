'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Sparkles, Loader2, Download, Bot, FileText, AlertCircle,
  Rocket, ShoppingCart, Star, Tag, Link as LinkIcon, Image as ImageIcon,
  Search, Globe, PenLine, Mail, CheckCircle2, ArrowRight,
  Layers, ImagePlus, Zap, LayoutDashboard, ExternalLink,
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
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedProduct, setGeneratedProduct] = useState<TrialProduct | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  // Email capture state
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'sending' | 'done'>('idle');

  // Store URL for "Voir ma boutique"
  const [storeUrl, setStoreUrl] = useState('');

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
        throw new Error(result.error);
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
    setCaptureEmail('');
    setCaptureStatus('idle');
    form.reset();
  }, [form]);

  const handleEmailCapture = useCallback(async () => {
    if (!captureEmail.includes('@')) return;
    setCaptureStatus('sending');
    try {
      await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: captureEmail,
          source: 'trial-generator',
          productName: generatedProduct?.name,
        }),
      });
      setCaptureStatus('done');
    } catch {
      setCaptureStatus('done'); // silencieux côté UI
    }
  }, [captureEmail, generatedProduct]);

  return (
    <section id="essai-gratuit" className="py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-purple-50/40">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
            Essai gratuit — Aucune inscription requise
          </Badge>
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Testez notre générateur{' '}
            <span className="text-gradient bg-gradient-to-r from-purple-500 to-pink-500">en live !</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
        <div className="max-w-5xl mx-auto rounded-2xl border border-primary/25 bg-white shadow-2xl shadow-primary/10 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-primary/30 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-gradient">Informations Produit</CardTitle>
                <CardDescription>
                  Remplissez les informations essentielles, notre IA s&apos;occupe du reste.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {/* Mode toggle */}
                    <FormField
                      control={form.control}
                      name="productMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode de génération</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => field.onChange('marque-connue')}
                              className={cn(
                                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-colors',
                                field.value === 'marque-connue'
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-muted text-muted-foreground hover:border-muted-foreground'
                              )}
                            >
                              <Globe className="h-4 w-4" />
                              Marque connue
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange('mon-produit')}
                              className={cn(
                                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-colors',
                                field.value === 'mon-produit'
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-muted text-muted-foreground hover:border-muted-foreground'
                              )}
                            >
                              <PenLine className="h-4 w-4" />
                              Mon produit
                            </button>
                          </div>
                          <FormDescription className="text-xs">
                            {isMonProduit
                              ? "Décrivez votre produit — l'IA crée la fiche à partir de vos infos."
                              : "L'agent recherche automatiquement le produit en ligne."}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Nom du produit */}
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du produit</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: La Vie Est Belle" {...field} autoComplete="off" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Marque */}
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {isMonProduit ? 'Nom de votre marque (optionnel)' : 'Marque'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={isMonProduit ? 'ex: Ma marque, ou laisser vide' : 'ex: Lancôme'}
                              {...field}
                              value={field.value ?? ''}
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
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
                            <FormLabel>Description de votre produit</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Ex: Sérum hydratant 30ml à base d'acide hyaluronique et niacinamide. Idéal pour peaux sèches, résultats visibles en 2 semaines. Fabriqué en France, sans parabènes."
                                className="resize-none text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Composition, bénéfices, usage… Plus vous en dites, meilleure est la fiche.
                            </FormDescription>
                            <FormMessage />
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
                            <FormLabel>Labels &amp; certifications</FormLabel>
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
                                    <label htmlFor={`trial-${cert.id}`} className="text-xs cursor-pointer leading-none">
                                      {cert.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                            <FormMessage />
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
                          <FormLabel>Type de Produit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Parfum">Parfum</SelectItem>
                              <SelectItem value="Soin">Soin</SelectItem>
                              <SelectItem value="Cosmétique">Cosmétique</SelectItem>
                              <SelectItem value="parfum d'intérieur">Parfum d&apos;intérieur</SelectItem>
                              <SelectItem value="Sport">Sport</SelectItem>
                              <SelectItem value="Habillement">Habillement</SelectItem>
                              <SelectItem value="Maison">Maison</SelectItem>
                              <SelectItem value="Autres">Autres</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                      <Button type="submit" size="lg" className="w-full" disabled={!isHydrated}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Générer ma fiche gratuite
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Result */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {step === 'generating' && (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-gradient">Woody est au travail !</CardTitle>
                  <CardDescription>Notre agent IA rédige votre fiche produit SEO.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center gap-6 py-10">
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
                </CardContent>
              </Card>
            )}

            {step === 'preview' && generatedProduct && (
              <div ref={resultRef} className="space-y-4">
                {/* WooCommerce Product Page Mock-up */}
                <div className="rounded-xl border border-border overflow-hidden shadow-xl">
                  {/* Browser chrome bar */}
                  <div className="bg-muted/80 px-4 py-2 flex items-center gap-2 border-b border-border">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400/70" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                      <span className="w-3 h-3 rounded-full bg-green-400/70" />
                    </div>
                    <div className="flex-1 bg-background/60 rounded px-3 py-1 flex items-center gap-2 text-xs text-muted-foreground ml-2">
                      <LinkIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">votre-boutique.fr/produit/{generatedProduct.seo?.slug || 'votre-produit'}</span>
                    </div>
                  </div>

                  {/* Product page content */}
                  <div className="bg-background p-5 space-y-4 max-h-[520px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Fake product image */}
                      <div className="aspect-square bg-muted/60 rounded-lg flex flex-col items-center justify-center border border-dashed border-border">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground/50 mt-2">Photo produit</span>
                      </div>

                      {/* Product info */}
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          {generatedProduct.brand || 'Votre marque'} › {generatedProduct.productType}
                        </p>
                        <h3 className="font-bold text-foreground text-sm leading-tight">
                          {generatedProduct.seo?.productTitle}
                        </h3>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">(12 avis)</span>
                        </div>
                        <p className="text-xl font-bold text-primary">XX,XX €</p>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {generatedProduct.seo?.shortDescription}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex-1 bg-primary/20 text-primary text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 opacity-60 cursor-default">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Ajouter au panier
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description longue */}
                    <div className="border-t border-border pt-4">
                      <div className="flex gap-4 mb-3">
                        <span className="text-xs font-semibold border-b-2 border-primary pb-1 text-primary">Description</span>
                        <span className="text-xs text-muted-foreground pb-1">Informations</span>
                      </div>
                      <div
                        className="prose prose-xs dark:prose-invert max-w-none text-muted-foreground text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: generatedProduct.seo?.longDescription || '' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Metadata panel */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5" /> Données SEO générées
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                      <span className="text-xs font-bold text-green-500">6 / 6</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {generatedProduct.seo?.focusKeyword && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0 w-28">Mot-clé focus :</span>
                        <span className="font-medium text-foreground">{generatedProduct.seo.focusKeyword}</span>
                      </div>
                    )}
                    {generatedProduct.seo?.slug && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0 w-28">Slug URL :</span>
                        <span className="font-mono text-primary text-xs">/{generatedProduct.seo.slug}</span>
                      </div>
                    )}
                    {generatedProduct.seo?.imageAltText && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0 w-28">Balise alt image :</span>
                        <span className="font-medium text-foreground">{generatedProduct.seo.imageAltText}</span>
                      </div>
                    )}
                    {generatedProduct.seo?.tags && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0 w-28">Tags :</span>
                        <div className="flex flex-wrap gap-1">
                          {generatedProduct.seo.tags.split(',').slice(0, 5).map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                              <Tag className="h-2.5 w-2.5" />{tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email capture — moment le plus chaud */}
                {captureStatus !== 'done' ? (
                  <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      Sauvegarder &amp; recevoir votre fiche par email
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      On vous envoie aussi un accès à toutes vos futures générations. Gratuit, sans engagement.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={captureEmail}
                        onChange={(e) => setCaptureEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEmailCapture()}
                        className="text-sm h-9"
                      />
                      <Button
                        size="sm"
                        onClick={handleEmailCapture}
                        disabled={!captureEmail.includes('@') || captureStatus === 'sending'}
                        className="shrink-0 h-9 px-4"
                      >
                        {captureStatus === 'sending'
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <><ArrowRight className="h-3.5 w-3.5" /></>}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">Email enregistré !</p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        Créez un compte pour retrouver toutes vos fiches →{' '}
                        <a href="/signup" className="underline font-medium">woosenteur.fr/signup</a>
                      </p>
                    </div>
                  </div>
                )}

                {/* "Voir ma boutique" — URL input */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    Voir votre produit dans votre vraie boutique
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Entrez votre domaine WooCommerce — on ouvre directement la page produit générée.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://votre-boutique.fr"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      className="text-sm h-9"
                    />
                    <Button
                      size="sm"
                      disabled={!storeUrl.trim()}
                      onClick={() => {
                        const base = storeUrl.startsWith('http')
                          ? storeUrl.replace(/\/$/, '')
                          : `https://${storeUrl.replace(/\/$/, '')}`;
                        const slug = generatedProduct?.seo?.slug || 'produit';
                        window.open(`${base}/produit/${slug}`, '_blank');
                      }}
                      className="shrink-0 h-9 px-3 gap-1.5 whitespace-nowrap font-semibold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Voir ma boutique
                    </Button>
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
