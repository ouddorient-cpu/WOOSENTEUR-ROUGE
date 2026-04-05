
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Upload, Bot, FileText, AlertCircle, Image as ImageIcon, Download, UploadCloud, Rocket, ShieldCheck, Globe, PenLine, CheckCircle2, ExternalLink } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { generateSeoOptimizedProductDescription } from '@/ai/flows/generate-seo-optimized-product-description';
import { saveProduct, decrementCredits, uploadProductImage } from '@/lib/firebase-helpers';
import { useDoc } from '@/firebase';
import type { Product as ProductType, UserProfile } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { publishToWooCommerce } from '@/ai/flows/publish-to-woocommerce';
import { validateProductImage } from '@/ai/tools/image-validator-tool';
import { generateProductCsv, type CsvFormat } from '@/ai/flows/generate-csv-flow';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from "@/components/ui/label";
import { LivePreview } from '@/components/dashboard/live-preview';

const CERTIFICATIONS = [
  { id: 'bio', label: 'Bio / Organic' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'cruelty-free', label: 'Cruelty-Free' },
  { id: 'made-in-france', label: 'Made in France' },
  { id: 'sans-paraben', label: 'Sans Parabène' },
  { id: 'naturel', label: 'Naturel / Clean' },
  { id: 'eco', label: 'Éco-responsable' },
];

