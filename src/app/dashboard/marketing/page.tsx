'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Megaphone, Sparkles, Download, Copy, Check, ImageIcon, RefreshCw, Upload, Scan, X, Share2, Flame, Palette, BarChart2, Zap } from 'lucide-react';
import { useDoc } from '@/firebase';
import type { Product, UserProfile, MarketingCampaign, MarketingStyle, MarketingFormat, MarketingGeneration } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { getProducts, saveCampaign, updateCampaign, decrementCreditsBy } from '@/lib/firebase-helpers';
import { generateMarketingContent } from '@/ai/flows/generate-marketing-content';
import { generateAdImage, generateAdImageVariants } from '@/ai/flows/generate-ad-image';
import { analyzeProductImage } from '@/ai/flows/analyze-product-image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import { createAdComposite, createDupeOverlay, createFacebookPostVisual, createFacebookPollVisual, createFacebookFlashVisual, createBeforeAfterCanvas } from '@/lib/canvas-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateDupeText } from '@/ai/flows/generate-dupe-text';
import type { DupeTextOutput } from '@/ai/flows/generate-dupe-text';
import { generateFacebookPosts, generateFacebookPoll, generateFacebookFlash } from '@/ai/flows/generate-facebook-content';
import type { FacebookPostOutput, FacebookPollOutput, FacebookFlashOutput } from '@/ai/flows/generate-facebook-content';

// Form validation schema
const marketingFormSchema = z.object({
  productId: z.string().optional(),
  message: z.string().min(10, { message: 'Le message doit contenir au moins 10 caractères.' }).max(200),
  style: z.enum(['luxe', 'clean', 'fun', 'science'] as const),
  ageRange: z.string().min(1, { message: 'Veuillez indiquer la tranche d\'âge.' }),
  gender: z.enum(['Femmes', 'Hommes', 'Tous'] as const),
  values: z.array(z.string()).min(1, { message: 'Sélectionnez au moins une valeur.' }),
  cta: z.string().min(1, { message: 'Veuillez choisir un CTA.' }),
  formats: z.array(z.string()).min(1, { message: 'Sélectionnez au moins un format.' }),
});

type MarketingFormValues = z.infer<typeof marketingFormSchema>;

type GenerationStep = 'form' | 'generating' | 'results';

// Style options with descriptions
const STYLE_OPTIONS: { value: MarketingStyle; label: string; description: string; emoji: string }[] = [
  { value: 'luxe', label: 'Luxe', description: 'Élégant, sophistiqué, premium', emoji: '✨' },
  { value: 'clean', label: 'Clean', description: 'Naturel, authentique, pur', emoji: '🌿' },
  { value: 'fun', label: 'Fun', description: 'Énergique, playful, vibrant', emoji: '🎨' },
  { value: 'science', label: 'Science', description: 'Précis, technique, efficace', emoji: '🔬' },
];

// Audience values options
const VALUE_OPTIONS = [
  'Naturalité', 'Efficacité', 'Luxe', 'Innovation', 'Éthique', 'Accessibilité', 'Durabilité', 'Bien-être'
];

// CTA options
const CTA_OPTIONS = ['Découvrir', 'Acheter', 'En savoir plus', 'Essayer', 'Je craque', 'Commander'];

// Format options
const FORMAT_OPTIONS: { value: MarketingFormat; label: string }[] = [
  { value: 'instagram_post', label: 'Instagram Post (1080x1080)' },
  { value: 'instagram_story', label: 'Instagram Story (1080x1920)' },
  { value: 'facebook_ad', label: 'Facebook Ad (1200x628)' },
];

// Variant Card Component
interface VariantCardProps {
  variant: {
    variant: string;
    styleName: string;
    headline: string;
    body: string;
    cta: string;
    hashtags: string[];
    imageUrl?: string;
  };
  format: string;
  onCopyText: () => void;
  onDownloadImage: () => void;
  isDownloading?: boolean;
  uploadedProductImage?: string;
}

