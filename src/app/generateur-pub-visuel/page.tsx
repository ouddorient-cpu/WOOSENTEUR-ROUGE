'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon, Sparkles, Download, Share2, Loader2, RefreshCw,
  Copy, Check, ChevronDown, Wand2, SplitSquareHorizontal, Facebook, Linkedin,
  Smartphone, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { recognizeDupePerfume } from '@/ai/flows/recognize-dupe-perfume';
import { generateVisualAdText } from '@/ai/flows/generate-visual-ad-text';
import {
  createTopTextOverlay,
  createSplitAdCanvas,
  type VisualAdFormat,
} from '@/lib/canvas-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'social' | 'split' | 'facebook' | 'linkedin';

const FB_COLORS = [
  { name: 'Noir',        value: '#0a0a0f' },
  { name: 'Bleu marine', value: '#0f1e3c' },
  { name: 'Bordeaux',    value: '#4a0a0a' },
  { name: 'Violet',      value: '#2d1b5e' },
  { name: 'Vert foncé',  value: '#0a2a1a' },
  { name: 'Orange',      value: '#7a2e00' },
  { name: 'Rose foncé',  value: '#5e0a3a' },
  { name: 'Gris ardoise',value: '#1c2333' },
];

const FB_FONT_SIZES = [
  { label: 'XL',   value: 52 },
  { label: 'XXL',  value: 68 },
  { label: 'XXXL', value: 84 },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function UploadZone({
  preview, onChange, label, hint,
}: {
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  hint?: string;
}) {
  return (
    <label className="block cursor-pointer group">
      {label && <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</span>}
      <input type="file" accept="image/*" className="sr-only" onChange={onChange} />
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border h-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Changer l&apos;image</span>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-primary/30 rounded-xl p-5 text-center bg-primary/3 hover:bg-primary/6 hover:border-primary/50 transition-all h-36 flex flex-col items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ImageIcon className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground/70">{hint ?? 'Clique pour ajouter une photo'}</p>
          <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP</p>
        </div>
      )}
    </label>
  );
}

function LineInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
    />
  );
}

// ─── Share helpers ────────────────────────────────────────────────────────────

