'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Sparkles, ImageIcon, Zap, Bell, Check, Copy,
  RefreshCw, ChevronDown, Loader2, BarChart2, Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  generateFacebookPosts, type FacebookPostOutput,
  generateFacebookPoll,   type FacebookPollOutput,
  generateFacebookFlash,  type FacebookFlashOutput,
} from '@/ai/flows/generate-facebook-content';

const PRODUCT_TYPES = [
  'Parfum', 'Cosmétique', 'Soin visage', 'Soin corps', 'Maquillage',
  'Accessoire mode', 'Vêtement', 'Maison / Déco', 'Alimentation', 'Autre',
];

type Tab = 'posts' | 'sondage' | 'flash';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-muted-foreground/50 font-normal"> ({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer pr-8"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function ResultRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground/80 leading-snug">{text}</p>
      </div>
      <CopyButton text={text} />
    </div>
  );
}

function CaptionBlock({ text }: { text: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Légende complète</p>
        <CopyButton text={text} />
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed bg-muted/30 rounded-lg p-3 whitespace-pre-line">{text}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-muted/30 rounded-2xl border border-border/50 border-dashed p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
        <Megaphone className="h-7 w-7 text-blue-500/50" />
      </div>
      <p className="font-semibold text-foreground/50">{label}</p>
      <p className="text-sm text-muted-foreground/60 mt-1">Renseigne le produit et clique sur Générer</p>
    </div>
  );
}

function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-3 animate-pulse">
          <div className="h-3 bg-muted rounded-full w-1/4" />
          <div className="h-4 bg-muted rounded-full w-3/4" />
          <div className="h-3 bg-muted rounded-full w-full" />
          <div className="h-3 bg-muted rounded-full w-5/6" />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB — POSTS STANDARD