const VariantCard: React.FC<VariantCardProps> = ({ variant, format, onCopyText, onDownloadImage, isDownloading, uploadedProductImage }) => {
  const [copied, setCopied] = useState(false);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [isGeneratingComposite, setIsGeneratingComposite] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('original');
  const { toast } = useToast();

  // Use generated image if available, otherwise fall back to uploaded product image
  const displayImage = variant.imageUrl || uploadedProductImage || null;

  const handleCopy = () => {
    onCopyText();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateComposite = useCallback(async () => {
    if (!displayImage || isGeneratingComposite) return;

    setIsGeneratingComposite(true);
    try {
      const composite = await createAdComposite(displayImage, {
        headline: variant.headline,
        body: variant.body,
        cta: variant.cta,
        style: variant.styleName as 'luxe' | 'clean' | 'fun' | 'science',
        format: format as 'instagram_post' | 'instagram_story' | 'facebook_ad',
      });
      setCompositeImage(composite);
      setActiveTab('composite');
    } catch (error) {
      console.error('Error generating composite:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de générer la pub finale.',
      });
    } finally {
      setIsGeneratingComposite(false);
    }
  }, [variant, format, isGeneratingComposite, toast]);

  const downloadComposite = useCallback(async () => {
    if (!compositeImage) return;

    const a = document.createElement('a');
    a.href = compositeImage;
    a.download = `pub-finale-${variant.styleName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [compositeImage, variant.styleName]);

  // Social sharing
  const shareText = `${variant.headline}\n\n${variant.body}\n\n${variant.cta}\n\n${variant.hashtags.join(' ')}`;
  const encodedText = encodeURIComponent(shareText);
  const canNativeShare = typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator;

  const handleNativeShare = async () => {
    try {
      const shareData: ShareData = { title: variant.headline, text: shareText };
      await navigator.share(shareData);
    } catch (_) {
      // User cancelled or not supported
    }
  };

  const styleColors: Record<string, string> = {
    luxe: 'from-amber-500 to-yellow-600',
    clean: 'from-green-500 to-emerald-600',
    fun: 'from-pink-500 to-rose-600',
    science: 'from-blue-500 to-cyan-600',
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${styleColors[variant.styleName] || 'from-gray-500 to-gray-600'}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="capitalize">{variant.styleName}</Badge>
          <span className="text-sm text-muted-foreground">Variante {variant.variant}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayImage ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="original">
                {variant.imageUrl ? 'Image IA' : 'Mon produit'}
              </TabsTrigger>
              <TabsTrigger value="composite" disabled={!compositeImage && !isGeneratingComposite}>
                Pub finale
              </TabsTrigger>
            </TabsList>
            <TabsContent value="original" className="mt-0">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={displayImage}
                  alt={`Publicité ${variant.styleName}`}
                  fill
                  className="object-cover"
                  unoptimized={displayImage.startsWith('data:')}
                />
              </div>
              {!variant.imageUrl && uploadedProductImage && (
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Votre photo produit
                </p>
              )}
            </TabsContent>
            <TabsContent value="composite" className="mt-0">
              {compositeImage ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={compositeImage}
                    alt={`Pub finale ${variant.styleName}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Accroche</p>
            <p className="font-semibold">{variant.headline}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Texte</p>
            <p className="text-sm text-muted-foreground">{variant.body}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">CTA</p>
            <Badge>{variant.cta}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Hashtags</p>
            <p className="text-xs text-muted-foreground">{variant.hashtags.join(' ')}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copié!' : 'Texte'}
            </Button>
            {displayImage && (
              <Button variant="outline" size="sm" className="flex-1" onClick={onDownloadImage} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                Image
              </Button>
            )}
          </div>

          {displayImage && (
            <div className="flex gap-2">
              {!compositeImage ? (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={generateComposite}
                  disabled={isGeneratingComposite}
                >
                  {isGeneratingComposite ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1" />
                      Créer pub finale
                    </>
                  )}
                </Button>
              ) : (
                <Button variant="default" size="sm" className="flex-1" onClick={downloadComposite}>
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger pub finale
                </Button>
              )}
            </div>
          )}

          {/* Social sharing */}
          <div className="border-t pt-2 mt-1">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Partager</p>
            <div className="flex flex-wrap gap-1.5">
              {/* Native share (mobile — lets user pick TikTok, Instagram, Snapchat, etc.) */}
              {canNativeShare && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Partager
                </Button>
              )}
              {/* Facebook */}
              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10" asChild>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </Button>
              {/* LinkedIn */}
              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-[#0A66C2] border-[#0A66C2]/30 hover:bg-[#0A66C2]/10" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwoosenteur.fr&summary=${encodedText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </Button>
              {/* TikTok - copy text + open app */}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs hover:bg-black/5"
                onClick={() => {
                  navigator.clipboard.writeText(shareText);
                  window.open('https://www.tiktok.com', '_blank');
                }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z"/>
                </svg>
                TikTok
              </Button>
              {/* Instagram - copy text + open app */}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs text-[#E1306C] border-[#E1306C]/30 hover:bg-[#E1306C]/10"
                onClick={() => {
                  navigator.clipboard.writeText(shareText);
                  window.open('https://www.instagram.com', '_blank');
                }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Instagram
              </Button>
              {/* Snapchat */}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs text-[#FFFC00] border-yellow-400/50 hover:bg-yellow-50"
                onClick={() => {
                  navigator.clipboard.writeText(shareText);
                  window.open('https://www.snapchat.com', '_blank');
                }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509-.075.539-1.816.949-3.51 1.199-.09.12-.135.269-.15.434-.015.149-.045.285-.075.42-.09.344-.315.517-.615.517-.18 0-.39-.076-.6-.152-.48-.165-1.11-.225-1.59-.015-.929.435-1.814 1.68-3.585 1.68-.03 0-.059-.001-.088-.001-1.77 0-2.655-1.245-3.584-1.68-.48-.21-1.11-.15-1.59.015-.21.076-.42.152-.6.152-.3 0-.525-.173-.615-.517-.03-.135-.06-.271-.075-.42-.015-.165-.06-.314-.15-.434-1.694-.25-3.435-.66-3.51-1.199-.015-.24.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.014l.015-.015c.181-.344.21-.644.12-.868-.195-.45-.883-.675-1.333-.81-.135-.044-.255-.09-.344-.119-1.201-.464-1.319-.99-1.304-1.351.09-.442.479-.734.893-.734.12 0 .241.015.361.045.39.135.75.24 1.048.285.195 0 .3-.03.435-.075l-.03-.51c-.104-1.628-.229-3.654.3-4.847C7.859 1.069 11.216.793 12.206.793z"/>
                </svg>
                Snap
              </Button>
            </div>
            {!canNativeShare && (
              <p className="text-xs text-muted-foreground mt-1.5">
                💡 Sur mobile, le bouton <strong>Partager</strong> s&apos;affiche pour envoyer directement vers TikTok, Instagram et Snapchat.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DUPE MODE SECTION
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT_COLORS = [
  { label: 'Violet', value: '#5B21B6' },
  { label: 'Rouge', value: '#B91C1C' },
  { label: 'Bleu', value: '#1D4ED8' },
  { label: 'Vert', value: '#15803D' },
  { label: 'Noir', value: '#1C1917' },
  { label: 'Rose', value: '#BE185D' },
];

const DupeModeSection: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dupeProductName, setDupeProductName] = useState('');
  const [originalProductName, setOriginalProductName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [dupePrice, setDupePrice] = useState('35€');
  const [accentColor, setAccentColor] = useState('#5B21B6');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dupeResult, setDupeResult] = useState<DupeTextOutput | null>(null);
  const [overlayImages, setOverlayImages] = useState<Record<number, string>>({});
  const [creatingOverlay, setCreatingOverlay] = useState<number | null>(null);
  const [copiedCaption, setCopiedCaption] = useState<number | null>(null);
  // Feature 1 — Format
  const [dupeFormat, setDupeFormat] = useState<'instagram_post' | 'instagram_story'>('instagram_post');
  // Feature 2 — AI Background
  const [generatedBg, setGeneratedBg] = useState<string | null>(null);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  // Feature 3 — Before/After
  const [beforeAfterImg, setBeforeAfterImg] = useState<string | null>(null);
  const [isCreatingBeforeAfter, setIsCreatingBeforeAfter] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateBackground = async () => {
    if (!dupeProductName.trim()) {
      toast({ variant: 'destructive', title: 'Nom manquant', description: 'Entrez le nom de votre produit d\'abord.' });
      return;
    }
    setIsGeneratingBg(true);
    try {
      const prompt = encodeURIComponent(
        `luxury perfume bottle product photography ${dupeProductName} elegant background silk marble pink light studio`
      );
      const url = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1080&nologo=true&model=flux&seed=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Échec de la génération');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setGeneratedBg(objectUrl);
      setUploadedImage(null);
      setOverlayImages({});
      toast({ title: 'Fond IA généré !', description: 'Vous pouvez régénérer pour un autre résultat.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const handleBeforeAfter = async () => {
    const imageSource = uploadedImage || generatedBg;
    if (!imageSource || !dupeResult) return;
    setIsCreatingBeforeAfter(true);
    try {
      const img = await createBeforeAfterCanvas(imageSource, {
        luxuryBrand: dupeResult.detectedOriginal,
        luxuryPrice: originalPrice.trim() || '120€',
        dupeName: dupeProductName,
        dupePrice: dupePrice.trim() || '35€',
        hookText: `Même parfum. ${dupeResult.variants[0]?.priceTag || 'Prix 4× moins cher.'}`,
        accentColor,
        format: dupeFormat,
      });
      setBeforeAfterImg(img);
      toast({ title: 'Before/After créé !', description: 'Visuel viral prêt à publier.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setIsCreatingBeforeAfter(false);
    }
  };

  const handleGenerate = async () => {
    if (!dupeProductName.trim()) {
      toast({ variant: 'destructive', title: 'Nom manquant', description: 'Entrez le nom de votre produit.' });
      return;
    }
    setIsGenerating(true);
    setDupeResult(null);
    setOverlayImages({});
    try {
      const result = await generateDupeText({
        dupeProductName: dupeProductName.trim(),
        productType: 'Parfum',
        originalProductName: originalProductName.trim() || undefined,
        originalPrice: originalPrice.trim() || undefined,
        dupePrice: dupePrice.trim() || undefined,
      });
      setDupeResult(result);
      toast({
        title: '3 variantes prêtes !',
        description: `Référence luxe : ${result.detectedOriginal}`,
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateOverlay = async (idx: number) => {
    const imageSource = uploadedImage || generatedBg;
    if (!imageSource || !dupeResult) return;
    const v = dupeResult.variants[idx];
    setCreatingOverlay(idx);
    try {
      const img = await createDupeOverlay(imageSource, {
        hookTop: v.hookTop,
        solutionBottom: v.solutionBottom,
        priceTag: v.priceTag || undefined,
        accentColor,
        format: dupeFormat,
      });
      setOverlayImages(prev => ({ ...prev, [idx]: img }));
      toast({ title: 'Visuel créé !', description: 'Téléchargez et partagez.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setCreatingOverlay(null);
    }
  };

  const handleAllOverlays = async () => {
    if (!(uploadedImage || generatedBg) || !dupeResult) return;
    for (let i = 0; i < dupeResult.variants.length; i++) {
      await handleCreateOverlay(i);
    }
  };

  const handleDownload = (idx: number, variantId: string) => {
    const img = overlayImages[idx];
    if (!img) return;
    const a = document.createElement('a');
    a.href = img;
    a.download = `dupe-${dupeProductName}-variante-${variantId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCaption = (idx: number, caption: string) => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(idx);
    setTimeout(() => setCopiedCaption(null), 2000);
    toast({ title: 'Légende copiée !', description: 'Collez dans votre publication.' });
  };

  const handleNativeShare = async (idx: number) => {
    const v = dupeResult?.variants[idx];
    if (!v) return;
    const imageUrl = overlayImages[idx];
    if (navigator.share) {
      try {
        if (imageUrl) {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          const file = new File([blob], 'woosenteur-visuel.png', { type: 'image/png' });
          if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: v.solutionBottom, text: v.fullCaption });
            return;
          }
        }
        await navigator.share({ title: v.solutionBottom, text: v.fullCaption });
      } catch (_) {}
    } else {
      handleCopyCaption(idx, v.fullCaption);
    }
  };

  const toneColors: Record<string, string> = {
    'Viral': 'from-red-500 to-orange-500',
    'Humour': 'from-pink-500 to-fuchsia-500',
    'Élégant': 'from-violet-600 to-indigo-600',
  };

  return (
    <div className="space-y-6">
      {/* Image upload + form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📸 Photo de votre produit</CardTitle>
            <CardDescription className="text-xs">
              Uploadez la photo de votre flacon, ou générez un fond IA gratuit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {/* AI Background button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-dashed border-purple-400 text-purple-700 hover:bg-purple-50"
              onClick={handleGenerateBackground}
              disabled={isGeneratingBg}
            >
              {isGeneratingBg ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération en cours (~5s)...</>
              ) : generatedBg ? (
                <><RefreshCw className="h-3.5 w-3.5" /> Régénérer le fond IA</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5" /> Générer un fond IA — Gratuit</>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {!(uploadedImage || generatedBg) ? (
              <div
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'hover:bg-muted/40'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-9 w-9 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{isDragging ? 'Déposez ici' : 'Glissez ou cliquez'}</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={uploadedImage || generatedBg!}
                    alt="Product"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {generatedBg && !uploadedImage && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✨ IA
                    </div>
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => { setUploadedImage(null); setGeneratedBg(null); setOverlayImages({}); setBeforeAfterImg(null); }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {/* Accent color picker */}
                <div>
                  <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" /> Couleur de fond
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map(c => (
                      <button
                        key={c.value}
                        title={c.label}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${accentColor === c.value ? 'border-white scale-110 shadow-md' : 'border-transparent'}`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => { setAccentColor(c.value); setOverlayImages({}); setBeforeAfterImg(null); }}
                      />
                    ))}
                  </div>
                </div>
                {/* Upload another photo */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-center"
                >
                  Utiliser une autre photo
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: product info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">✍️ Infos produits</CardTitle>
            <CardDescription className="text-xs">
              L&apos;IA génère automatiquement le produit luxe de référence si vous ne le renseignez pas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Votre produit <span className="text-destructive">*</span></label>
              <Input
                placeholder="Ex : Salvo de Alhambra, Gold Black Vibe..."
                value={dupeProductName}
                onChange={e => setDupeProductName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Produit luxe de référence <span className="text-xs">(optionnel)</span>
              </label>
              <Input
                placeholder="Ex : Sauvage d'YSL, Bleu de Chanel..."
                value={originalProductName}
                onChange={e => setOriginalProductName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Si vide, l&apos;IA choisit le plus connu du marché.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Prix luxe <span className="text-xs">(opt.)</span></label>
                <Input placeholder="Ex : 320€" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Votre prix <span className="text-xs">(opt.)</span></label>
                <Input placeholder="Ex : 49€" value={dupePrice} onChange={e => setDupePrice(e.target.value)} />
              </div>
            </div>
            {/* Format toggle */}
            <div>
              <p className="text-xs font-medium mb-1.5">Format du visuel</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setDupeFormat('instagram_post'); setOverlayImages({}); setBeforeAfterImg(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors ${dupeFormat === 'instagram_post' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
                >
                  📸 Carré 1:1
                </button>
                <button
                  onClick={() => { setDupeFormat('instagram_story'); setOverlayImages({}); setBeforeAfterImg(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors ${dupeFormat === 'instagram_story' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
                >
                  📱 Story 9:16
                </button>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || !dupeProductName.trim()}
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération en cours...</>
              ) : (
                <><Flame className="h-4 w-4 mr-2" /> Générer 3 textes viraux</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Gratuit — ne consomme pas de crédits</p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {dupeResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                3 variantes virales
              </h3>
              <p className="text-sm text-muted-foreground">
                Référence détectée : <strong>{dupeResult.detectedOriginal}</strong>
              </p>
            </div>
            {(uploadedImage || generatedBg) && Object.keys(overlayImages).length < 3 && (
              <Button variant="outline" size="sm" onClick={handleAllOverlays} disabled={creatingOverlay !== null}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Créer les 3 visuels
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {dupeResult.variants.map((v, idx) => (
              <Card key={v.id} className="overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${toneColors[v.tone] || 'from-gray-400 to-gray-600'}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{v.tone}</Badge>
                    <span className="text-xs text-muted-foreground">Variante {v.id}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Product image — fully visible */}
                  <div className="rounded-xl overflow-hidden border bg-muted/20">
                    {(uploadedImage || generatedBg) ? (
                      overlayImages[idx] ? (
                        <div className="relative aspect-square">
                          <Image
                            src={overlayImages[idx]}
                            alt="Dupe visuel"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-square bg-white">
                          <Image
                            src={uploadedImage || generatedBg!}
                            alt="Product"
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleCreateOverlay(idx)}
                              disabled={creatingOverlay !== null}
                              className="text-xs gap-1.5"
                            >
                              {creatingOverlay === idx ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Création...</>
                              ) : (
                                <><Sparkles className="h-3.5 w-3.5" /> Créer le visuel</>
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="aspect-square bg-muted/30 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                          <p className="text-xs">Uploadez une photo ou générez un fond IA</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text bands below the image */}
                  <div className="rounded-xl overflow-hidden border bg-slate-800/90">
                    <div className="px-3 py-2">
                      <p className="text-slate-100 text-xs font-semibold leading-snug">{v.hookTop}</p>
                    </div>
                  </div>
                  <div
                    className="rounded-xl overflow-hidden border px-3 py-2"
                    style={{ backgroundColor: accentColor + 'ee' }}
                  >
                    <p className="text-white text-xs font-semibold leading-snug">{v.solutionBottom}</p>
                    {v.priceTag && (
                      <span className="inline-block mt-1 bg-amber-200 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        {v.priceTag}
                      </span>
                    )}
                  </div>

                  {/* Caption preview */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Légende</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">{v.fullCaption}</p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleCopyCaption(idx, v.fullCaption)}
                      >
                        {copiedCaption === idx ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copiedCaption === idx ? 'Copié!' : 'Légende'}
                      </Button>
                      {overlayImages[idx] ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleDownload(idx, v.id)}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Image
                        </Button>
                      ) : (uploadedImage || generatedBg) ? (
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 text-xs"
                          onClick={() => handleCreateOverlay(idx)}
                          disabled={creatingOverlay !== null}
                        >
                          {creatingOverlay === idx ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                          )}
                          Créer
                        </Button>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs gap-1.5"
                      onClick={() => handleNativeShare(idx)}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Before/After */}
          <Card className="border-2 border-dashed border-orange-300">
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Visuel Before/After viral
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Côte à côte : produit luxe vs votre dupe — format très partagé sur TikTok/Reels
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-2 border-orange-400 text-orange-700 hover:bg-orange-50"
                  onClick={handleBeforeAfter}
                  disabled={isCreatingBeforeAfter || !(uploadedImage || generatedBg)}
                >
                  {isCreatingBeforeAfter ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Création...</>
                  ) : (
                    <><Zap className="h-3.5 w-3.5" /> Créer le Before/After</>
                  )}
                </Button>
              </div>
              {!(uploadedImage || generatedBg) && (
                <p className="text-xs text-muted-foreground mt-2">⬆ Uploadez une photo ou générez un fond IA pour activer.</p>
              )}
              {beforeAfterImg && (
                <div className="mt-4 space-y-2">
                  <div className="relative rounded-xl overflow-hidden border">
                    <Image
                      src={beforeAfterImg}
                      alt="Before/After"
                      width={1080}
                      height={dupeFormat === 'instagram_story' ? 1920 : 1080}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = beforeAfterImg;
                        a.download = `before-after-${dupeProductName}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Télécharger
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={handleBeforeAfter}
                      disabled={isCreatingBeforeAfter}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Régénérer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK MODE SECTION
// 3 sub-modes: Post Standard | Sondage | Offre Flash
// ─────────────────────────────────────────────────────────────────────────────

const FB_ACCENT_COLORS = [
  { label: 'Facebook Bleu', value: '#1877F2' },
  { label: 'Violet',        value: '#7C3AED' },
  { label: 'Rouge',         value: '#DC2626' },
  { label: 'Vert',          value: '#16A34A' },
  { label: 'Noir',          value: '#1C1917' },
  { label: 'Rose',          value: '#DB2777' },
];

type FbSubMode = 'post' | 'poll' | 'flash';

const FacebookModeSection: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared state
  const [fbSubMode, setFbSubMode] = useState<FbSubMode>('post');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [accentColor, setAccentColor] = useState('#1877F2');
  const [isGenerating, setIsGenerating] = useState(false);

  // Shared product fields (all 3 modes)
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('Parfum');
  const [brand, setBrand] = useState('');

  // Post fields
  const [postPrice, setPostPrice] = useState('');
  const [postBenefit, setPostBenefit] = useState('');
  const [postResult, setPostResult] = useState<FacebookPostOutput | null>(null);
  const [postImages, setPostImages] = useState<Record<number, string>>({});
  const [creatingPostImg, setCreatingPostImg] = useState<number | null>(null);
  const [copiedPostIdx, setCopiedPostIdx] = useState<number | null>(null);

  // Poll fields
  const [pollTheme, setPollTheme] = useState('');
  const [pollResult, setPollResult] = useState<FacebookPollOutput | null>(null);
  const [pollImage, setPollImage] = useState<string | null>(null);
  const [creatingPollImg, setCreatingPollImg] = useState(false);
  const [copiedPoll, setCopiedPoll] = useState(false);

  // Flash fields
  const [flashDiscount, setFlashDiscount] = useState(30);
  const [flashOrigPrice, setFlashOrigPrice] = useState('');
  const [flashSalePrice, setFlashSalePrice] = useState('');
  const [flashEndDate, setFlashEndDate] = useState('');
  const [flashResult, setFlashResult] = useState<FacebookFlashOutput | null>(null);
  const [flashImage, setFlashImage] = useState<string | null>(null);
  const [creatingFlashImg, setCreatingFlashImg] = useState(false);
  const [copiedFlash, setCopiedFlash] = useState(false);

  // Reset visuals when mode or color changes
  const resetVisuals = () => {
    setPostImages({});
    setPollImage(null);
    setFlashImage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setUploadedImage(ev.target?.result as string); resetVisuals(); };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setUploadedImage(ev.target?.result as string); resetVisuals(); };
    reader.readAsDataURL(file);
  };

  // ── GENERATE handlers ────────────────────────────────────────────────────────

  const handleGeneratePost = async () => {
    if (!productName.trim()) { toast({ variant: 'destructive', title: 'Nom manquant', description: 'Entrez le nom de votre produit.' }); return; }
    setIsGenerating(true); setPostResult(null); setPostImages({});
    try {
      const result = await generateFacebookPosts({
        productName: productName.trim(),
        productType: productType.trim() || 'Parfum',
        brand: brand.trim() || undefined,
        price: postPrice.trim() || undefined,
        keyBenefit: postBenefit.trim() || undefined,
      });
      setPostResult(result);
      toast({ title: '3 posts générés !', description: 'Créez les visuels pour chaque variante.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: err.message });
    } finally { setIsGenerating(false); }
  };

  const handleGeneratePoll = async () => {
    if (!productName.trim()) { toast({ variant: 'destructive', title: 'Nom manquant', description: 'Entrez le nom de votre produit.' }); return; }
    setIsGenerating(true); setPollResult(null); setPollImage(null);
    try {
      const result = await generateFacebookPoll({
        productName: productName.trim(),
        productType: productType.trim() || 'Parfum',
        brand: brand.trim() || undefined,
        theme: pollTheme.trim() || undefined,
      });
      setPollResult(result);
      toast({ title: 'Sondage généré !', description: 'Créez le visuel pour le publier.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: err.message });
    } finally { setIsGenerating(false); }
  };

  const handleGenerateFlash = async () => {
    if (!productName.trim()) { toast({ variant: 'destructive', title: 'Nom manquant', description: 'Entrez le nom de votre produit.' }); return; }
    setIsGenerating(true); setFlashResult(null); setFlashImage(null);
    try {
      const result = await generateFacebookFlash({
        productName: productName.trim(),
        productType: productType.trim() || 'Parfum',
        brand: brand.trim() || undefined,
        discountPercent: flashDiscount,
        originalPrice: flashOrigPrice.trim() || undefined,
        salePrice: flashSalePrice.trim() || undefined,
        endDate: flashEndDate.trim() || undefined,
      });
      setFlashResult(result);
      toast({ title: 'Offre Flash générée !', description: 'Créez le visuel pour le publier.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: err.message });
    } finally { setIsGenerating(false); }
  };

  // ── CREATE VISUAL handlers ───────────────────────────────────────────────────

  const handleCreatePostVisual = async (idx: number) => {
    if (!uploadedImage || !postResult) return;
    const v = postResult.variants[idx];
    setCreatingPostImg(idx);
    try {
      const img = await createFacebookPostVisual(uploadedImage, {
        headline: v.headline,
        subline: v.subline,
        priceTag: postPrice.trim() || undefined,
        accentColor,
      });
      setPostImages(prev => ({ ...prev, [idx]: img }));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally { setCreatingPostImg(null); }
  };

  const handleCreateAllPostVisuals = async () => {
    if (!uploadedImage || !postResult) return;
    for (let i = 0; i < postResult.variants.length; i++) {
      await handleCreatePostVisual(i);
    }
  };

  const handleCreatePollVisual = async () => {
    if (!uploadedImage || !pollResult) return;
    setCreatingPollImg(true);
    try {
      const img = await createFacebookPollVisual(uploadedImage, {
        question: pollResult.question,
        optionA: pollResult.optionA,
        optionB: pollResult.optionB,
        accentColor,
      });
      setPollImage(img);
      toast({ title: 'Visuel sondage créé !' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally { setCreatingPollImg(false); }
  };

  const handleCreateFlashVisual = async () => {
    if (!uploadedImage || !flashResult) return;
    setCreatingFlashImg(true);
    try {
      const img = await createFacebookFlashVisual(uploadedImage, {
        discountBadge: `-${flashDiscount}%`,
        headline: flashResult.headline,
        originalPrice: flashOrigPrice.trim() || undefined,
        salePrice: flashSalePrice.trim() || undefined,
        urgencyLine: flashResult.urgencyLine,
      });
      setFlashImage(img);
      toast({ title: 'Visuel Offre Flash créé !' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally { setCreatingFlashImg(false); }
  };

  // ── Download & copy helpers ──────────────────────────────────────────────────

  const downloadImg = (dataUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = dataUrl; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copié !', description: 'Collez dans votre publication Facebook.' });
  };

  const copyTextWithIdx = (text: string, idx: number, setter: React.Dispatch<React.SetStateAction<number | null>>) => {
    navigator.clipboard.writeText(text);
    setter(idx);
    setTimeout(() => setter(null), 2000);
    toast({ title: 'Copié !' });
  };

  const copyTextBool = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
    toast({ title: 'Copié !' });
  };

  const nativeShare = async (text: string, title?: string) => {
    if (navigator.share) {
      try { await navigator.share({ title: title || productName, text }); } catch (_) {}
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: 'Légende copiée !', description: 'Partagez sur Facebook.' });
    }
  };

  // ── Tone colors ──────────────────────────────────────────────────────────────
  const toneColors: Record<string, string> = {
    Viral: 'from-red-500 to-orange-500',
    Chaleureux: 'from-amber-400 to-yellow-500',
    Premium: 'from-violet-600 to-indigo-600',
  };

  const generateLabel = fbSubMode === 'post' ? 'Générer 3 posts' : fbSubMode === 'poll' ? 'Générer le sondage' : 'Générer l\'offre flash';
  const handleGenerate = fbSubMode === 'post' ? handleGeneratePost : fbSubMode === 'poll' ? handleGeneratePoll : handleGenerateFlash;
  const hasResult = (fbSubMode === 'post' && postResult) || (fbSubMode === 'poll' && pollResult) || (fbSubMode === 'flash' && flashResult);

  return (
    <div className="space-y-6">

      {/* Sub-mode tabs — responsive: grid 3 cols on mobile, inline-flex on sm+ */}
      <div className="flex justify-center px-2">
        <div className="grid grid-cols-3 w-full max-w-sm sm:max-w-none sm:w-auto sm:inline-flex rounded-xl border bg-muted p-1 gap-1">
          {[
            { key: 'post' as FbSubMode, icon: <ImageIcon className="h-4 w-4" />, label: 'Post Standard', shortLabel: 'Post' },
            { key: 'poll' as FbSubMode, icon: <BarChart2 className="h-4 w-4" />, label: 'Sondage',       shortLabel: 'Sondage' },
            { key: 'flash' as FbSubMode, icon: <Zap className="h-4 w-4" />,      label: 'Offre Flash',   shortLabel: 'Flash' },
          ].map(({ key, icon, label, shortLabel }) => (
            <button
              key={key}
              onClick={() => { setFbSubMode(key); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all text-center ${fbSubMode === key ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {icon}
              <span className="sm:hidden leading-tight">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT: upload + color picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📸 Photo produit</CardTitle>
            <CardDescription className="text-xs">Uploadez la photo de votre flacon ou produit pour le visuel Facebook (1200×628).</CardDescription>
          </CardHeader>
          <CardContent>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {!uploadedImage ? (
              <div
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'hover:bg-muted/40'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-9 w-9 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{isDragging ? 'Déposez ici' : 'Glissez ou cliquez'}</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-muted" style={{ aspectRatio: '1200/628' }}>
                  <Image src={uploadedImage} alt="Product" fill className="object-contain" unoptimized />
                  <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setUploadedImage(null); resetVisuals(); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {/* Accent color picker */}
                <div>
                  <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" /> Couleur d&apos;accent
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {FB_ACCENT_COLORS.map(c => (
                      <button key={c.value} title={c.label} onClick={() => { setAccentColor(c.value); resetVisuals(); }}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${accentColor === c.value ? 'border-white scale-110 shadow-md' : 'border-transparent'}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: form — content changes per sub-mode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {fbSubMode === 'post' && '✍️ Post Standard'}
              {fbSubMode === 'poll' && '🗳️ Sondage'}
              {fbSubMode === 'flash' && '⚡ Offre Flash'}
            </CardTitle>
            <CardDescription className="text-xs">
              {fbSubMode === 'post' && '3 variantes de posts (Viral, Chaleureux, Premium) avec visuel 1200×628.'}
              {fbSubMode === 'poll' && "L'IA génère une question engageante + 2 options + légende Facebook."}
              {fbSubMode === 'flash' && "Bannière rouge, badge rond de réduction, prix barré — converti sur Facebook."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Shared fields */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Produit <span className="text-destructive">*</span></label>
              <Input placeholder="Ex : Gold Black Vibe, Salvo de Alhambra..." value={productName} onChange={e => setProductName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <Input placeholder="Parfum" value={productType} onChange={e => setProductType(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Marque <span className="text-xs">(opt.)</span></label>
                <Input placeholder="Ex : Woosenteur" value={brand} onChange={e => setBrand(e.target.value)} />
              </div>
            </div>

            {/* Post-specific fields */}
            {fbSubMode === 'post' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Prix <span className="text-xs">(opt.)</span></label>
                  <Input placeholder="Ex : 49€" value={postPrice} onChange={e => setPostPrice(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Bénéfice clé <span className="text-xs">(opt.)</span></label>
                  <Input placeholder="Ex : longue tenue 24h" value={postBenefit} onChange={e => setPostBenefit(e.target.value)} />
                </div>
              </div>
            )}

            {/* Poll-specific fields */}
            {fbSubMode === 'poll' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Thème du sondage <span className="text-xs">(opt.)</span></label>
                <Input placeholder="Ex : saison, occasion, profil client..." value={pollTheme} onChange={e => setPollTheme(e.target.value)} />
                <p className="text-xs text-muted-foreground">Si vide, l&apos;IA choisit le thème le plus engageant.</p>
              </div>
            )}

            {/* Flash-specific fields */}
            {fbSubMode === 'flash' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Réduction : <strong>{flashDiscount}%</strong></label>
                  <input
                    type="range" min={5} max={80} step={5} value={flashDiscount}
                    onChange={e => setFlashDiscount(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>80%</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Prix original <span className="text-xs">(opt.)</span></label>
                    <Input placeholder="Ex : 89€" value={flashOrigPrice} onChange={e => setFlashOrigPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Prix soldé <span className="text-xs">(opt.)</span></label>
                    <Input placeholder="Ex : 62€" value={flashSalePrice} onChange={e => setFlashSalePrice(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Fin de l&apos;offre <span className="text-xs">(opt.)</span></label>
                  <Input placeholder="Ex : ce soir minuit, dimanche..." value={flashEndDate} onChange={e => setFlashEndDate(e.target.value)} />
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !productName.trim()}>
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération en cours...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> {generateLabel}</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Gratuit — ne consomme pas de crédits</p>
          </CardContent>
        </Card>
      </div>

      {/* ── RESULTS: Post Standard ── */}
      {fbSubMode === 'post' && postResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#1877F2]" /> 3 posts Facebook
            </h3>
            {uploadedImage && Object.keys(postImages).length < 3 && (
              <Button variant="outline" size="sm" onClick={handleCreateAllPostVisuals} disabled={creatingPostImg !== null}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Créer les 3 visuels
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {postResult.variants.map((v, idx) => (
              <Card key={v.tone} className="overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${toneColors[v.tone] || 'from-gray-400 to-gray-600'}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{v.tone}</Badge>
                    <span className="text-xs text-muted-foreground">Format 1200×628</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Visual preview */}
                  <div className="rounded-xl overflow-hidden bg-muted/30 border" style={{ aspectRatio: '1200/628' }}>
                    {postImages[idx] ? (
                      <div className="relative w-full h-full">
                        <Image src={postImages[idx]} alt="FB Post" fill className="object-cover" unoptimized />
                      </div>
                    ) : uploadedImage ? (
                      <div className="relative w-full h-full bg-muted">
                        <Image src={uploadedImage} alt="Product" fill className="object-contain" unoptimized />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Button size="sm" variant="secondary" onClick={() => handleCreatePostVisual(idx)} disabled={creatingPostImg !== null} className="text-xs gap-1.5">
                            {creatingPostImg === idx ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Création...</> : <><Sparkles className="h-3.5 w-3.5" /> Créer le visuel</>}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-center p-4 text-muted-foreground">
                        <div><ImageIcon className="h-8 w-8 mx-auto mb-1" /><p className="text-xs">Uploadez une photo</p></div>
                      </div>
                    )}
                  </div>
                  {/* Text content */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-sm">{v.headline}</p>
                    <p className="text-xs text-muted-foreground">{v.subline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Légende</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">{v.caption}</p>
                  </div>
                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => copyTextWithIdx(v.caption, idx, setCopiedPostIdx)}>
                        {copiedPostIdx === idx ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copiedPostIdx === idx ? 'Copié!' : 'Légende'}
                      </Button>
                      {postImages[idx] ? (
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadImg(postImages[idx], `fb-post-${v.tone}-${productName}.png`)}>
                          <Download className="h-3.5 w-3.5 mr-1" /> Image
                        </Button>
                      ) : uploadedImage ? (
                        <Button size="sm" variant="default" className="flex-1 text-xs" onClick={() => handleCreatePostVisual(idx)} disabled={creatingPostImg !== null}>
                          {creatingPostImg === idx ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                          Créer
                        </Button>
                      ) : null}
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10" onClick={() => nativeShare(v.caption, v.headline)}>
                      <Share2 className="h-3.5 w-3.5" /> Partager sur Facebook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS: Sondage ── */}
      {fbSubMode === 'poll' && pollResult && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[#1877F2]" /> Votre sondage Facebook
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual */}
            <Card className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#1877F2] to-cyan-500" />
              <CardContent className="pt-4 space-y-3">
                <div className="rounded-xl overflow-hidden bg-muted/30 border" style={{ aspectRatio: '1200/628' }}>
                  {pollImage ? (
                    <div className="relative w-full h-full">
                      <Image src={pollImage} alt="Poll visual" fill className="object-cover" unoptimized />
                    </div>
                  ) : uploadedImage ? (
                    <div className="relative w-full h-full bg-muted">
                      <Image src={uploadedImage} alt="Product" fill className="object-contain" unoptimized />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Button size="sm" variant="secondary" onClick={handleCreatePollVisual} disabled={creatingPollImg} className="text-xs gap-1.5">
                          {creatingPollImg ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Création...</> : <><Sparkles className="h-3.5 w-3.5" /> Créer le visuel</>}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center p-4 text-muted-foreground">
                      <div><ImageIcon className="h-8 w-8 mx-auto mb-1" /><p className="text-xs">Uploadez une photo</p></div>
                    </div>
                  )}
                </div>
                {/* Poll preview */}
                <div className="rounded-xl overflow-hidden border bg-muted/20">
                  <div className="bg-[#111827] px-3 py-2 border-b border-[#1877F2]/40">
                    <p className="text-white text-xs font-bold">🗳️ {pollResult.question}</p>
                  </div>
                  <div className="flex gap-2 p-3">
                    <div className="flex-1 bg-[#1877F2] rounded-lg px-2 py-1.5 text-center">
                      <p className="text-white text-xs font-bold">{pollResult.optionA}</p>
                    </div>
                    <div className="flex-1 bg-[#374151] rounded-lg px-2 py-1.5 text-center">
                      <p className="text-white text-xs font-bold">{pollResult.optionB}</p>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2">
                  {pollImage ? (
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadImg(pollImage, `fb-sondage-${productName}.png`)}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Image
                    </Button>
                  ) : uploadedImage ? (
                    <Button size="sm" variant="default" className="flex-1 text-xs" onClick={handleCreatePollVisual} disabled={creatingPollImg}>
                      {creatingPollImg ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                      Créer le visuel
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
            {/* Caption */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Légende du post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{pollResult.caption}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => copyTextBool(pollResult!.caption, setCopiedPoll)}>
                    {copiedPoll ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedPoll ? 'Copié!' : 'Copier la légende'}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10" onClick={() => nativeShare(pollResult!.caption, pollResult!.question)}>
                    <Share2 className="h-3.5 w-3.5 mr-1" /> Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── RESULTS: Offre Flash ── */}
      {fbSubMode === 'flash' && flashResult && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-500" /> Votre Offre Flash Facebook
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual */}
            <Card className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-600 to-orange-500" />
              <CardContent className="pt-4 space-y-3">
                <div className="rounded-xl overflow-hidden bg-muted/30 border" style={{ aspectRatio: '1200/628' }}>
                  {flashImage ? (
                    <div className="relative w-full h-full">
                      <Image src={flashImage} alt="Flash offer" fill className="object-cover" unoptimized />
                    </div>
                  ) : uploadedImage ? (
                    <div className="relative w-full h-full bg-muted">
                      <Image src={uploadedImage} alt="Product" fill className="object-contain" unoptimized />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Button size="sm" variant="secondary" onClick={handleCreateFlashVisual} disabled={creatingFlashImg} className="text-xs gap-1.5">
                          {creatingFlashImg ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Création...</> : <><Zap className="h-3.5 w-3.5" /> Créer le visuel</>}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center p-4 text-muted-foreground">
                      <div><ImageIcon className="h-8 w-8 mx-auto mb-1" /><p className="text-xs">Uploadez une photo</p></div>
                    </div>
                  )}
                </div>
                {/* Flash preview text */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="bg-red-600 px-3 py-1.5 text-center">
                    <p className="text-white text-xs font-black">⚡ OFFRE FLASH ⚡</p>
                  </div>
                  <div className="bg-[#050505] px-3 py-2 space-y-1">
                    <p className="text-white text-sm font-bold">{flashResult.headline}</p>
                    {(flashSalePrice || flashOrigPrice) && (
                      <div className="flex items-baseline gap-2">
                        {flashSalePrice && <span className="text-yellow-400 font-black text-lg">{flashSalePrice}</span>}
                        {flashOrigPrice && <span className="text-white/50 text-sm line-through">{flashOrigPrice}</span>}
                        <Badge className="bg-red-500 text-white text-xs">-{flashDiscount}%</Badge>
                      </div>
                    )}
                    <p className="text-red-300 text-xs">{flashResult.urgencyLine}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2">
                  {flashImage ? (
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadImg(flashImage!, `fb-flash-${productName}.png`)}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Image
                    </Button>
                  ) : uploadedImage ? (
                    <Button size="sm" variant="default" className="flex-1 text-xs" onClick={handleCreateFlashVisual} disabled={creatingFlashImg}>
                      {creatingFlashImg ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1" />}
                      Créer le visuel
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
            {/* Caption */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Légende de l&apos;offre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{flashResult.caption}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => copyTextBool(flashResult!.caption, setCopiedFlash)}>
                    {copiedFlash ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedFlash ? 'Copié!' : 'Copier la légende'}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10" onClick={() => nativeShare(flashResult!.caption, flashResult!.headline)}>
                    <Share2 className="h-3.5 w-3.5 mr-1" /> Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
};

export default function MarketingPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const searchParamsHook = useSearchParams();
  const modeParam = searchParamsHook.get('mode') as 'campaign' | 'dupe' | 'facebook' | null;
  const [activeMode, setActiveMode] = useState<'campaign' | 'dupe' | 'facebook'>(
    modeParam && ['campaign', 'dupe', 'facebook'].includes(modeParam) ? modeParam : 'campaign'
  );
  const [step, setStep] = useState<GenerationStep>('form');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Préparation...');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productMode, setProductMode] = useState<'catalog' | 'manual'>('catalog');
  const [manualProductName, setManualProductName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualProductType, setManualProductType] = useState('');
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Image upload and analysis states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const form = useForm<MarketingFormValues>({
    resolver: zodResolver(marketingFormSchema),
    defaultValues: {
      productId: '',
      message: '',
      style: 'luxe',
      ageRange: '25-45',
      gender: 'Tous',
      values: ['Efficacité'],
      cta: 'Découvrir',
      formats: ['instagram_post'],
    },
  });

  // Load user's products
  useEffect(() => {
    if (user) {
      getProducts(user.uid).then(setProducts).catch(console.error);
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Update selected product when productId changes
  const watchProductId = form.watch('productId');
  useEffect(() => {
    const product = products.find(p => p.id === watchProductId);
    setSelectedProduct(product || null);
  }, [watchProductId, products]);

  const isLoading = userLoading || profileLoading;
  const isSuperAdmin = userProfile?.isUnlimited || userProfile?.role === 'superadmin';
  const hasSufficientCredits = userProfile && (userProfile.creditBalance ?? 0) >= 2;
  const canGenerate = isSuperAdmin || hasSufficientCredits;

  const copyTextToClipboard = (variant: any) => {
    const text = `${variant.headline}\n\n${variant.body}\n\n${variant.cta}\n\n${variant.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Texte copié!', description: 'Le contenu a été copié dans le presse-papiers.' });
  };

  const downloadImage = async (variant: any) => {
    // Use generated image URL or fall back to uploaded image
    const imageToDownload = variant.imageUrl || uploadedImage;
    if (!imageToDownload) return;

    setIsDownloading(variant.variant);
    try {
      let downloadUrl: string;
      if (imageToDownload.startsWith('data:')) {
        // Base64 — download directly
        downloadUrl = imageToDownload;
      } else {
        const response = await fetch(imageToDownload);
        const blob = await response.blob();
        downloadUrl = window.URL.createObjectURL(blob);
      }
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `pub-${selectedProduct?.name || 'produit'}-${variant.styleName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (!imageToDownload.startsWith('data:')) {
        window.URL.revokeObjectURL(downloadUrl);
      }
      toast({ title: 'Téléchargement réussi!', description: 'L\'image a été téléchargée.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de télécharger l\'image.' });
    } finally {
      setIsDownloading(null);
    }
  };

  const onSubmit = useCallback(async (data: MarketingFormValues) => {
    if (!user) return;

    const effectiveName = productMode === 'manual' ? manualProductName.trim() : selectedProduct?.name || '';
    const effectiveBrand = productMode === 'manual' ? manualBrand.trim() : selectedProduct?.brand || '';
    const effectiveType = productMode === 'manual' ? (manualProductType.trim() || 'produit') : selectedProduct?.productType || '';
    const effectiveId = productMode === 'manual' ? `manual-${Date.now()}` : selectedProduct?.id || '';

    if (!effectiveName) {
      toast({ variant: 'destructive', title: 'Nom du produit manquant', description: 'Entrez le nom du produit.' });
      return;
    }
    if (productMode === 'catalog' && !selectedProduct) {
      toast({ variant: 'destructive', title: 'Produit manquant', description: 'Sélectionnez un produit dans le catalogue.' });
      return;
    }

    if (!canGenerate) {
      setShowUpgradePopup(true);
      return;
    }

    setStep('generating');
    setProgress(0);
    setProgressMessage('Démarrage de la génération...');
    setGeneratedVariants([]);

    try {
      // Decrement credits (2 for full campaign)
      await decrementCreditsBy(user.uid, 2);
      setProgress(10);
      setProgressMessage('Génération des textes publicitaires...');

      // Generate marketing content (texts)
      const contentResult = await generateMarketingContent({
        productName: effectiveName,
        productType: effectiveType,
        brand: effectiveBrand,
        message: data.message,
        style: data.style,
        targetAudience: {
          ageRange: data.ageRange,
          gender: data.gender,
          values: data.values,
        },
        cta: data.cta,
        format: data.formats[0] as MarketingFormat,
      });

      setProgress(40);
      setProgressMessage('Génération des visuels IA...');

      // Generate images for each variant
      const variantsWithImages = await Promise.all(
        contentResult.variants.map(async (variant, index) => {
          setProgressMessage(`Création du visuel ${index + 1}/3...`);

          try {
            const imageResult = await generateAdImage({
              productName: effectiveName,
              productType: effectiveType,
              style: variant.styleName as MarketingStyle,
              format: data.formats[0],
            });

            setProgress(40 + ((index + 1) / 3) * 50);

            return {
              ...variant,
              imageUrl: imageResult.imageUrl,
              imagePrompt: imageResult.prompt,
              dimensions: imageResult.dimensions,
            };
          } catch (imageError) {
            console.error(`Error generating image for variant ${variant.variant}:`, imageError);
            return {
              ...variant,
              imageUrl: '',
              imagePrompt: '',
              dimensions: { width: 1080, height: 1080 },
            };
          }
        })
      );

      setProgress(95);
      setProgressMessage('Finalisation...');

      // Save campaign to Firestore (filter out undefined values for Firestore compatibility)
      const campaignData: Parameters<typeof saveCampaign>[1] = {
        productId: effectiveId,
        productName: effectiveName,
        productType: effectiveType as Product['productType'],
        brief: {
          message: data.message,
          targetAudience: {
            ageRange: data.ageRange,
            gender: data.gender,
            values: data.values,
          },
          style: data.style,
          cta: data.cta,
          formats: data.formats as MarketingFormat[],
        },
        generations: variantsWithImages.map(v => {
          const generation: any = {
            id: `gen-${v.variant}-${Date.now()}`,
            variant: v.variant,
            styleName: v.styleName,
            headline: v.headline,
            body: v.body,
            cta: v.cta,
            hashtags: v.hashtags,
            format: data.formats[0] as MarketingFormat,
            dimensions: v.dimensions || { width: 1080, height: 1080 },
            generatedAt: Timestamp.now(),
          };
          // Only add optional fields if they have values
          if (v.imageUrl) generation.imageUrl = v.imageUrl;
          if (v.imagePrompt) generation.imagePrompt = v.imagePrompt;
          return generation;
        }),
        creditsUsed: 2,
        status: 'completed',
      };

      // Only add productImageUrl if it exists (Firestore rejects undefined values)
      if (selectedProduct?.imageUrl) {
        campaignData.productImageUrl = selectedProduct.imageUrl;
      }

      const campaignId = await saveCampaign(user.uid, campaignData);

      setProgress(100);
      setGeneratedVariants(variantsWithImages);
      setStep('results');

      toast({
        variant: 'success',
        title: 'Campagne générée!',
        description: '3 variantes publicitaires ont été créées avec succès.',
      });
    } catch (error: any) {
      console.error('Error generating campaign:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: error.message || 'Une erreur est survenue lors de la génération.',
      });
      setStep('form');
    }
  }, [user, selectedProduct, productMode, manualProductName, manualBrand, manualProductType, canGenerate, toast]);

  const resetForm = () => {
    setStep('form');
    setGeneratedVariants([]);
    setProgress(0);
    setUploadedImage(null);
    setAnalysisResult(null);
    form.reset();
  };

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Format invalide',
        description: 'Veuillez télécharger une image (JPG, PNG, WebP).',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'L\'image doit faire moins de 10 Mo.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  // Analyze uploaded image
  const handleAnalyzeImage = useCallback(async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeProductImage({ imageDataUri: uploadedImage });
      setAnalysisResult(result);

      // Auto-fill form with analysis results
      form.setValue('message', result.suggestedMessage);
      form.setValue('style', result.suggestedStyle);
      form.setValue('gender', result.suggestedGender);

      // Filter values to only include valid options
      const validValues = result.suggestedValues.filter((v: string) =>
        VALUE_OPTIONS.includes(v)
      );
      if (validValues.length > 0) {
        form.setValue('values', validValues);
      }

      toast({
        title: 'Analyse terminée!',
        description: `Produit détecté: ${result.productName} (${result.productType})`,
      });
    } catch (error: any) {
      console.error('Image analysis error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'analyse',
        description: error.message || 'Impossible d\'analyser l\'image.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, form, toast]);

  const clearUploadedImage = useCallback(() => {
    setUploadedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-headline text-3xl font-bold text-gradient flex items-center justify-center gap-2">
          <Megaphone className="h-8 w-8" />
          Marketing IA
        </h1>
        <p className="text-muted-foreground">Créez des publicités professionnelles pour vos produits cosmétiques.</p>
      </div>

      {/* Mode toggle — responsive: grid 3 cols on mobile, inline-flex on sm+ */}
      <div className="flex justify-center mb-6 px-2">
        <div className="grid grid-cols-3 w-full max-w-sm sm:max-w-none sm:w-auto sm:inline-flex rounded-xl border bg-muted p-1 gap-1">

          {/* Campagne Publicitaire */}
          <button
            onClick={() => setActiveMode('campaign')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-center ${
              activeMode === 'campaign' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="sm:hidden leading-tight">Campagne</span>
            <span className="hidden sm:inline">Campagne Publicitaire</span>
            <Badge variant="secondary" className="hidden sm:inline-flex text-xs ml-1">2 crédits</Badge>
          </button>

          {/* Mode Dupe Viral */}
          <button
            onClick={() => setActiveMode('dupe')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-center ${
              activeMode === 'dupe' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="sm:hidden leading-tight">Dupe Viral</span>
            <span className="hidden sm:inline">Mode Dupe Viral</span>
            <Badge className="hidden sm:inline-flex text-xs ml-1 bg-orange-500 text-white">Gratuit</Badge>
          </button>

          {/* Posts Facebook */}
          <button
            onClick={() => setActiveMode('facebook')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-center ${
              activeMode === 'facebook' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <svg className="h-4 w-4 shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="sm:hidden leading-tight">Facebook</span>
            <span className="hidden sm:inline">Posts Facebook</span>
            <Badge className="hidden sm:inline-flex text-xs ml-1 bg-[#1877F2] text-white">Gratuit</Badge>
          </button>

        </div>
      </div>

      {/* Dupe mode */}
      {activeMode === 'dupe' && (
        <DupeModeSection />
      )}

      {/* Facebook mode */}
      {activeMode === 'facebook' && (
        <FacebookModeSection />
      )}

      {/* Campaign mode */}
      {activeMode === 'campaign' && step === 'form' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Campagne Publicitaire</CardTitle>
              <CardDescription>
                Uploadez une image produit pour pré-remplir le formulaire, ou sélectionnez un produit existant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Image Upload Section */}
              <div className="mb-6 p-4 border-2 border-dashed rounded-lg bg-muted/30">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="product-image-upload"
                />

                {!uploadedImage ? (
                  <div
                    className={`flex flex-col items-center justify-center py-8 cursor-pointer transition-colors ${
                      isDragging ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className={`h-10 w-10 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-medium text-sm">
                      {isDragging ? 'Déposez l\'image ici' : 'Glissez une image ou cliquez pour télécharger'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP (max 10 Mo) - L'IA analysera votre produit
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={uploadedImage}
                            alt="Uploaded product"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          {analysisResult ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                  Analysé
                                </Badge>
                                <span className="text-sm font-medium">{analysisResult.productName}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Type: {analysisResult.productType}
                                {analysisResult.brand && ` • Marque: ${analysisResult.brand}`}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {analysisResult.colorPalette?.slice(0, 4).map((color: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                    {color}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confiance: {analysisResult.confidence}%
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Image téléchargée</p>
                              <p className="text-xs text-muted-foreground">
                                Cliquez sur "Analyser" pour que l'IA détecte le produit et pré-remplisse le formulaire.
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={clearUploadedImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {!analysisResult && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={handleAnalyzeImage}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Scan className="h-4 w-4 mr-2" />
                            Analyser avec l'IA
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {uploadedImage ? 'Puis sélectionnez ou créez un produit' : 'Ou sélectionnez un produit existant'}
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Product Mode Toggle */}
                  <div>
                    <p className="text-sm font-medium mb-2">Produit</p>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setProductMode('catalog')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${productMode === 'catalog' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}
                      >
                        Catalogue existant
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductMode('manual')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${productMode === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}
                      >
                        Saisie manuelle
                      </button>
                    </div>
                  </div>

                  {productMode === 'catalog' ? (
                    /* Product Selector */
                    <FormField
                      control={form.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un produit..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  Aucun produit disponible
                                </SelectItem>
                              ) : (
                                products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.brand})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {products.length === 0 ? (
                              <Link href="/dashboard/generate" className="text-primary hover:underline">
                                Créez d&apos;abord un produit avec le Générateur IA
                              </Link>
                            ) : (
                              'Choisissez le produit pour lequel créer la publicité.'
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    /* Manual product fields */
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Nom du produit <span className="text-destructive">*</span></label>
                        <Input
                          className="mt-1"
                          placeholder="Ex : Lattafa Asad, Crème Lumineuse Gold..."
                          value={manualProductName}
                          onChange={e => setManualProductName(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium">Marque</label>
                          <Input
                            className="mt-1"
                            placeholder="Ex : Lattafa, L'Oréal..."
                            value={manualBrand}
                            onChange={e => setManualBrand(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Type de produit</label>
                          <Input
                            className="mt-1"
                            placeholder="Ex : parfum, crème, sérum..."
                            value={manualProductType}
                            onChange={e => setManualProductType(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message clé</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Révélez l'éclat de votre peau en 7 jours..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Le message principal à communiquer dans la publicité.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Style Selector */}
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style visuel</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {STYLE_OPTIONS.map((style) => (
                            <div
                              key={style.value}
                              className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-primary ${
                                field.value === style.value ? 'border-primary bg-primary/5' : 'border-muted'
                              }`}
                              onClick={() => field.onChange(style.value)}
                            >
                              <div className="text-2xl mb-1">{style.emoji}</div>
                              <div className="font-medium text-sm">{style.label}</div>
                              <div className="text-xs text-muted-foreground">{style.description}</div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Audience */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ageRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tranche d'âge</FormLabel>
                          <FormControl>
                            <Input placeholder="25-45" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre cible</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Femmes">Femmes</SelectItem>
                              <SelectItem value="Hommes">Hommes</SelectItem>
                              <SelectItem value="Tous">Tous</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Values */}
                  <FormField
                    control={form.control}
                    name="values"
                    render={() => (
                      <FormItem>
                        <FormLabel>Valeurs de l'audience</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {VALUE_OPTIONS.map((value) => (
                            <FormField
                              key={value}
                              control={form.control}
                              name="values"
                              render={({ field }) => (
                                <FormItem key={value} className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, value])
                                          : field.onChange(field.value?.filter((v) => v !== value));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">{value}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CTA */}
                  <FormField
                    control={form.control}
                    name="cta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call-to-Action</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CTA_OPTIONS.map((cta) => (
                              <SelectItem key={cta} value={cta}>{cta}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Formats */}
                  <FormField
                    control={form.control}
                    name="formats"
                    render={() => (
                      <FormItem>
                        <FormLabel>Format(s)</FormLabel>
                        <div className="space-y-2">
                          {FORMAT_OPTIONS.map((format) => (
                            <FormField
                              key={format.value}
                              control={form.control}
                              name="formats"
                              render={({ field }) => (
                                <FormItem key={format.value} className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(format.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, format.value])
                                          : field.onChange(field.value?.filter((v) => v !== format.value));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">{format.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full" disabled={!canGenerate || products.length === 0}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer la Campagne (2 crédits)
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeMode === 'campaign' && step === 'generating' && (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-gradient">Création en cours...</CardTitle>
              <CardDescription>Notre IA crée vos publicités personnalisées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{progressMessage}</p>
              </div>
              <Progress value={progress} className="w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {activeMode === 'campaign' && step === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Vos Publicités</h2>
              <p className="text-sm text-muted-foreground">
                3 variantes générées pour "{productMode === 'manual' ? manualProductName : selectedProduct?.name}"
              </p>
            </div>
            <Button variant="outline" onClick={resetForm}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Nouvelle Campagne
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generatedVariants.map((variant) => (
              <VariantCard
                key={variant.variant}
                variant={variant}
                format={form.getValues('formats')[0] || 'instagram_post'}
                onCopyText={() => copyTextToClipboard(variant)}
                onDownloadImage={() => downloadImage(variant)}
                isDownloading={isDownloading === variant.variant}
                uploadedProductImage={uploadedImage || undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Popup */}
      <AlertDialog open={showUpgradePopup} onOpenChange={setShowUpgradePopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Crédits insuffisants!</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez besoin de 2 crédits pour générer une campagne marketing.
              Passez à un plan supérieur pour continuer.
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
    </>
  );
}