async function shareOrDownload(dataUrl: string, filename: string, platform: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Pub ${platform}` });
      return;
    } catch {
      // fallback to download
    }
  }

  // Fallback: download + toast
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GenerateurPubVisuelPage() {
  const [activeTab, setActiveTab] = useState<Tab>('social');

  // ── Social tab state ──────────────────────────────────────────────────────
  const [socialImage, setSocialImage]     = useState<string | null>(null);
  const [socialFormat, setSocialFormat]   = useState<VisualAdFormat>('story');
  const [socialLine1, setSocialLine1]     = useState('Tu aimes Tuxedo de YSL ?');
  const [socialLine2, setSocialLine2]     = useState('Mais pas son prix +300€ ?');
  const [socialLine3, setSocialLine3]     = useState("J'ai la solution pour TOI");
  const [socialOrigName, setSocialOrigName]   = useState('');
  const [socialOrigBrand, setSocialOrigBrand] = useState('');
  const [socialOrigPrice, setSocialOrigPrice] = useState('');
  const [socialDupeName, setSocialDupeName]   = useState('');
  const [socialDupeBrand, setSocialDupeBrand] = useState('');
  const [socialDupePrice, setSocialDupePrice] = useState('');
  const [socialCanvasUrl, setSocialCanvasUrl] = useState<string | null>(null);
  const [socialAiLoading, setSocialAiLoading] = useState(false);
  const [socialError, setSocialError]         = useState<string | null>(null);

  // ── Split tab state ───────────────────────────────────────────────────────
  const [splitLeftImage,   setSplitLeftImage]   = useState<string | null>(null);
  const [splitRightImage,  setSplitRightImage]  = useState<string | null>(null);
  const [splitLine1, setSplitLine1] = useState('Tu aimes Tuxedo de YSL ?');
  const [splitLine2, setSplitLine2] = useState('Mais pas son prix +300€ ?');
  const [splitLine3, setSplitLine3] = useState("J'ai la solution pour TOI");
  const [splitOrigName,  setSplitOrigName]  = useState('');
  const [splitOrigBrand, setSplitOrigBrand] = useState('');
  const [splitOrigPrice, setSplitOrigPrice] = useState('');
  const [splitDupeName,  setSplitDupeName]  = useState('');
  const [splitDupeBrand, setSplitDupeBrand] = useState('');
  const [splitVsBadge,   setSplitVsBadge]   = useState(true);
  const [splitCanvasUrl, setSplitCanvasUrl] = useState<string | null>(null);
  const [splitAiLoading, setSplitAiLoading] = useState(false);
  const [splitError,     setSplitError]     = useState<string | null>(null);

  // ── Facebook tab state ────────────────────────────────────────────────────
  const [fbBgColor,    setFbBgColor]    = useState(FB_COLORS[0].value);
  const [fbFontSize,   setFbFontSize]   = useState(68);
  const [fbHook,       setFbHook]       = useState('T\'as déjà voulu sentir le luxe sans te ruiner ?');
  const [fbProp,       setFbProp]       = useState('Notre sélection de dupes haut de gamme sent aussi bon, pour 5× moins cher.');
  const [fbCta,        setFbCta]        = useState('Découvrir maintenant →');
  const [fbAiLoading,  setFbAiLoading]  = useState(false);
  const [fbOrigName,   setFbOrigName]   = useState('');
  const [fbOrigPrice,  setFbOrigPrice]  = useState('');
  const [fbDupeName,   setFbDupeName]   = useState('');
  const [fbDupePrice,  setFbDupePrice]  = useState('');
  const [fbError,      setFbError]      = useState<string | null>(null);

  // ── LinkedIn tab state ────────────────────────────────────────────────────
  const [liImage,     setLiImage]     = useState<string | null>(null);
  const [liTitle,     setLiTitle]     = useState('');
  const [liBody,      setLiBody]      = useState('');
  const [liCaption,   setLiCaption]   = useState('');
  const [liAiLoading, setLiAiLoading] = useState(false);
  const [liOrigName,  setLiOrigName]  = useState('');
  const [liDupeName,  setLiDupeName]  = useState('');
  const [liError,     setLiError]     = useState<string | null>(null);

  // ── Canvas refs ───────────────────────────────────────────────────────────
  const socialCanvasRef = useRef<HTMLCanvasElement>(null);
  const splitCanvasRef  = useRef<HTMLCanvasElement>(null);

  // ── File input handlers ───────────────────────────────────────────────────
  const readFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Canvas render helpers ─────────────────────────────────────────────────

  const renderSocialCanvas = useCallback(async () => {
    if (!socialImage) return;
    try {
      const url = await createTopTextOverlay(
        socialImage,
        [socialLine1, socialLine2, socialLine3].filter(Boolean),
        socialFormat
      );
      setSocialCanvasUrl(url);
    } catch {
      // silent
    }
  }, [socialImage, socialLine1, socialLine2, socialLine3, socialFormat]);

  const renderSplitCanvas = useCallback(async () => {
    if (!splitLeftImage || !splitRightImage) return;
    try {
      const url = await createSplitAdCanvas(
        splitLeftImage,
        splitRightImage,
        [splitLine1, splitLine2, splitLine3].filter(Boolean),
        splitVsBadge,
        'square'
      );
      setSplitCanvasUrl(url);
    } catch {
      // silent
    }
  }, [splitLeftImage, splitRightImage, splitLine1, splitLine2, splitLine3, splitVsBadge]);

  // Auto-render when inputs change
  useEffect(() => { renderSocialCanvas(); }, [renderSocialCanvas]);
  useEffect(() => { renderSplitCanvas(); }, [renderSplitCanvas]);

  // ── AI actions ────────────────────────────────────────────────────────────

  const handleSocialAi = async () => {
    setSocialAiLoading(true);
    setSocialError(null);
    try {
      const result = await generateVisualAdText({
        platform: 'social',
        originalName:  socialOrigName  || undefined,
        originalBrand: socialOrigBrand || undefined,
        originalPrice: socialOrigPrice || undefined,
        dupeName:      socialDupeName  || undefined,
        dupeBrand:     socialDupeBrand || undefined,
        dupePrice:     socialDupePrice || undefined,
      });
      if (result.line1) setSocialLine1(result.line1);
      if (result.line2) setSocialLine2(result.line2);
      if (result.line3) setSocialLine3(result.line3);
    } catch (e: unknown) {
      setSocialError(e instanceof Error ? e.message : 'Erreur de génération.');
    } finally {
      setSocialAiLoading(false);
    }
  };

  const handleSplitAiRecognize = async () => {
    if (!splitLeftImage) { setSplitError('Upload d\'abord l\'image du parfum original.'); return; }
    setSplitAiLoading(true);
    setSplitError(null);
    try {
      const result = await recognizeDupePerfume({
        originalImageDataUri: splitLeftImage,
        dupeImageDataUri:     splitRightImage || undefined,
        manualOriginalName:   splitOrigName   || undefined,
        manualDupeName:       splitDupeName   || undefined,
      });
      setSplitOrigName(result.originalName);
      setSplitOrigBrand(result.originalBrand);
      setSplitOrigPrice(result.estimatedPrice);
      setSplitDupeName(result.dupeName);
      setSplitDupeBrand(result.dupeBrand);
      setSplitLine1(result.line1);
      setSplitLine2(result.line2);
      setSplitLine3(result.line3);
    } catch (e: unknown) {
      setSplitError(e instanceof Error ? e.message : 'Erreur de reconnaissance.');
    } finally {
      setSplitAiLoading(false);
    }
  };

  const handleFbAi = async () => {
    setFbAiLoading(true);
    setFbError(null);
    try {
      const result = await generateVisualAdText({
        platform: 'facebook',
        originalName:  fbOrigName  || undefined,
        originalPrice: fbOrigPrice || undefined,
        dupeName:      fbDupeName  || undefined,
        dupePrice:     fbDupePrice || undefined,
      });
      if (result.fbHook)        setFbHook(result.fbHook);
      if (result.fbProposition) setFbProp(result.fbProposition);
      if (result.fbCta)         setFbCta(result.fbCta);
    } catch (e: unknown) {
      setFbError(e instanceof Error ? e.message : 'Erreur de génération.');
    } finally {
      setFbAiLoading(false);
    }
  };

  const handleLinkedinAi = async () => {
    setLiAiLoading(true);
    setLiError(null);
    try {
      const result = await generateVisualAdText({
        platform: 'linkedin',
        originalName: liOrigName || undefined,
        dupeName:     liDupeName || undefined,
      });
      if (result.linkedinTitle)   setLiTitle(result.linkedinTitle);
      if (result.linkedinBody)    setLiBody(result.linkedinBody);
      if (result.linkedinCaption) setLiCaption(result.linkedinCaption);
    } catch (e: unknown) {
      setLiError(e instanceof Error ? e.message : 'Erreur de génération.');
    } finally {
      setLiAiLoading(false);
    }
  };

  // ── Download helpers ──────────────────────────────────────────────────────

  const downloadCanvas = (url: string | null, name: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  const copyAll = (texts: string[]) => {
    navigator.clipboard.writeText(texts.filter(Boolean).join('\n\n'));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-10 lg:pt-36 lg:pb-12">
        <div className="absolute inset-0 bg-dots opacity-[0.12] pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-violet-500/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 px-4 py-1.5 rounded-full text-sm font-bold border border-violet-500/20 mb-5">
              <Wand2 className="h-3.5 w-3.5" />
              Studio Pub Visuel · TikTok · Snap · Insta · Facebook · LinkedIn
            </span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              Génère tes{' '}
              <span className="text-gradient">visuels publicitaires</span>
              {' '}en 30 secondes.
            </h1>
            <p className="text-lg text-foreground/65 leading-relaxed max-w-xl mx-auto">
              Upload ton image — l&apos;IA colle le texte dessus automatiquement.
              Format dupe, split comparaison, Facebook ou article LinkedIn.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">

          {/* Tab nav */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {([
              { id: 'social',    icon: Smartphone,           label: 'TikTok / Snap / Insta' },
              { id: 'split',     icon: SplitSquareHorizontal, label: 'Split Comparaison' },
              { id: 'facebook',  icon: Facebook,              label: 'Facebook' },
              { id: 'linkedin',  icon: Linkedin,              label: 'LinkedIn' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 1 — SOCIAL (TikTok / Snap / Insta)                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                {/* Form */}
                <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="font-bold text-lg">Image + Texte Overlay</h2>

                  {/* Format */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Format</label>
                    <div className="flex gap-2">
                      {([
                        { value: 'story',     label: 'Story 9:16' },
                        { value: 'square',    label: 'Carré 1:1' },
                        { value: 'landscape', label: 'Paysage 16:9' },
                      ] as const).map(f => (
                        <button
                          key={f.value}
                          onClick={() => setSocialFormat(f.value)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            socialFormat === f.value
                              ? 'bg-primary/10 text-primary border-primary/40'
                              : 'bg-background text-muted-foreground border-border hover:border-primary/30'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload */}
                  <UploadZone
                    preview={socialImage}
                    onChange={e => readFile(e, setSocialImage)}
                    label="Image produit"
                    hint="Clique pour uploader ton image"
                  />

                  {/* Product info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Produit original</label>
                      <input type="text" value={socialOrigName} onChange={e => setSocialOrigName(e.target.value)}
                        placeholder="ex: Tuxedo YSL"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Son prix (€)</label>
                      <input type="text" value={socialOrigPrice} onChange={e => setSocialOrigPrice(e.target.value)}
                        placeholder="ex: 300"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ton équivalent</label>
                      <input type="text" value={socialDupeName} onChange={e => setSocialDupeName(e.target.value)}
                        placeholder="ex: Tudor Pendora"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ton prix (€)</label>
                      <input type="text" value={socialDupePrice} onChange={e => setSocialDupePrice(e.target.value)}
                        placeholder="ex: 49"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                  </div>

                  {/* AI button */}
                  <Button
                    onClick={handleSocialAi}
                    disabled={socialAiLoading}
                    variant="outline"
                    className="w-full h-10 rounded-full border-violet-500/40 text-violet-600 hover:bg-violet-500/10"
                  >
                    {socialAiLoading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération en cours…</>
                      : <><Sparkles className="mr-2 h-4 w-4" />L&apos;IA génère le texte</>
                    }
                  </Button>

                  {socialError && (
                    <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-lg p-3">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {socialError}
                    </div>
                  )}

                  {/* Text lines */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground block">Texte à afficher sur l&apos;image</label>
                    <LineInput value={socialLine1} onChange={setSocialLine1} placeholder="Ligne 1 — ex: Tu aimes Tuxedo de YSL ?" />
                    <LineInput value={socialLine2} onChange={setSocialLine2} placeholder="Ligne 2 — ex: Mais pas son prix +300€ ?" />
                    <LineInput value={socialLine3} onChange={setSocialLine3} placeholder="Ligne 3 — ex: J'ai la solution pour TOI" />
                  </div>

                  {/* Apply button */}
                  <Button
                    onClick={renderSocialCanvas}
                    disabled={!socialImage}
                    className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/20 disabled:opacity-40"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Appliquer sur l&apos;image
                  </Button>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  {socialCanvasUrl ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={socialCanvasUrl}
                        alt="Aperçu pub"
                        className="w-full rounded-2xl border border-border shadow-xl"
                        style={{ maxHeight: '600px', objectFit: 'contain' }}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => downloadCanvas(socialCanvasUrl, 'pub-social.png')}
                          className="flex-1 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                        >
                          <Download className="mr-2 h-4 w-4" /> Télécharger PNG
                        </Button>
                        <Button
                          onClick={() => shareOrDownload(socialCanvasUrl, 'pub-social.png', 'TikTok/Insta')}
                          variant="outline"
                          className="flex-1 h-10 rounded-full"
                        >
                          <Share2 className="mr-2 h-4 w-4" /> Partager
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => shareOrDownload(socialCanvasUrl, 'pub-tiktok.png', 'TikTok')}
                          className="flex-1 py-2 rounded-full text-xs font-bold bg-black text-white hover:bg-gray-900 transition-colors"
                        >
                          TikTok
                        </button>
                        <button
                          onClick={() => shareOrDownload(socialCanvasUrl, 'pub-instagram.png', 'Instagram')}
                          className="flex-1 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-opacity"
                        >
                          Instagram
                        </button>
                        <button
                          onClick={() => shareOrDownload(socialCanvasUrl, 'pub-snapchat.png', 'Snapchat')}
                          className="flex-1 py-2 rounded-full text-xs font-bold bg-yellow-400 text-black hover:bg-yellow-300 transition-colors"
                        >
                          Snapchat
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-muted/20 rounded-2xl border border-border/50 border-dashed p-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="h-8 w-8 text-violet-500/40" />
                      </div>
                      <p className="font-semibold text-foreground/40">L&apos;aperçu apparaîtra ici</p>
                      <p className="text-sm text-muted-foreground/50 mt-1">Upload une image + clique &quot;Appliquer&quot;</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 2 — SPLIT (Original vs Dupe)                               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'split' && (
              <motion.div
                key="split"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                {/* Form */}
                <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="font-bold text-lg">Format Split — Original vs Dupe</h2>

                  {/* Upload zones */}
                  <div className="grid grid-cols-2 gap-3">
                    <UploadZone
                      preview={splitLeftImage}
                      onChange={e => readFile(e, setSplitLeftImage)}
                      label="Parfum original (gauche)"
                      hint="Upload le luxe"
                    />
                    <UploadZone
                      preview={splitRightImage}
                      onChange={e => readFile(e, setSplitRightImage)}
                      label="Ton équivalent (droite)"
                      hint="Upload ton dupe"
                    />
                  </div>

                  {/* AI Recognize button */}
                  <Button
                    onClick={handleSplitAiRecognize}
                    disabled={splitAiLoading || !splitLeftImage}
                    className="w-full h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-40"
                  >
                    {splitAiLoading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reconnaissance en cours…</>
                      : <><Sparkles className="mr-2 h-4 w-4" />L&apos;IA identifie &amp; génère le texte</>
                    }
                  </Button>

                  {splitError && (
                    <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-lg p-3">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {splitError}
                    </div>
                  )}

                  {/* Identified info */}
                  {(splitOrigName || splitDupeName) && (
                    <div className="bg-orange-500/6 border border-orange-500/20 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Résultat IA</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Original :</span>
                          <p className="font-semibold text-foreground">{splitOrigName} {splitOrigBrand && `(${splitOrigBrand})`}</p>
                          {splitOrigPrice && <p className="text-muted-foreground">~{splitOrigPrice}€</p>}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Équivalent :</span>
                          <p className="font-semibold text-foreground">{splitDupeName} {splitDupeBrand && `(${splitDupeBrand})`}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual overrides */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Parfum original</label>
                      <input type="text" value={splitOrigName} onChange={e => setSplitOrigName(e.target.value)}
                        placeholder="ex: Tuxedo YSL"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Prix original (€)</label>
                      <input type="text" value={splitOrigPrice} onChange={e => setSplitOrigPrice(e.target.value)}
                        placeholder="ex: 300"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ton équivalent</label>
                      <input type="text" value={splitDupeName} onChange={e => setSplitDupeName(e.target.value)}
                        placeholder="ex: Tudor Pendora"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Marque équivalent</label>
                      <input type="text" value={splitDupeBrand} onChange={e => setSplitDupeBrand(e.target.value)}
                        placeholder="ex: Pendora Scents"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                  </div>

                  {/* Text lines */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground block">Texte affiché en haut</label>
                    <LineInput value={splitLine1} onChange={setSplitLine1} placeholder="Ligne 1" />
                    <LineInput value={splitLine2} onChange={setSplitLine2} placeholder="Ligne 2" />
                    <LineInput value={splitLine3} onChange={setSplitLine3} placeholder="Ligne 3" />
                  </div>

                  {/* VS badge toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setSplitVsBadge(!splitVsBadge)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${splitVsBadge ? 'bg-orange-500' : 'bg-border'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${splitVsBadge ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium">Afficher le badge &quot;VS&quot; au centre</span>
                  </label>

                  {/* Apply */}
                  <Button
                    onClick={renderSplitCanvas}
                    disabled={!splitLeftImage || !splitRightImage}
                    className="w-full h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-40"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Générer le visuel split
                  </Button>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  {splitCanvasUrl ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={splitCanvasUrl}
                        alt="Aperçu split"
                        className="w-full rounded-2xl border border-border shadow-xl"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadCanvas(splitCanvasUrl, 'pub-split.png')}
                          className="flex-1 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                        >
                          <Download className="mr-2 h-4 w-4" /> Télécharger
                        </Button>
                        <Button
                          onClick={() => shareOrDownload(splitCanvasUrl, 'pub-split.png', 'Split')}
                          variant="outline"
                          className="flex-1 h-10 rounded-full"
                        >
                          <Share2 className="mr-2 h-4 w-4" /> Partager
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => shareOrDownload(splitCanvasUrl, 'split-tiktok.png', 'TikTok')}
                          className="flex-1 py-2 rounded-full text-xs font-bold bg-black text-white hover:bg-gray-900 transition-colors"
                        >
                          TikTok
                        </button>
                        <button
                          onClick={() => shareOrDownload(splitCanvasUrl, 'split-insta.png', 'Instagram')}
                          className="flex-1 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                        >
                          Instagram
                        </button>
                        <button
                          onClick={() => shareOrDownload(splitCanvasUrl, 'split-snap.png', 'Snapchat')}
                          className="flex-1 py-2 rounded-full text-xs font-bold bg-yellow-400 text-black hover:bg-yellow-300"
                        >
                          Snapchat
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-muted/20 rounded-2xl border border-border/50 border-dashed p-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                        <SplitSquareHorizontal className="h-8 w-8 text-orange-500/40" />
                      </div>
                      <p className="font-semibold text-foreground/40">Le visuel split apparaîtra ici</p>
                      <p className="text-sm text-muted-foreground/50 mt-1">Upload 2 images + clique &quot;Générer&quot;</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 3 — FACEBOOK                                               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'facebook' && (
              <motion.div
                key="facebook"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                {/* Form */}
                <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="font-bold text-lg">Facebook — Texte sur fond uni</h2>

                  {/* Color picker */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Couleur de fond</label>
                    <div className="flex flex-wrap gap-2">
                      {FB_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setFbBgColor(c.value)}
                          title={c.name}
                          style={{ background: c.value }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${fbBgColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font size */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Taille du texte</label>
                    <div className="flex gap-2">
                      {FB_FONT_SIZES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setFbFontSize(s.value)}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                            fbFontSize === s.value
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/40'
                              : 'bg-background text-muted-foreground border-border hover:border-blue-400/30'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product info for AI */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Produit original</label>
                      <input type="text" value={fbOrigName} onChange={e => setFbOrigName(e.target.value)}
                        placeholder="ex: Bleu de Chanel"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Son prix (€)</label>
                      <input type="text" value={fbOrigPrice} onChange={e => setFbOrigPrice(e.target.value)}
                        placeholder="ex: 120"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ton équivalent</label>
                      <input type="text" value={fbDupeName} onChange={e => setFbDupeName(e.target.value)}
                        placeholder="ex: Lattafa Asad"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ton prix (€)</label>
                      <input type="text" value={fbDupePrice} onChange={e => setFbDupePrice(e.target.value)}
                        placeholder="ex: 39"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                  </div>

                  {/* AI generate */}
                  <Button
                    onClick={handleFbAi}
                    disabled={fbAiLoading}
                    variant="outline"
                    className="w-full h-10 rounded-full border-blue-500/40 text-blue-600 hover:bg-blue-500/10"
                  >
                    {fbAiLoading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération…</>
                      : <><Sparkles className="mr-2 h-4 w-4" />Générer avec l&apos;IA</>
                    }
                  </Button>

                  {fbError && (
                    <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-lg p-3">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {fbError}
                    </div>
                  )}

                  {/* Text fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Question d&apos;accroche</label>
                      <textarea
                        value={fbHook}
                        onChange={e => setFbHook(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                        placeholder="ex: T'as déjà voulu sentir le luxe sans te ruiner ?"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">La proposition</label>
                      <textarea
                        value={fbProp}
                        onChange={e => setFbProp(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                        placeholder="Notre sélection de dupes haut de gamme..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">CTA</label>
                      <input
                        type="text"
                        value={fbCta}
                        onChange={e => setFbCta(e.target.value)}
                        placeholder="ex: Découvrir maintenant →"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => copyAll([fbHook, fbProp, fbCta])}
                    variant="outline"
                    className="w-full h-10 rounded-full"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copier tout le texte
                  </Button>
                </div>

                {/* Facebook Preview */}
                <div className="space-y-4">
                  <div
                    style={{ background: fbBgColor }}
                    className="rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-6 min-h-[340px]"
                  >
                    {fbHook && (
                      <p
                        style={{ fontSize: `${fbFontSize}px`, lineHeight: 1.15 }}
                        className="text-white font-black text-center leading-tight tracking-tight"
                      >
                        {fbHook}
                      </p>
                    )}
                    {fbProp && (
                      <p
                        style={{ fontSize: `${Math.round(fbFontSize * 0.5)}px` }}
                        className="text-white/80 font-medium text-center"
                      >
                        {fbProp}
                      </p>
                    )}
                    {fbCta && (
                      <div
                        style={{ fontSize: `${Math.round(fbFontSize * 0.42)}px` }}
                        className="bg-white/15 border border-white/20 text-white font-bold px-6 py-3 rounded-full cursor-pointer hover:bg-white/20 transition-colors text-center"
                      >
                        {fbCta}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Copie ce texte et publie-le directement sur Facebook avec une image produit en fond.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 4 — LINKEDIN                                               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'linkedin' && (
              <motion.div
                key="linkedin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid lg:grid-cols-2 gap-8 items-start"
              >
                {/* Form */}
                <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="font-bold text-lg">LinkedIn — Article détaillé</h2>

                  <UploadZone
                    preview={liImage}
                    onChange={e => readFile(e, setLiImage)}
                    label="Image (optionnelle)"
                    hint="Upload une image produit"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Parfum / marque originale</label>
                      <input type="text" value={liOrigName} onChange={e => setLiOrigName(e.target.value)}
                        placeholder="ex: Bleu de Chanel"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ton équivalent</label>
                      <input type="text" value={liDupeName} onChange={e => setLiDupeName(e.target.value)}
                        placeholder="ex: Lattafa Asad"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                  </div>

                  <Button
                    onClick={handleLinkedinAi}
                    disabled={liAiLoading}
                    variant="outline"
                    className="w-full h-10 rounded-full border-blue-700/40 text-blue-700 hover:bg-blue-700/10"
                  >
                    {liAiLoading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération de l&apos;article…</>
                      : <><Sparkles className="mr-2 h-4 w-4" />Générer l&apos;article avec l&apos;IA</>
                    }
                  </Button>

                  {liError && (
                    <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-lg p-3">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {liError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Titre de l&apos;article</label>
                        {liTitle && <CopyButton text={liTitle} />}
                      </div>
                      <input
                        type="text"
                        value={liTitle}
                        onChange={e => setLiTitle(e.target.value)}
                        placeholder="ex: Le parfum de luxe est-il vraiment supérieur ?"
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Corps de l&apos;article</label>
                        {liBody && <CopyButton text={liBody} />}
                      </div>
                      <textarea
                        value={liBody}
                        onChange={e => setLiBody(e.target.value)}
                        rows={8}
                        placeholder="L'article généré par l'IA apparaîtra ici. Tu peux aussi écrire directement."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Légende image</label>
                        {liCaption && <CopyButton text={liCaption} />}
                      </div>
                      <input
                        type="text"
                        value={liCaption}
                        onChange={e => setLiCaption(e.target.value)}
                        placeholder="ex: Lattafa Asad — la réponse au luxe accessible."
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => copyAll([liTitle, liBody, liCaption])}
                    disabled={!liTitle && !liBody}
                    className="w-full h-11 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold disabled:opacity-40"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copier tout pour LinkedIn
                  </Button>
                </div>

                {/* LinkedIn Preview */}
                <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                  {/* LinkedIn-style header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Abderrahman El Malki</p>
                      <p className="text-xs text-muted-foreground">Entrepreneur E-commerce · DubaiNegocé</p>
                    </div>
                  </div>

                  {/* Image */}
                  {liImage && (
                    <div className="relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={liImage} alt="Post" className="w-full h-full object-cover" />
                      {liCaption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-xs font-medium">{liCaption}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {liTitle && (
                      <p className="font-bold text-foreground leading-tight">{liTitle}</p>
                    )}
                    {liBody ? (
                      <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line line-clamp-6">
                        {liBody}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">
                        L&apos;article généré par l&apos;IA apparaîtra ici…
                      </p>
                    )}
                  </div>

                  {/* LinkedIn actions bar */}
                  <div className="flex items-center justify-around border-t border-border p-2 text-xs text-muted-foreground">
                    <span>👍 J&apos;aime</span>
                    <span>💬 Commenter</span>
                    <span>↩️ Republier</span>
                    <span>✉️ Envoyer</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