// ══════════════════════════════════════════════════════════════════════════════
function PostsTab() {
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('Parfum');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [keyBenefit, setKeyBenefit] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FacebookPostOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const output = await generateFacebookPosts({
        productName: productName.trim(), productType,
        brand: brand.trim() || undefined,
        price: price.trim() || undefined,
        keyBenefit: keyBenefit.trim() || undefined,
      });
      setResult(output);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const toneColors: Record<string, string> = {
    Viral:      'bg-orange-500/10 text-orange-600 border-orange-500/20',
    Chaleureux: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    Premium:    'bg-violet-500/10 text-violet-600 border-violet-500/20',
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Formulaire */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-bold text-lg text-foreground">Ton produit</h2>

        {/* Image upload */}
        <label className="block cursor-pointer group">
          <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border h-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Aperçu produit" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold">Changer l&apos;image</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-blue-400/40 rounded-xl p-5 text-center bg-blue-500/3 hover:bg-blue-500/6 hover:border-blue-400/60 transition-all">
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-foreground/70">Clique pour ajouter une photo</p>
                <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP — visuel de référence</p>
              </div>
            </div>
          )}
        </label>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">ou saisis manuellement</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Field label="Nom du produit" required>
          <TextInput value={productName} onChange={setProductName} placeholder="ex: Lattafa Asad Eau de Parfum 100ml" />
        </Field>
        <Field label="Type de produit">
          <SelectInput value={productType} onChange={setProductType} options={PRODUCT_TYPES} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marque" hint="optionnel">
            <TextInput value={brand} onChange={setBrand} placeholder="ex: Lattafa" />
          </Field>
          <Field label="Prix" hint="optionnel">
            <TextInput value={price} onChange={setPrice} placeholder="ex: 49€" />
          </Field>
        </div>
        <Field label="Message clé" hint="optionnel">
          <TextInput value={keyBenefit} onChange={setKeyBenefit} placeholder="ex: tenue 12h, clone Tom Ford, idée cadeau" />
        </Field>

        <Button onClick={handleGenerate} disabled={loading || !productName.trim()}
          className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération en cours…</>
                   : <><Sparkles className="mr-2 h-4 w-4" />Générer mes 3 posts Facebook</>}
        </Button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </motion.div>

      {/* Résultats */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {!result && !loading && <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EmptyState label="Tes 3 posts apparaîtront ici" /></motion.div>}
          {loading && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoadingSkeleton count={3} /></motion.div>}
          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-foreground">3 variantes générées</p>
                <button onClick={handleGenerate} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3 w-3" /> Regénérer
                </button>
              </div>
              {result.variants.map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5 space-y-3 hover:border-blue-400/40 transition-colors">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${toneColors[v.tone] ?? ''}`}>
                    <Zap className="h-3 w-3" />{v.tone}
                  </span>
                  <ResultRow label="Accroche image" text={v.headline} />
                  <ResultRow label="Sous-titre" text={v.subline} />
                  <CaptionBlock text={v.caption} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB — SONDAGE
// ══════════════════════════════════════════════════════════════════════════════
function SondageTab() {
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('Parfum');
  const [brand, setBrand] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FacebookPollOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const output = await generateFacebookPoll({
        productName: productName.trim(), productType,
        brand: brand.trim() || undefined,
        theme: theme.trim() || undefined,
      });
      setResult(output);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Formulaire */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-bold text-lg text-foreground">Ton produit</h2>

        <Field label="Nom du produit" required>
          <TextInput value={productName} onChange={setProductName} placeholder="ex: Lattafa Asad Eau de Parfum 100ml" />
        </Field>
        <Field label="Type de produit">
          <SelectInput value={productType} onChange={setProductType} options={PRODUCT_TYPES} />
        </Field>
        <Field label="Marque" hint="optionnel">
          <TextInput value={brand} onChange={setBrand} placeholder="ex: Lattafa" />
        </Field>
        <Field label="Thème souhaité" hint="optionnel">
          <TextInput value={theme} onChange={setTheme} placeholder="ex: saison, occasion, profil client" />
        </Field>

        <Button onClick={handleGenerate} disabled={loading || !productName.trim()}
          className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération en cours…</>
                   : <><BarChart2 className="mr-2 h-4 w-4" />Générer mon sondage</>}
        </Button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </motion.div>

      {/* Résultats */}
      <div>
        <AnimatePresence mode="wait">
          {!result && !loading && <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EmptyState label="Ton sondage apparaîtra ici" /></motion.div>}
          {loading && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoadingSkeleton count={1} /></motion.div>}
          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">Sondage généré</p>
                <button onClick={handleGenerate} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3 w-3" /> Regénérer
                </button>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5 space-y-4 hover:border-blue-400/40 transition-colors">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <BarChart2 className="h-3 w-3" />Sondage
                </span>

                <ResultRow label="Question" text={result.question} />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-xl p-3 border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Option A</p>
                    <p className="text-sm font-semibold text-foreground">{result.optionA}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3 border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Option B</p>
                    <p className="text-sm font-semibold text-foreground">{result.optionB}</p>
                  </div>
                </div>

                <CaptionBlock text={result.caption} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB — OFFRE FLASH
// ══════════════════════════════════════════════════════════════════════════════
function FlashTab() {
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('Parfum');
  const [brand, setBrand] = useState('');
  const [discountPercent, setDiscountPercent] = useState('30');
  const [originalPrice, setOriginalPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FacebookFlashOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const pct = parseInt(discountPercent, 10);
      const output = await generateFacebookFlash({
        productName: productName.trim(), productType,
        brand: brand.trim() || undefined,
        discountPercent: isNaN(pct) ? 30 : Math.min(80, Math.max(5, pct)),
        originalPrice: originalPrice.trim() || undefined,
        salePrice: salePrice.trim() || undefined,
        endDate: endDate.trim() || undefined,
      });
      setResult(output);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Formulaire */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-bold text-lg text-foreground">Ton produit &amp; offre</h2>

        <Field label="Nom du produit" required>
          <TextInput value={productName} onChange={setProductName} placeholder="ex: Lattafa Asad Eau de Parfum 100ml" />
        </Field>
        <Field label="Type de produit">
          <SelectInput value={productType} onChange={setProductType} options={PRODUCT_TYPES} />
        </Field>
        <Field label="Marque" hint="optionnel">
          <TextInput value={brand} onChange={setBrand} placeholder="ex: Lattafa" />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Réduction %">
            <input
              type="number" min={5} max={80} value={discountPercent}
              onChange={e => setDiscountPercent(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </Field>
          <Field label="Prix original" hint="optionnel">
            <TextInput value={originalPrice} onChange={setOriginalPrice} placeholder="ex: 89€" />
          </Field>
          <Field label="Prix soldé" hint="optionnel">
            <TextInput value={salePrice} onChange={setSalePrice} placeholder="ex: 62€" />
          </Field>
        </div>

        <Field label="Fin de l'offre" hint="optionnel">
          <TextInput value={endDate} onChange={setEndDate} placeholder="ex: ce soir minuit, dimanche" />
        </Field>

        <Button onClick={handleGenerate} disabled={loading || !productName.trim()}
          className="w-full h-11 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération en cours…</>
                   : <><Flame className="mr-2 h-4 w-4" />Générer mon offre flash</>}
        </Button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </motion.div>

      {/* Résultats */}
      <div>
        <AnimatePresence mode="wait">
          {!result && !loading && <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EmptyState label="Ton offre flash apparaîtra ici" /></motion.div>}
          {loading && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoadingSkeleton count={1} /></motion.div>}
          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">Offre flash générée</p>
                <button onClick={handleGenerate} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3 w-3" /> Regénérer
                </button>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5 space-y-4 hover:border-orange-400/40 transition-colors">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-orange-500/10 text-orange-600 border-orange-500/20">
                  <Flame className="h-3 w-3" />Offre Flash
                </span>

                <ResultRow label="Titre image" text={result.headline} />
                <ResultRow label="Ligne d'urgence" text={result.urgencyLine} />
                <CaptionBlock text={result.caption} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'posts',   label: 'Posts Standard', icon: <Megaphone className="h-3.5 w-3.5" />,  color: 'blue' },
  { id: 'sondage', label: 'Sondage',        icon: <BarChart2 className="h-3.5 w-3.5" />, color: 'blue' },
  { id: 'flash',   label: 'Offre Flash',    icon: <Flame className="h-3.5 w-3.5" />,     color: 'orange' },
];

export default function PubFacebookPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  return (
    <div className="bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-12 lg:pt-36 lg:pb-16">
        <div className="absolute inset-0 bg-dots opacity-[0.15] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[50%] bg-blue-500/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/20 mb-5">
              <Megaphone className="h-3.5 w-3.5" />
              Studio Ad Creator · Facebook &amp; Instagram
            </span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              Tes fiches produits{' '}
              <span className="text-gradient">transformées en pubs</span>
              {' '}qui convertissent.
            </h1>
            <p className="text-lg text-foreground/65 leading-relaxed max-w-xl mx-auto">
              Posts, sondages, offres flash — 3 formats pour engager ta communauté et vendre plus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs + Générateur */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">

          {/* Tab bar */}
          <div className="flex gap-2 mb-8 bg-muted/40 rounded-2xl p-1.5 w-fit mx-auto border border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? tab.id === 'flash'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'posts'   && <PostsTab />}
              {activeTab === 'sondage' && <SondageTab />}
              {activeTab === 'flash'   && <FlashTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Banner coming soon */}
      <section className="py-12 bg-blue-500/5 border-y border-blue-500/10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20 mb-3">
            <Bell className="h-3 w-3" /> Prochainement
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">Analyse IA de l&apos;image</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Tu peux déjà uploader ta photo comme référence. Bientôt, l&apos;IA lira ton image et remplira automatiquement le nom, la catégorie et les caractéristiques du produit.
          </p>
          <Link href="/signup">
            <Button variant="outline" size="sm" className="rounded-full border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
              <Bell className="mr-1.5 h-3.5 w-3.5" />
              Me prévenir au lancement
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA bas */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h3 className="font-headline text-2xl font-bold mb-3">Commence par générer ta fiche produit SEO</h3>
          <p className="text-foreground/60 text-sm mb-6">
            Woosenteur génère d&apos;abord la fiche structurée — titre, méta, slug, JSON-LD — puis la pub suit naturellement.
          </p>
          <Button asChild className="rounded-full px-8">
            <Link href="/signup">
              <Sparkles className="mr-2 h-4 w-4" />
              Essai gratuit — 5 fiches offertes
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