const productSchema = z.object({
  productName: z.string().min(2, { message: 'Le nom du produit doit contenir au moins 2 caractères.' }),
  productMode: z.enum(['marque-connue', 'mon-produit']).default('marque-connue'),
  brand: z.string().optional(),
  category: z.enum(['Parfum', 'Soin', 'Cosmétique', "parfum d'intérieur", 'Sport', 'Habillement', 'Maison', 'Autres'], {
    required_error: 'Veuillez sélectionner un type de produit.',
  }),
  weight: z.string().min(1, { message: 'Le poids est requis pour la livraison.' }),
  price: z.string().min(1, { message: 'Le prix est requis.' }),
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

type ProductFormValues = z.infer<typeof productSchema>;

type GenerationStep = 'form' | 'generating' | 'preview' | 'export' | 'uploading' | 'error';
type ExportPlatform = 'woocommerce' | 'shopify';

// Props for FormColumn
interface FormColumnProps {
  form: any; // react-hook-form's form object
  onSubmit: (data: ProductFormValues) => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

const FormColumn: React.FC<FormColumnProps> = ({ form, onSubmit, isGenerating, canGenerate }) => {
  const productMode = form.watch('productMode');
  const isMonProduit = productMode === 'mon-produit';

  return (
    <Card className="studio-card">
      <CardHeader>
        <CardTitle className="text-gradient">1. Informations Produit</CardTitle>
        <CardDescription>Remplissez les informations essentielles, notre agent s'occupe du reste.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
                      ? 'Décrivez votre produit — l\'IA crée la fiche à partir de vos infos.'
                      : 'L\'agent recherche automatiquement le produit en ligne.'}
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
                    <Input
                      placeholder="ex: La Vie Est Belle"
                      {...field}
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                    />
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
                  <FormLabel>{isMonProduit ? 'Nom de votre marque (optionnel)' : 'Marque'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isMonProduit ? 'ex: Ma marque, ou laisser vide' : 'ex: Lancôme'}
                      {...field}
                      value={field.value ?? ''}
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description libre — visible uniquement en mode "Mon produit" */}
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
                      Composition, bénéfices, usage, histoire… Plus vous en dites, meilleure est la fiche.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Certifications — visible uniquement en mode "Mon produit" */}
            {isMonProduit && (
              <FormField
                control={form.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labels & certifications</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {CERTIFICATIONS.map((cert) => {
                        const checked = (field.value ?? []).includes(cert.id);
                        return (
                          <div key={cert.id} className="flex items-center gap-2">
                            <Checkbox
                              id={cert.id}
                              checked={checked}
                              onCheckedChange={(val) => {
                                const current = field.value ?? [];
                                field.onChange(
                                  val ? [...current, cert.id] : current.filter((v: string) => v !== cert.id)
                                );
                              }}
                            />
                            <label htmlFor={cert.id} className="text-xs cursor-pointer leading-none">
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
                      <SelectItem value="parfum d'intérieur">Parfum d'intérieur</SelectItem>
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

            {/* Poids / Prix */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poids (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ex: 250" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Poids du colis en grammes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix de vente (€)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ex: 99.90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isGenerating && !canGenerate} size="lg" className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer la Fiche Produit
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const UploadingPreview: React.FC<{ progress: number; progressMessage: string; imageUrl?: string; }> = ({ progress, progressMessage, imageUrl }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-gradient">{progressMessage}</CardTitle>
      <CardDescription>Veuillez patienter pendant le traitement de votre image.</CardDescription>
    </CardHeader>
    <CardContent className="relative flex flex-col items-center justify-center gap-4 text-center">
      {imageUrl ? (
        <div className="relative group w-full max-w-sm">
          <Image
            alt={'produit'}
            className="rounded-lg object-cover w-full aspect-square opacity-50"
            height={400}
            src={imageUrl}
            width={400}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg w-full">
          <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
        </div>
      )}
    </CardContent>
  </Card>
);

interface ResultColumnProps {
  step: GenerationStep;
  progress: number;
  progressMessage: string;
  generationError: string | null;
  generatedProduct: Partial<ProductType> | null;
  userProfile: UserProfile | null;
  isUploading: boolean;
  isPublishing: boolean;
  publishStep: 'idle' | 'connecting' | 'sending' | 'success' | 'error';
  exportPlatform: ExportPlatform;
  setExportPlatform: (platform: ExportPlatform) => void;
  csvFormat: CsvFormat;
  setCsvFormat: (format: CsvFormat) => void;
  externalImageUrl: string;
  setExternalImageUrl: (url: string) => void;
  resultColumnRef: React.RefObject<HTMLDivElement>;
  exportCardRef: React.RefObject<HTMLDivElement>;
  triggerFileInput: () => void;
  handlePublish: () => void;
  handleDownloadCsv: () => void;
  publishedProductUrl: string | null;
}

const ResultColumn: React.FC<ResultColumnProps> = ({
  step,
  progress,
  progressMessage,
  generationError,
  generatedProduct,
  userProfile,
  isUploading,
  isPublishing,
  publishStep,
  exportPlatform,
  setExportPlatform,
  csvFormat,
  setCsvFormat,
  externalImageUrl,
  setExternalImageUrl,
  resultColumnRef,
  exportCardRef,
  triggerFileInput,
  handlePublish,
  handleDownloadCsv,
  publishedProductUrl,
}) => {
  if (step === 'generating' || step === 'error') {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-gradient">Woody est au travail !</CardTitle>
          <CardDescription>Notre agent IA rédige votre fiche produit SEO.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-full gap-6">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/mascotte woosenteur.png"
              alt="Woosenteur génère votre fiche"
              width={90}
              height={90}
              className="drop-shadow-lg"
              style={{ animation: 'mascotteBounce 1.2s ease-in-out infinite' }}
            />
            <style>{`@keyframes mascotteBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>
            <span className="text-base font-medium text-primary text-center">{progressMessage}</span>
          </div>
          <Progress
            value={progress}
            className="w-full"
            data-state={progress === 100 ? 'completed' : 'loading'}
          />

          {generationError && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Une erreur est survenue</AlertTitle>
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'uploading') {
    return <UploadingPreview progress={progress} progressMessage={progressMessage} imageUrl={generatedProduct?.imageUrl} />;
  }

  if (step === 'preview' || step === 'export') {
    const canPublish = !!userProfile?.wooCommerce?.storeUrl;
    return (
      <div ref={resultColumnRef} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gradient">3. Image du produit</CardTitle>
            <CardDescription>Une image de haute qualité est essentielle. Notre IA validera votre choix.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
            {generatedProduct?.imageUrl ? (
              <div className="relative group w-full max-w-sm">
                <Image
                  alt={generatedProduct?.name || 'produit'}
                  className="rounded-lg object-cover w-full aspect-square group-hover:opacity-75 transition-opacity"
                  height={400}
                  src={generatedProduct.imageUrl}
                  width={400}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                  <Button onClick={triggerFileInput} disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Changer l'image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg w-full">
                <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <Button onClick={triggerFileInput} size="lg" disabled={isUploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Téléverser votre image
                </Button>
                <p className="text-sm text-muted-foreground mt-2">depuis votre appareil</p>
              </div>
            )}
            <div className="w-full max-w-sm mt-4 pt-4 border-t">
              <Label htmlFor="externalImageUrl" className="text-sm font-medium text-left block mb-2">
                Ou collez une URL d'image (Cloudinary, etc.)
              </Label>
              <Input
                id="externalImageUrl"
                type="url"
                placeholder="https://res.cloudinary.com/..."
                value={externalImageUrl}
                onChange={(e) => setExternalImageUrl(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1 text-left">
                Cette URL sera utilisée dans le CSV au lieu de l'image uploadée.
              </p>
            </div>
          </CardContent>
        </Card>

        {(step === 'preview' || step === 'export') && (
          <Card ref={exportCardRef}>
            <CardHeader>
              <CardTitle className="text-gradient">4. Export</CardTitle>
              <CardDescription>Choisissez une plateforme et un format, puis exportez votre fiche produit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Plateforme de publication</Label>
                <RadioGroup
                  value={exportPlatform}
                  onValueChange={(value) => {
                    const p = value as ExportPlatform;
                    setExportPlatform(p);
                    setCsvFormat(p === 'shopify' ? 'shopify' : 'woocommerce-fr');
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="woocommerce" id="woocommerce" className="peer sr-only" />
                    <Label
                      htmlFor="woocommerce"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      WooCommerce
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="shopify" id="shopify" className="peer sr-only" />
                    <Label
                      htmlFor="shopify"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      Shopify
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Format CSV</Label>
                {exportPlatform === 'shopify' ? (
                  <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground flex items-center gap-2">
                    <span className="font-medium">Shopify CSV</span>
                    <span className="text-xs text-muted-foreground">— Format officiel Shopify Products Import</span>
                  </div>
                ) : (
                  <Select value={csvFormat} onValueChange={(value) => setCsvFormat(value as CsvFormat)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le format..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="woocommerce-fr">🇫🇷 WooCommerce FR (recommandé)</SelectItem>
                      <SelectItem value="woocommerce-en">🇬🇧 WooCommerce EN (international)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {csvFormat === 'woocommerce-fr' && "👉 WooCommerce Admin → Produits → Importer → glissez ce fichier CSV"}
                  {csvFormat === 'woocommerce-en' && "👉 WooCommerce Admin → Products → Import → upload this CSV file"}
                  {csvFormat === 'shopify' && "👉 Shopify Admin → Produits → Importer → glissez ce fichier CSV"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button size="lg" variant="outline" onClick={handleDownloadCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le CSV
                </Button>
                <Button
                  size="lg"
                  onClick={handlePublish}
                  disabled={isPublishing || (exportPlatform === 'woocommerce' && !canPublish) || (exportPlatform === 'shopify')}
                  className={publishStep === 'success' ? 'bg-green-600 hover:bg-green-700' : publishStep === 'error' ? 'bg-destructive hover:bg-destructive/90' : ''}
                >
                  {isPublishing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : publishStep === 'success' ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : (
                    <UploadCloud className="mr-2 h-4 w-4" />
                  )}
                  {exportPlatform === 'shopify'
                    ? 'Publication directe (bientôt)'
                    : publishStep === 'connecting' ? 'Connexion à WooCommerce...'
                    : publishStep === 'sending' ? 'Envoi du produit...'
                    : publishStep === 'success' ? 'Publié sur votre boutique !'
                    : publishStep === 'error' ? 'Échec — réessayer'
                    : 'Publier sur ma boutique WooCommerce'}
                </Button>
                {(() => {
                  const targetUrl = publishedProductUrl || (() => {
                    const base = userProfile?.wooCommerce?.storeUrl?.replace(/\/$/, '');
                    const slug = generatedProduct?.seo?.slug;
                    return base && slug ? `${base}/produit/${slug}` : null;
                  })();
                  return (
                    <Button
                      size="lg"
                      variant={publishStep === 'success' ? 'default' : 'secondary'}
                      disabled={!targetUrl}
                      onClick={() => targetUrl && window.open(targetUrl, '_blank')}
                      className={publishStep === 'success' ? 'animate-pulse bg-green-600 hover:bg-green-700 hover:animate-none' : ''}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {publishStep === 'success' ? 'Voir sur ma boutique ✨' : 'Voir ma boutique'}
                    </Button>
                  );
                })()}
              </div>

              {/* Barre de progression publication */}
              {isPublishing && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className={publishStep === 'connecting' ? 'text-primary font-medium' : ''}>
                      {publishStep === 'connecting' ? '⏳' : '✅'} Connexion à WooCommerce
                    </span>
                    <span className={publishStep === 'sending' ? 'text-primary font-medium' : ''}>
                      {publishStep === 'sending' ? '⏳' : publishStep === 'success' ? '✅' : '○'} Envoi du produit
                    </span>
                    <span className={publishStep === 'success' ? 'text-green-600 font-medium' : 'text-muted-foreground/50'}>
                      {publishStep === 'success' ? '✅' : '○'} Publié en ligne
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: publishStep === 'connecting' ? '33%' : publishStep === 'sending' ? '66%' : '100%' }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            {exportPlatform === 'woocommerce' && !canPublish && (
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>WooCommerce non connecté</AlertTitle>
                  <AlertDescription>
                    Pour publier directement, veuillez <Link href="/dashboard/profile" className="underline font-bold">configurer vos clés API WooCommerce</Link> dans votre profil.
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
            {exportPlatform === 'shopify' && (
              <CardContent>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Comment importer dans Shopify</AlertTitle>
                  <AlertDescription className="space-y-1">
                    <span className="block">1. Cliquez <strong>Exporter en CSV</strong> ci-dessus pour télécharger votre fiche produit.</span>
                    <span className="block">2. Dans Shopify Admin → <strong>Produits</strong> → <strong>Importer</strong> → glissez le fichier CSV.</span>
                    <span className="block text-xs opacity-70 mt-1">La publication directe via API Shopify est en développement.</span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    );
  }

  // Placeholder for the result column
  return (
    <Card className="h-full flex flex-col items-center justify-center bg-muted/50 border-dashed">
      <CardContent className="text-center">
        <div className="p-6 rounded-full bg-background/50 inline-block mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="font-headline text-xl font-semibold text-muted-foreground">La fiche produit générée apparaîtra ici</h3>
        <p className="text-muted-foreground mt-2">Remplissez le formulaire et lancez la génération.</p>
      </CardContent>
    </Card>
  );
};


export default function GeneratePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<GenerationStep>('form');
  const [progress, setProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('Woody prépare votre fiche...');

  const [generatedProduct, setGeneratedProduct] = useState<Partial<ProductType> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState<'idle' | 'connecting' | 'sending' | 'success' | 'error'>('idle');
  const [publishedProductUrl, setPublishedProductUrl] = useState<string | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [imageChangedAfterValidation, setImageChangedAfterValidation] = useState(false);
  const [exportPlatform, setExportPlatform] = useState<ExportPlatform>('woocommerce');
  const [csvFormat, setCsvFormat] = useState<CsvFormat>('woocommerce-fr');
  const [externalImageUrl, setExternalImageUrl] = useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const resultColumnRef = React.useRef<HTMLDivElement>(null);
  const exportCardRef = React.useRef<HTMLDivElement>(null);

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      productMode: 'marque-connue',
      brand: '',
      weight: '',
      price: '',
      productDescription: '',
      certifications: [],
    }
  });

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'generating' && progress < 90) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, 200); // Vitesse de la progression
    }
    return () => {
      clearInterval(timer);
    };
  }, [step, progress]);

  useEffect(() => {
    if (step === 'preview' && resultColumnRef.current) {
      resultColumnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  const isLoading = userLoading || profileLoading;
  const isSuperAdmin = !!(userProfile?.isUnlimited || userProfile?.role === 'superadmin');
  const hasSufficientCredits = !!(userProfile && (userProfile.creditBalance ?? 0) > 0);
  const canGenerate = isSuperAdmin || hasSufficientCredits;
  const isGenerating = step === 'generating' || isUploading;

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !generatedProduct?.id) return;

    setStep('uploading');
    setIsUploading(true);
    setProgress(0);
    setProgressMessage("Analyse de l'image par l'IA...");
    if (step === 'export') {
      setImageChangedAfterValidation(true);
      setStep('preview');
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUri = reader.result as string;

      // Optimistic UI update for immediate preview
      setGeneratedProduct(prev => (prev ? { ...prev, imageUrl: imageDataUri } : null));

      try {
        const validationResult = await validateProductImage({ imageDataUri });
        setProgress(30);
        setProgressMessage("Validation de l'esthétique...");

        if (validationResult.confidenceScore < 60) {
          toast({
            variant: 'warning',
            title: `Image à améliorer (Score: ${validationResult.confidenceScore})`,
            description: validationResult.feedback,
            duration: 8000,
          });
          setIsUploading(false);
          setStep('preview');
          return;
        }

        toast({
          variant: 'success',
          title: 'Image validée !',
          description: `Score de confiance: ${validationResult.confidenceScore}%. ${validationResult.feedback}`,
        });

        setStep('export');
        setImageChangedAfterValidation(false); // Reset on success
        setTimeout(() => {
          exportCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);

        setProgressMessage("Téléchargement de l'image validée...");
        const firebaseImageUrl = await uploadProductImage(user.uid, generatedProduct.id!, file, {
          onProgress: (p) => setProgress(30 + p * 0.7),
        });

        // Update local state with Firebase Storage URL for CSV export
        setGeneratedProduct(prev => (prev ? { ...prev, imageUrl: firebaseImageUrl } : null));

        // This part runs only after uploadProductImage promise resolves
        toast({ title: 'Téléversement terminé !', description: 'La nouvelle image a été sauvegardée.' });
        setIsUploading(false);
        setProgress(100);

      } catch (error: any) {
        console.error('Error during image validation or upload:', error);
        toast({
          variant: 'destructive',
          title: "Erreur d'analyse ou de téléversement",
          description: error.message || "L'opération a échoué. Veuillez réessayer.",
        });
        setIsUploading(false);
        setStep('preview');
      }
    };
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de lire le fichier image.' });
      setIsUploading(false);
      setStep('preview');
    };
  }, [user, generatedProduct, toast, step]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePublish = useCallback(async () => {
    if (!generatedProduct || !userProfile?.wooCommerce) return;

    if (imageChangedAfterValidation) {
      toast({
        variant: 'warning',
        title: 'Validation requise',
        description: 'Veuillez re-valider la nouvelle image avant de publier.',
      });
      return;
    }

    setIsPublishing(true);
    setPublishStep('connecting');

    try {
      await new Promise(r => setTimeout(r, 800));
      setPublishStep('sending');

      const result = await publishToWooCommerce({
        product: generatedProduct,
        credentials: userProfile.wooCommerce,
      });

      setPublishStep('success');
      setPublishedProductUrl(result.productUrl || null);
      toast({
        variant: 'success',
        title: '✅ Produit publié sur votre boutique !',
        description: result.message,
        action: (
          <a href={result.productUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Voir le produit
          </a>
        ),
      });
      setTimeout(() => setPublishStep('idle'), 4000);
    } catch (error: any) {
      console.error("Erreur lors de la publication sur WooCommerce:", error);
      setPublishStep('error');
      toast({
        variant: "destructive",
        title: "La publication a échoué",
        description: error.message || "Impossible de publier. Vérifiez vos clés API WooCommerce dans votre profil.",
      });
      setTimeout(() => setPublishStep('idle'), 4000);
    } finally {
      setIsPublishing(false);
    }
  }, [generatedProduct, userProfile, toast, imageChangedAfterValidation]);

  const handleDownloadCsv = useCallback(async () => {
    if (!generatedProduct) return;
    try {
      // Use external URL if provided, otherwise use the product's imageUrl
      const productWithImage = externalImageUrl.trim()
        ? { ...generatedProduct, imageUrl: externalImageUrl.trim() }
        : generatedProduct;
      const result = await generateProductCsv({ product: productWithImage, format: csvFormat });
      const { csvData, imageUploaded, imageUploadError } = result;

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const formatSuffix = csvFormat === 'shopify' ? '-shopify' : csvFormat === 'woocommerce-en' ? '-woo-en' : '';
      const fileName = generatedProduct.seo?.slug ? `${generatedProduct.seo.slug}${formatSuffix}.csv` : `product${formatSuffix}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show appropriate message based on image upload status
      if (externalImageUrl.trim()) {
        toast({
          variant: 'success',
          title: 'Export réussi avec votre URL !',
          description: `CSV téléchargé avec votre URL d'image externe.`
        });
      } else if (imageUploaded) {
        toast({
          variant: 'success',
          title: 'Export réussi avec image !',
          description: `CSV téléchargé. L'image a été uploadée automatiquement et sera importée dans WooCommerce.`
        });
      } else if (imageUploadError) {
        toast({
          variant: 'warning',
          title: 'CSV téléchargé (sans image)',
          description: imageUploadError
        });
      } else {
        toast({ title: 'Téléchargement réussi', description: `Fichier CSV (${csvFormat}) téléchargé.` });
      }
    } catch (error: any) {
      console.error("CSV Generation error:", error);
      toast({ variant: 'destructive', title: 'Erreur CSV', description: "Impossible de générer le fichier CSV." });
    }
  }, [generatedProduct, csvFormat, externalImageUrl, toast]);

  const onSubmit = useCallback(async (data: ProductFormValues) => {
    if (!user) return;
    if (!canGenerate) {
      setShowUpgradePopup(true);
      return;
    }

    setStep('generating');
    setGenerationError(null);
    setGeneratedProduct(null);
    setProgress(0);
    setProgressMessage('Woody prépare votre fiche...');

    try {
      await decrementCredits(user.uid);

      setProgressMessage(
        data.productMode === 'mon-produit'
          ? "Woody lit votre description produit..."
          : "Woody part chercher les infos sur votre produit..."
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
      setProgressMessage("Woody sauvegarde votre fiche... ✨");

      const newProductData: any = {
        name: data.productName,
        brand: data.brand,
        productType: data.category,
        weight: data.weight,
        userId: user.uid,
        seo: seoData,
      };

      if (data.price) {
        newProductData.price = parseFloat(data.price);
      }

      const newProductId = await saveProduct(user.uid, newProductData);

      setProgress(100);
      toast({
        variant: 'success',
        title: 'Fiche produit générée !',
        description: 'Votre fiche a été créée avec succès.',
      });
      setGeneratedProduct({
        id: newProductId,
        ...newProductData,
      });
      setStep('preview');
      form.reset(); // Reset the form here

    } catch (error: any) {
      console.error("Erreur lors de la génération de la fiche produit:", error);
      let errorMessage = error.message || "La génération de la fiche produit a échoué. Veuillez réessayer.";

      if (errorMessage.includes('API key expired') || errorMessage.includes('API key not valid')) {
        errorMessage = "Votre clé API pour le service IA a expiré ou est invalide. Veuillez la renouveler dans Google AI Studio, mettre à jour votre fichier .env, puis redémarrer le serveur de développement.";
      }

      setGenerationError(errorMessage);
      setStep('error');
    }
  }, [user, canGenerate, form, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const UpgradePopup = () => (
    <AlertDialog open={showUpgradePopup} onOpenChange={setShowUpgradePopup}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Crédits épuisés !</AlertDialogTitle>
          <AlertDialogDescription>
            Vous avez utilisé tous vos crédits. Pour continuer à générer des fiches produits, veuillez passer à un plan supérieur.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/pricing" className="bg-primary hover:bg-primary/90">
              <Rocket className="mr-2 h-4 w-4" />
              Voir les plans
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );


  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
              <Bot className="mr-2 h-3 w-3" /> Studio Créatif v2
            </Badge>
            <h1 className="font-headline text-3xl font-bold text-gradient">Création de Produit</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Mode Agent IA Actif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Form (3/12) */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <FormColumn form={form} onSubmit={onSubmit} isGenerating={isGenerating} canGenerate={canGenerate} />
          </div>

          {/* Center Panel: Live Preview (6/12) */}
          <div className="lg:col-span-6 h-[calc(100vh-200px)] min-h-[600px] lg:sticky lg:top-24">
            <LivePreview
              product={generatedProduct}
              isGenerating={step === 'generating'}
              progress={progress}
            />
          </div>

          {/* Right Panel: Actions & Export (3/12) */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <ResultColumn
              step={step}
              progress={progress}
              progressMessage={progressMessage}
              generationError={generationError}
              generatedProduct={generatedProduct}
              userProfile={userProfile}
              isUploading={isUploading}
              isPublishing={isPublishing}
              publishStep={publishStep}
              exportPlatform={exportPlatform}
              setExportPlatform={setExportPlatform}
              csvFormat={csvFormat}
              setCsvFormat={setCsvFormat}
              externalImageUrl={externalImageUrl}
              setExternalImageUrl={setExternalImageUrl}
              resultColumnRef={resultColumnRef}
              exportCardRef={exportCardRef}
              triggerFileInput={triggerFileInput}
              handlePublish={handlePublish}
              handleDownloadCsv={handleDownloadCsv}
              publishedProductUrl={publishedProductUrl}
            />
          </div>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        aria-label="Charger l'image du produit"
      />
      <UpgradePopup />
    </>
  );
}
