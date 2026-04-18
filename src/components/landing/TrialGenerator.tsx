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

  /* ── Couleurs warm (cohérence landing) ── */
  const C = {
    bg:        '#FAF6F0',
    bgAlt:     '#F3ECE4',
    surface:   '#FDF9F5',
    text:      '#2E2018',
    muted:     '#7A6D62',
    border:    '#E5DDD4',
    sage:      '#7D9B76',
    sagePale:  '#EDF2EC',
    terra:     '#D4704A',
    terraDark: '#BF5E3A',
  };

  const inputCls = `bg-[${C.bg}] border-[${C.border}] text-[${C.text}] placeholder:text-[${C.muted}]/50 focus:border-[${C.terra}]/60 focus:ring-0`;

  return (
    <section id="essai-gratuit" className="py-16 sm:py-20 relative overflow-hidden" style={{ background: C.bgAlt }}>
      <div className="container mx-auto px-4 md:px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide" style={{ background: C.sagePale, color: C.sage }}>
            Essai gratuit — Aucune inscription requise
          </span>
          <h2 className="font-bold mt-2" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: C.text }}>
            Testez le générateur en live
          </h2>
          <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: C.muted }}>
            Décrivez votre produit en quelques mots — on rédige la fiche à votre place.
          </p>
          {isHydrated && (
            <div className="mt-4 inline-flex items-center gap-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: isLimitReached ? '#FFE0D5' : C.sagePale, color: isLimitReached ? C.terra : C.sage }}>
                {isLimitReached ? 'Limite atteinte (5/5)' : `${creditsRemaining}/5 générations restantes`}
              </span>
            </div>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="max-w-5xl mx-auto rounded-2xl border p-6 md:p-8 shadow-sm" style={{ background: C.surface, borderColor: C.border }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="rounded-xl border shadow-sm" style={{ background: C.bg, borderColor: C.border }}>
                <div className="p-6 pb-0">
                  <p className="text-lg font-bold leading-none" style={{ color: C.text }}>Informations Produit</p>
                  <p className="text-sm mt-1.5" style={{ color: C.muted }}>
                    Remplissez les infos essentielles, on s&apos;occupe du reste.
                  </p>
                </div>
                <div className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                      {/* Mode toggle */}
                      <FormField
                        control={form.control}
                        name="productMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: C.text }} className="font-medium">Mode de génération</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { val: 'mon-produit',   icon: <PenLine className="h-4 w-4" />, label: 'Mon produit' },
                                { val: 'marque-connue', icon: <Globe className="h-4 w-4" />, label: 'Marque connue' },
                              ].map(({ val, icon, label }) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => field.onChange(val)}
                                  className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-all"
                                  style={field.value === val
                                    ? { borderColor: C.terra, background: `${C.terra}15`, color: C.terra }
                                    : { borderColor: C.border, color: C.muted }}
                                >
                                  {icon}{label}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs mt-1.5" style={{ color: C.muted }}>
                              {isMonProduit
                                ? "Décrivez votre produit — on crée la fiche à partir de vos infos."
                                : "L'agent recherche automatiquement le produit en ligne."}
                            </p>
                          </FormItem>
                        )}
                      />

                      {/* Nom du produit */}
                      <FormField control={form.control} name="productName" render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: C.text }} className="font-medium">Nom du produit</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: Bougie à la lavande" {...field} autoComplete="off"
                              className="bg-[#FAF6F0] border-[#E5DDD4] text-[#2E2018] placeholder:text-[#7A6D62]/50 focus-visible:ring-[#D4704A]/30"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )} />

                      {/* Marque */}
                      <FormField control={form.control} name="brand" render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: C.text }} className="font-medium">
                            {isMonProduit ? 'Nom de votre marque (optionnel)' : 'Marque'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={isMonProduit ? 'ex: Ma Boutique, ou laisser vide' : 'ex: Lancôme'}
                              {...field} value={field.value ?? ''} autoComplete="off"
                              className="bg-[#FAF6F0] border-[#E5DDD4] text-[#2E2018] placeholder:text-[#7A6D62]/50 focus-visible:ring-[#D4704A]/30"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )} />

                      {/* Description libre */}
                      {isMonProduit && (
                        <FormField control={form.control} name="productDescription" render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: C.text }} className="font-medium">Description de votre produit</FormLabel>
                            <FormControl>
                              <Textarea rows={4}
                                placeholder="Ex: Bougie 150g à la vraie lavande de Provence. Faite main, 40h de combustion, sans colorants."
                                className="resize-none text-sm bg-[#FAF6F0] border-[#E5DDD4] text-[#2E2018] placeholder:text-[#7A6D62]/50 focus-visible:ring-[#D4704A]/30"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs mt-1" style={{ color: C.muted }}>
                              Plus vous décrivez, meilleure est la fiche.
                            </p>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )} />
                      )}

                      {/* Certifications */}
                      {isMonProduit && (
                        <FormField control={form.control} name="certifications" render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: C.text }} className="font-medium">Labels &amp; certifications</FormLabel>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {CERTIFICATIONS.map((cert) => {
                                const checked = (field.value ?? []).includes(cert.id);
                                return (
                                  <div key={cert.id} className="flex items-center gap-2">
                                    <Checkbox id={`trial-${cert.id}`} checked={checked}
                                      onCheckedChange={(val) => {
                                        const current = field.value ?? [];
                                        field.onChange(val ? [...current, cert.id] : current.filter((v: string) => v !== cert.id));
                                      }}
                                    />
                                    <label htmlFor={`trial-${cert.id}`} className="text-xs cursor-pointer leading-none" style={{ color: C.muted }}>
                                      {cert.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )} />
                      )}

                      {/* Catégorie */}
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: C.text }} className="font-medium">Type de Produit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-[#FAF6F0] border-[#E5DDD4] text-[#2E2018]">
                                <SelectValue placeholder="Sélectionner le type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#FDF9F5] border-[#E5DDD4] text-[#2E2018]">
                              {['Parfum','Soin','Cosmétique',"parfum d'intérieur",'Sport','Habillement','Maison','Autres'].map(v => (
                                <SelectItem key={v} value={v} className="text-[#2E2018] focus:bg-[#F3ECE4]">
                                  {v === "parfum d'intérieur" ? "Parfum d'intérieur" : v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )} />

                      {/* Submit */}
                      {step === 'generating' ? (
                        <button type="button" disabled className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 opacity-70" style={{ background: C.terra }}>
                          <Loader2 className="h-4 w-4 animate-spin" /> Génération en cours...
                        </button>
                      ) : isLimitReached ? (
                        <button type="button" onClick={() => setShowUpsell(true)} className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5" style={{ background: C.terra }}>
                          <Rocket className="h-4 w-4" /> Débloquer plus de crédits
                        </button>
                      ) : (
                        <button type="submit" disabled={!isHydrated} className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50" style={{ background: C.terra, boxShadow: `0 4px 16px ${C.terra}40` }}>
                          <Sparkles className="h-4 w-4" /> Générer ma fiche gratuite
                        </button>
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
              {/* Generating */}
              {step === 'generating' && (
                <div className="h-full rounded-xl border shadow-sm" style={{ background: C.bg, borderColor: C.border }}>
                  <div className="p-6 pb-0">
                    <p className="text-lg font-bold" style={{ color: C.text }}>On rédige votre fiche...</p>
                    <p className="text-sm mt-1" style={{ color: C.muted }}>Votre fiche produit SEO est en cours de rédaction.</p>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-6 py-10 px-6">
                    <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                      <NextImage src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544330/Gemini_Generated_Image_7bnxii7bnxii7bnx-removebg-preview_xfcumj.png" alt="Woosenteur génère votre fiche" width={90} height={90} style={{ width: 90, height: 'auto' }} className="drop-shadow-lg" />
                    </motion.div>
                    <span className="text-base font-medium text-center" style={{ color: C.terra }}>{progressMessage}</span>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ background: C.terra }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {step === 'preview' && generatedProduct && (
                <div ref={resultRef} className="space-y-4">
                  <div className="rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: C.border }}>
                    {/* Browser bar */}
                    <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ background: C.text, borderColor: '#3D2E22' }}>
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400/70" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                        <span className="w-3 h-3 rounded-full bg-green-400/70" />
                      </div>
                      <div className="flex-1 rounded px-3 py-1 flex items-center gap-2 text-xs ml-2" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                        <LinkIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">votre-boutique.fr/produit/{generatedProduct.seo?.slug || 'votre-produit'}</span>
                      </div>
                    </div>

                    {/* WooCommerce mock — fond blanc intentionnel */}
                    <div className="bg-white p-5 space-y-4 max-h-[520px] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300">
                          <ImageIcon className="h-10 w-10 text-gray-300" />
                          <span className="text-xs text-gray-400 mt-2">Photo produit</span>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">{generatedProduct.brand || 'Votre marque'} › {generatedProduct.productType}</p>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{generatedProduct.seo?.productTitle}</h3>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                            <span className="text-xs text-gray-500 ml-1">(12 avis)</span>
                          </div>
                          <p className="text-xl font-bold" style={{ color: C.terra }}>XX,XX €</p>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{generatedProduct.seo?.shortDescription}</p>
                          <div className="flex-1 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 opacity-70 cursor-default text-white" style={{ background: C.terra }}>
                            <ShoppingCart className="h-3.5 w-3.5" /> Ajouter au panier
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex gap-4 mb-3">
                          <span className="text-xs font-semibold pb-1 border-b-2" style={{ borderColor: C.terra, color: C.terra }}>Description</span>
                          <span className="text-xs text-gray-400 pb-1">Informations</span>
                        </div>
                        <div className="prose prose-xs max-w-none text-gray-600 text-xs leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: generatedProduct.seo?.longDescription || '' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button onClick={handleDownloadCsv} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-medium text-sm transition-colors hover:bg-[#F3ECE4]" style={{ borderColor: C.border, color: C.text }}>
                      <Download className="h-4 w-4" /> Télécharger CSV
                    </button>
                    <Link href="/signup" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-white transition-all hover:-translate-y-0.5" style={{ background: C.sage }}>
                      <ShoppingCart className="h-4 w-4" /> Publier sur WooCommerce
                    </Link>
                    <button onClick={handleNewGeneration} disabled={isLimitReached} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-40" style={{ background: C.terra }}>
                      <Sparkles className="h-4 w-4" /> Nouvelle fiche
                    </button>
                  </div>

                  {isLimitReached && (
                    <div className="p-4 rounded-xl border" style={{ background: '#FFF3EE', borderColor: `${C.terra}30` }}>
                      <p className="text-sm font-semibold" style={{ color: C.terra }}>Limite atteinte</p>
                      <p className="text-sm mt-1" style={{ color: C.muted }}>Vous avez utilisé vos 5 fiches gratuites. Passez à un plan payant pour continuer.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Idle placeholder */}
              {step === 'form' && !generatedProduct && (
                <div className="h-full flex flex-col items-center justify-center min-h-[400px] rounded-xl border-2 border-dashed p-8 text-center" style={{ background: C.bg, borderColor: C.border }}>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <NextImage src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544330/Gemini_Generated_Image_7bnxii7bnxii7bnx-removebg-preview_xfcumj.png" alt="Woody mascotte Woosenteur" width={90} height={90} style={{ width: 90, height: 'auto' }} className="drop-shadow-md" />
                  </motion.div>
                  <h3 className="mt-4 font-semibold text-lg" style={{ color: C.text }}>La fiche produit apparaîtra ici</h3>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>Remplissez le formulaire et lancez la génération.</p>
                  <div className="mt-4 rounded-2xl px-4 py-2.5 border text-xs font-medium flex items-center gap-1.5" style={{ background: C.sagePale, borderColor: `${C.sage}30`, color: C.sage }}>
                    <WoodyEmoji mood="confused" size={20} />
                    Plus vous décrivez, meilleure est la fiche !
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Teaser dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border p-6 md:p-8" style={{ background: C.sagePale, borderColor: `${C.sage}30` }}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutDashboard className="h-5 w-5" style={{ color: C.sage }} />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ color: C.sage }}>Dans votre espace</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: C.text }}>
                  Ce générateur, c&apos;est l&apos;aperçu.
                </h3>
                <p className="text-base" style={{ color: C.muted }}>
                  Fiches illimitées, publication directe sur votre boutique, historique complet et exports.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                {[
                  { icon: <Layers className="h-4 w-4" />, label: 'Fiches illimitées', sub: 'Tous vos produits' },
                  { icon: <ImagePlus className="h-4 w-4" />, label: 'Visuels réseaux sociaux', sub: 'Instagram, TikTok, Facebook' },
                  { icon: <Zap className="h-4 w-4" />, label: 'Export WooCommerce/Shopify', sub: 'En un clic' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5 border shadow-sm" style={{ background: C.surface, borderColor: C.border }}>
                    <span style={{ color: C.sage }}>{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold leading-tight" style={{ color: C.text }}>{f.label}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-5 border-t" style={{ borderColor: `${C.sage}25` }}>
              <Link href="/signup" className="inline-flex items-center gap-2 py-3 px-7 rounded-xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5 shadow-sm" style={{ background: C.terra }}>
                <Rocket className="h-4 w-4" /> Accéder à mon espace — Gratuit
              </Link>
              <p className="text-sm" style={{ color: C.muted }}>5 fiches offertes · Sans carte bancaire</p>
            </div>
          </div>
        </motion.div>

      </div>

      <UpsellModal open={showUpsell} onClose={() => setShowUpsell(false)} creditsUsed={creditsUsed} />
    </section>
  );
}
