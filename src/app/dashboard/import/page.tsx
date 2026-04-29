
'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2, Sparkles, AlertCircle, CheckCircle2, FileUp, ListChecks,
    Download, Clock, Trash2, RefreshCw, Calendar, History, Filter, Keyboard, ShoppingCart,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateSeoOptimizedProductDescription } from '@/ai/flows/generate-seo-optimized-product-description';
import {
    saveProduct, decrementCredits, checkDailyImportQuota, incrementDailyImportCount,
    DAILY_IMPORT_MAX, IMPORT_BATCH_MAX, QUICK_ENTRY_MAX, saveImportHistory, getImportHistory,
} from '@/lib/firebase-helpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { useDoc } from '@/firebase';
import type { UserProfile, ImportRecord } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type CsvRow = {
    productName: string;
    brand: string;
    category: 'Parfum' | 'Soin' | 'Cosmétique' | "parfum d'intérieur";
    weight: string;
    price?: string;
    imageUrl?: string;
};

type ProcessedRow = CsvRow & {
    id: number;
    status: 'pending' | 'processing' | 'success' | 'error';
    errorMessage?: string;
    isValid: boolean;
    validationErrors: string[];
    generatedSeo?: any;        // Stocke le résultat SEO pour le CSV WooCommerce enrichi
    originalRowData?: string[]; // Ligne originale du CSV WooCommerce (pour reconstruction)
};

type Step = 'upload' | 'preview' | 'processing' | 'complete' | 'history';
type UploadTab = 'parfums' | 'quick' | 'woo' | 'csv';

type WooPublishResult = {
  succeeded: { id: number; name: string; permalink: string }[];
  failed: { name: string; error: string }[];
  total: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_CATEGORIES: string[] = ['Parfum', 'Soin', 'Cosmétique', "parfum d'intérieur"];

// Marques détectées automatiquement depuis le nom du produit
const KNOWN_BRANDS: { name: string; keywords: string[] }[] = [
  { name: 'Lattafa', keywords: ['lattafa'] },
  { name: 'Maison Alhambra', keywords: ['maison alhambra'] },
  { name: 'Alhambra', keywords: ['alhambra'] },
  { name: 'Fragrance World', keywords: ['fragrance world'] },
  { name: 'Paris Corner', keywords: ['paris corner'] },
  { name: 'Pendora', keywords: ['pendora'] },
  { name: 'Nasomatto', keywords: ['nasomatto'] },
  { name: 'Jean Lowe', keywords: ['jean lowe'] },
  { name: 'Jean Couturier', keywords: ['jean couturier'] },
  { name: 'Dior', keywords: ['christian dior', ' dior', 'sauvage', 'j\'adore', 'miss dior'] },
  { name: 'Chanel', keywords: ['chanel', 'coco mademoiselle', 'n°5', 'bleu de chanel', 'chance'] },
  { name: 'Tom Ford', keywords: ['tom ford'] },
  { name: 'YSL', keywords: ['yves saint laurent', 'ysl', 'saint laurent', 'libre', 'opium', 'black opium'] },
  { name: 'Armani', keywords: ['giorgio armani', 'armani', 'acqua di gio', 'si '] },
  { name: 'Paco Rabanne', keywords: ['paco rabanne', 'rabanne', '1 million', 'lady million', 'invictus', 'olympea'] },
  { name: 'Jean Paul Gaultier', keywords: ['jean paul gaultier', 'gaultier', 'le male', 'scandal'] },
  { name: 'Versace', keywords: ['versace', 'eros', 'dylan', 'crystal noir'] },
  { name: 'Gucci', keywords: ['gucci', 'guilty', 'bloom', 'flora'] },
  { name: 'Hermès', keywords: ['hermès', 'hermes', 'terre d\'hermès', 'twilly', 'h24'] },
  { name: 'Burberry', keywords: ['burberry', 'brit ', 'her ', 'touch '] },
  { name: 'Hugo Boss', keywords: ['hugo boss', 'hugo ', 'boss '] },
  { name: 'Calvin Klein', keywords: ['calvin klein', 'ck one', 'eternity', 'obsession', 'euphoria'] },
  { name: 'Thierry Mugler', keywords: ['thierry mugler', 'mugler', 'angel', 'alien', 'aura'] },
  { name: 'Lancôme', keywords: ['lancôme', 'lancome', 'la vie est belle', 'trésor', 'idôle'] },
  { name: 'Givenchy', keywords: ['givenchy', 'irresistible', 'gentleman', 'pi '] },
  { name: 'Dolce & Gabbana', keywords: ['dolce', 'gabbana', 'd&g', 'light blue', 'the one'] },
  { name: 'Viktor & Rolf', keywords: ['viktor', 'flowerbomb', 'spicebomb', 'bonbon'] },
  { name: 'Montblanc', keywords: ['montblanc', 'mont blanc', 'legend'] },
  { name: 'Lacoste', keywords: ['lacoste'] },
  { name: 'Davidoff', keywords: ['davidoff', 'cool water', 'zino'] },
  { name: 'Azzaro', keywords: ['azzaro', 'chrome', 'wanted'] },
];

function detectBrand(productName: string): string {
  const lower = productName.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (brand.keywords.some(kw => lower.includes(kw))) return brand.name;
  }
  // Fallback: dernier mot si ça ressemble à une marque (commence par majuscule)
  const words = productName.trim().split(/\s+/);
  if (words.length >= 2) return words[words.length - 1];
  return 'Autre';
}

function parseParfumsEntry(text: string): ProcessedRow[] {
  const lines = text.split('\n');
  const result: ProcessedRow[] = [];
  let id = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Support format: "Nom du parfum | https://url-image.jpg"
    const pipeIdx = trimmed.indexOf('|');
    const name = (pipeIdx >= 0 ? trimmed.slice(0, pipeIdx) : trimmed).trim();
    const imageUrl = pipeIdx >= 0 ? trimmed.slice(pipeIdx + 1).trim() || undefined : undefined;
    if (!name) continue;
    const brand = detectBrand(name);
    const raw = {
      id: id++,
      productName: name,
      brand,
      category: 'Parfum' as CsvRow['category'],
      weight: '100',
      price: undefined,
      imageUrl,
      status: 'pending' as const,
      errorMessage: undefined,
    };
    const { isValid, validationErrors } = validateRow(raw);
    result.push({ ...raw, isValid, validationErrors });
  }
  return result.slice(0, QUICK_ENTRY_MAX);
}

function buildFreshWooCommerceCsv(products: ProcessedRow[]): string {
  const BOM = '\uFEFF';
  const escape = (v: unknown): string => {
    const s = String(v ?? '');
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const headers = [
    'ID', 'Type', 'SKU', 'Name', 'Published', 'Featured', 'Catalog visibility',
    'Short description', 'Description', 'Regular price',
    'Categories', 'Tags', 'Images',
    'Meta: rank_math_focus_keyword', 'Meta: rank_math_description', 'Meta: rank_math_title',
  ];

  const rows = products
    .filter(p => p.status === 'success' && p.generatedSeo)
    .map(p => {
      // generatedSeo = { success: true, data: SeoData }
      const seo = p.generatedSeo?.data ?? p.generatedSeo ?? {};
      return [
        '', 'simple', '',
        seo.productTitle || p.productName,
        '1', '0', 'visible',
        seo.shortDescription || '',
        seo.longDescription || '',
        p.price || '',
        'Parfums',
        seo.tags || '',
        p.imageUrl || '',
        seo.focusKeyword || '',
        seo.shortDescription || '',
        seo.productTitle || p.productName,
      ].map(escape).join(',');
    });

  return BOM + [headers.map(escape).join(','), ...rows].join('\n');
}

// ─── Validation helper ────────────────────────────────────────────────────────

function validateRow(row: Omit<ProcessedRow, 'isValid' | 'validationErrors'>, wooMode = false): { isValid: boolean; validationErrors: string[] } {
    const errors: string[] = [];
    if (!row.productName?.trim()) errors.push('Nom manquant');
    if (!wooMode && !row.brand?.trim()) errors.push('Marque manquante');
    if (!VALID_CATEGORIES.includes(row.category)) errors.push(`Catégorie invalide: "${row.category}"`);
    if (!wooMode && (!row.weight?.trim() || isNaN(parseFloat(row.weight)))) errors.push('Poids invalide');
    if (row.price && isNaN(parseFloat(row.price))) errors.push('Prix invalide');
    return { isValid: errors.length === 0, validationErrors: errors };
}

// ─── Fuzzy match catégorie ───────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, CsvRow['category']> = {
    'parfum': 'Parfum', 'fragrance': 'Parfum', 'cologne': 'Parfum', 'eau de': 'Parfum',
    'edp': 'Parfum', 'edt': 'Parfum', 'extrait': 'Parfum',
    'soin': 'Soin', 'creme': 'Soin', 'crème': 'Soin', 'serum': 'Soin', 'sérum': 'Soin',
    'hydrat': 'Soin', 'lotion': 'Soin', 'baume': 'Soin', 'masque': 'Soin',
    'huile': 'Soin', 'exfoliant': 'Soin', 'gommage': 'Soin',
    'cosmet': 'Cosmétique', 'makeup': 'Cosmétique', 'maquillage': 'Cosmétique',
    'mascara': 'Cosmétique', 'rouge': 'Cosmétique', 'fond de teint': 'Cosmétique',
    'fard': 'Cosmétique', 'crayon': 'Cosmétique', 'palette': 'Cosmétique',
    'blush': 'Cosmétique', 'gloss': 'Cosmétique',
    "interieur": "parfum d'intérieur", "intérieur": "parfum d'intérieur",
    'bougie': "parfum d'intérieur", 'diffuseur': "parfum d'intérieur",
    'ambiance': "parfum d'intérieur", 'home': "parfum d'intérieur",
};

function normalizeStr(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fuzzyMatchCategory(raw: string): CsvRow['category'] | '' {
    if ((VALID_CATEGORIES as string[]).includes(raw)) return raw as CsvRow['category'];
    const lower = normalizeStr(raw);
    for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
        if (lower.includes(normalizeStr(keyword))) return category;
    }
    return '';
}

// ─── Saisie Rapide — Parser ───────────────────────────────────────────────────

const QUICK_SEP_RE = /[,;|]/;

function parseQuickEntry(text: string): ProcessedRow[] {
    const lines = text.split('\n');
    const result: ProcessedRow[] = [];
    let id = 0;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(QUICK_SEP_RE).map(p => p.trim());
        const [productName = '', brand = '', categoryRaw = '', weight = '', price = ''] = parts;
        const category = (fuzzyMatchCategory(categoryRaw) || categoryRaw) as CsvRow['category'];
        const raw = {
            id: id++,
            productName, brand, category, weight,
            price: price || undefined,
            imageUrl: undefined,
            status: 'pending' as const,
            errorMessage: undefined,
        };
        const { isValid, validationErrors } = validateRow(raw);
        result.push({ ...raw, isValid, validationErrors });
    }
    return result.slice(0, QUICK_ENTRY_MAX);
}

// ─── WooCommerce CSV helpers ──────────────────────────────────────────────────

/** Parser CSV respectant les guillemets et les virgules dans les champs */
function parseCSVLine(line: string, delimiter = ','): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (ch === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

/** Parse un CSV WooCommerce natif (FR ou EN) */
function parseWooCommerceCsv(text: string): {
    products: ProcessedRow[];
    headers: string[];
    format: 'fr' | 'en';
    delimiter: ',' | ';';
    detectedCount: number;
} {
    // Retirer le BOM UTF-8 si présent
    const cleaned = text.replace(/^\uFEFF/, '');
    const lines = cleaned.split('\n').filter(l => l.trim());
    if (lines.length < 2) return { products: [], headers: [], format: 'fr', delimiter: ',', detectedCount: 0 };

    // Auto-détection du délimiteur (WooCommerce FR utilise ; WooCommerce EN utilise ,)
    const firstLine = lines[0];
    const delimiter = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';

    const headers = parseCSVLine(firstLine, delimiter);

    // Auto-détection FR vs EN
    const isFr = headers.some(h => h === 'Nom');
    const format: 'fr' | 'en' = isFr ? 'fr' : 'en';

    const FR_MAP: Record<string, string> = {
        name: 'Nom', brand: 'Marques', category: 'Catégories',
        weight: 'Poids (kg)', price: 'Tarif régulier', image: 'Images',
    };
    const EN_MAP: Record<string, string> = {
        name: 'Name', brand: 'Brands', category: 'Categories',
        weight: 'Weight (kg)', price: 'Regular price', image: 'Images',
    };
    const MAP = format === 'fr' ? FR_MAP : EN_MAP;

    const idx = (col: string) => {
        const i = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
        return i >= 0 ? i : -1;
    };
    const getByKey = (values: string[], key: string): string => {
        const colName = MAP[key];
        const i = idx(colName);
        return i >= 0 ? (values[i] ?? '') : '';
    };

    const products: ProcessedRow[] = lines.slice(1)
        .map((line, i) => {
            const values = parseCSVLine(line, delimiter);
            const name = getByKey(values, 'name');
            if (!name.trim()) return null;

            // Extraire URL depuis "https://... ! alt : Texte"
            const rawImage = getByKey(values, 'image');
            const imageUrl = rawImage.split(' !')[0].trim() || undefined;

            // Catégorie : fuzzy sur la colonne catégorie puis sur le nom
            const catRaw = getByKey(values, 'category');
            const category = (fuzzyMatchCategory(catRaw) || fuzzyMatchCategory(name) || 'Parfum') as CsvRow['category'];

            // Poids : WooCommerce stocke en kg, on garde tel quel
            const weight = getByKey(values, 'weight');
            const price = getByKey(values, 'price') || undefined;

            const raw = {
                id: i,
                productName: name,
                brand: getByKey(values, 'brand'),
                category,
                weight,
                price,
                imageUrl,
                status: 'pending' as const,
                errorMessage: undefined,
                originalRowData: values,
            };
            const { isValid, validationErrors } = validateRow(raw, true);
            return { ...raw, isValid, validationErrors };
        })
        .filter(Boolean) as ProcessedRow[];

    return { products, headers, format, delimiter, detectedCount: products.length };
}

/** Reconstruit le CSV WooCommerce en enrichissant les colonnes SEO */
function buildEnrichedWooCommerceCsv(
    headers: string[],
    products: ProcessedRow[],
    format: 'fr' | 'en',
    delimiter: ',' | ';' = ','
): string {
    const COLS_FR: Record<string, (p: ProcessedRow) => string> = {
        'Description courte': p => p.generatedSeo?.shortDescription ?? '',
        'Description': p => p.generatedSeo?.longDescription ?? '',
        'Étiquettes': p => p.generatedSeo?.tags ?? '',
        'Meta: rank_math_description': p => p.generatedSeo?.shortDescription ?? '',
        'Meta: rank_math_focus_keyword': p => p.generatedSeo?.focusKeyword ?? '',
        'Meta: rank_math_title': p => p.generatedSeo?.productTitle ?? '',
        'Meta: _woosenteur_generated_by': () => 'WooSenteur Agent',
    };
    const COLS_EN: Record<string, (p: ProcessedRow) => string> = {
        'Short description': p => p.generatedSeo?.shortDescription ?? '',
        'Description': p => p.generatedSeo?.longDescription ?? '',
        'Tags': p => p.generatedSeo?.tags ?? '',
        'Meta: rank_math_description': p => p.generatedSeo?.shortDescription ?? '',
        'Meta: rank_math_focus_keyword': p => p.generatedSeo?.focusKeyword ?? '',
        'Meta: rank_math_title': p => p.generatedSeo?.productTitle ?? '',
        'Meta: _woosenteur_generated_by': () => 'WooSenteur Agent',
    };
    const COLS = format === 'fr' ? COLS_FR : COLS_EN;

    const BOM = '﻿';
    const escape = (v: unknown): string => {
        const s = String(v ?? '');
        const needsQuote = s.includes(delimiter) || s.includes('"') || s.includes('\r') || s.includes('\n');
        return needsQuote ? '"' + s.replace(/"/g, '""') + '"' : s;
    };

    // Colonnes SEO absentes du fichier source : on les ajoute
    const existingSet = new Set(headers);
    const newCols = Object.keys(COLS).filter(col => !existingSet.has(col));
    const enrichedHeaders = [...headers, ...newCols];

    const headerLine = enrichedHeaders.map(escape).join(delimiter);
    const dataLines = products.map(p => {
        const row = [...(p.originalRowData ?? new Array(headers.length).fill(''))];
        while (row.length < headers.length) row.push('');

        if (p.status === 'success') {
            // Mettre à jour les colonnes existantes uniquement
            headers.forEach((h, i) => {
                const updater = COLS[h];
                if (updater) row[i] = updater(p);
            });
            // Ajouter les nouvelles colonnes SEO à la fin
            newCols.forEach(col => {
                const updater = COLS[col];
                row.push(updater ? updater(p) : '');
            });
        } else {
            newCols.forEach(() => row.push(''));
        }

        return row.map(escape).join(delimiter);
    });

    return BOM + [headerLine, ...dataLines].join('\n');
}


// ─── WooConnectionTest ───────────────────────────────────────────────────────

function WooConnectionTest({ user }: { user: any }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
    const [detail, setDetail] = useState('');

    const runTest = async () => {
        setStatus('loading');
        setDetail('');
        try {
            const token = await user.getIdToken(true);
            const res = await fetch('/api/woo/test', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.ok) {
                setStatus('ok');
                setDetail(`Connexion OK — WooCommerce ${data.wcVersion} · ${data.storeUrl}`);
            } else {
                setStatus('error');
                setDetail(`[${data.step}] ${data.error}${data.httpStatus ? ` (HTTP ${data.httpStatus})` : ''}${data.storeUrl ? ` — ${data.storeUrl}` : ''}`);
            }
        } catch (e: any) {
            setStatus('error');
            setDetail(e.message);
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            <button
                onClick={runTest}
                disabled={status === 'loading'}
                className="text-xs underline text-muted-foreground hover:text-foreground w-fit flex items-center gap-1"
            >
                {status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
                {status === 'loading' ? 'Test en cours...' : '🔌 Tester la connexion WooCommerce'}
            </button>
            {detail && (
                <p className={`text-xs px-2 py-1 rounded ${status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                    {detail}
                </p>
            )}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wooFileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<Step>('upload');
    const [products, setProducts] = useState<ProcessedRow[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [processingIndex, setProcessingIndex] = useState<number>(-1);

    // Upload tabs
    const [uploadTab, setUploadTab] = useState<UploadTab>('parfums');

    // WooCommerce mode
    const [wooMode, setWooMode] = useState(false);
    const [wooHeaders, setWooHeaders] = useState<string[]>([]);
    const [wooFormat, setWooFormat] = useState<'fr' | 'en'>('fr');
    const [wooDelimiter, setWooDelimiter] = useState<',' | ';'>(',');
    const [wooDetectedCount, setWooDetectedCount] = useState(0);
    const [wooFileName, setWooFileName] = useState('');
    const [isDraggingWoo, setIsDraggingWoo] = useState(false);

    // Mode Parfums (ultra-simple)
    const [parfumsText, setParfumsText] = useState('');
    const [parfumsMode, setParfumsMode] = useState(false);
    const [wooPublishing, setWooPublishing] = useState(false);
    const [wooPublishResult, setWooPublishResult] = useState<WooPublishResult | null>(null);
    const [parfumsImages, setParfumsImages] = useState<Record<number, string>>({});
    const [showImageTuto, setShowImageTuto] = useState(false);

    // Saisie Rapide
    const [quickEntryText, setQuickEntryText] = useState('');

    // CSV maison — Drag & Drop
    const [isDragging, setIsDragging] = useState(false);

    // Filter
    const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');

    // Import history
    const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Scheduled import
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [scheduledTime, setScheduledTime] = useState('');
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState('');
    const scheduleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const userProfilePath = user ? `users/${user.uid}` : null;
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

    const isSuperAdmin = useMemo(() => userProfile?.isUnlimited || userProfile?.role === 'superadmin', [userProfile]);
    const availableCredits = useMemo(() => userProfile?.creditBalance ?? 0, [userProfile]);
    const validProducts = useMemo(() => products.filter(p => p.isValid), [products]);
    const invalidProducts = useMemo(() => products.filter(p => !p.isValid), [products]);

    const filteredPreview = useMemo(() => {
        if (previewFilter === 'valid') return products.filter(p => p.isValid);
        if (previewFilter === 'invalid') return products.filter(p => !p.isValid);
        return products;
    }, [products, previewFilter]);

    const parfumsParsed = useMemo(() => parseParfumsEntry(parfumsText), [parfumsText]);
    const parfumsValid = useMemo(() => parfumsParsed.filter(p => p.isValid), [parfumsParsed]);

    const quickEntryParsed = useMemo(() => parseQuickEntry(quickEntryText), [quickEntryText]);
    const quickEntryValid = useMemo(() => quickEntryParsed.filter(p => p.isValid), [quickEntryParsed]);
    const quickEntryInvalid = useMemo(() => quickEntryParsed.filter(p => !p.isValid), [quickEntryParsed]);

    useEffect(() => {
        if (!userLoading && !user) router.push('/login');
    }, [user, userLoading, router]);

    useEffect(() => {
        if (!scheduledAt) return;
        const interval = setInterval(() => {
            const diff = scheduledAt.getTime() - Date.now();
            if (diff <= 0) { clearInterval(interval); setCountdown('Lancement...'); return; }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${m}m ${s.toString().padStart(2, '0')}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [scheduledAt]);

    useEffect(() => {
        return () => { if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current); };
    }, []);

    // ─── CSV maison ───────────────────────────────────────────────────────────

    const processFile = (file: File) => {
        setFileName(file.name);
        setPreviewFilter('all');
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const cleaned = text.replace(/^\uFEFF/, '');
            const lines = cleaned.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) return;

            // Auto-d\u00E9tection : si le CSV ressemble \u00E0 un export WooCommerce, on bascule
            const firstLine = lines[0];
            const delimiter = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
            const headers = parseCSVLine(firstLine, delimiter);
            const isWooExport = headers.some(h => h === 'Nom' || h === 'Name') &&
                headers.some(h => h === 'UGS' || h === 'SKU' || h === 'Cat\u00E9gories' || h === 'Categories');

            if (isWooExport) {
                processWooFile(file);
                return;
            }

            const requiredHeaders = ['productName', 'brand', 'category', 'weight'];
            if (!requiredHeaders.every(h => headers.includes(h))) {
                toast({
                    variant: 'destructive',
                    title: 'Erreur de format CSV',
                    description: `Le fichier doit contenir : ${requiredHeaders.join(', ')}`,
                });
                return;
            }
            const priceIndex = headers.indexOf('price');
            const imageUrlIndex = headers.indexOf('imageUrl');
            const parsedProducts: ProcessedRow[] = lines.slice(1)
                .map((line, index) => {
                    const values = parseCSVLine(line, delimiter);
                    const raw = {
                        id: index,
                        productName: values[headers.indexOf('productName')] || '',
                        brand: values[headers.indexOf('brand')] || '',
                        category: values[headers.indexOf('category')] as CsvRow['category'],
                        weight: values[headers.indexOf('weight')] || '',
                        price: priceIndex !== -1 ? values[priceIndex] : undefined,
                        imageUrl: imageUrlIndex !== -1 ? values[imageUrlIndex] || undefined : undefined,
                        status: 'pending' as const,
                        errorMessage: undefined,
                    };
                    const { isValid, validationErrors } = validateRow(raw);
                    return { ...raw, isValid, validationErrors };
                })
                .filter(p => p.productName || p.brand);
            setWooMode(false);
            setProducts(parsedProducts);
            setStep('preview');
        };
        reader.readAsText(file);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.name.endsWith('.csv')) {
            toast({ variant: 'destructive', title: 'Format invalide', description: 'Seuls les fichiers .csv sont acceptés.' });
            return;
        }
        processFile(file);
    };

    // ─── WooCommerce import ───────────────────────────────────────────────────

    const processWooFile = (file: File) => {
        setWooFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { products: parsed, headers, format, delimiter, detectedCount } = parseWooCommerceCsv(text);

            if (detectedCount === 0) {
                toast({
                    variant: 'destructive',
                    title: 'Format non reconnu',
                    description: 'Exportez votre catalogue depuis WooCommerce → Produits → Exporter, puis réessayez.',
                });
                return;
            }

            setWooHeaders(headers);
            setWooFormat(format);
            setWooDelimiter(delimiter as ',' | ';');
            setWooDetectedCount(detectedCount);
            setWooMode(true);
            setPreviewFilter('all');
            setFileName(`WooCommerce ${format.toUpperCase()} — ${file.name}`);
            setProducts(parsed);
            setStep('preview');
            toast({
                title: `Format WooCommerce ${format === 'fr' ? 'FR' : 'EN'} détecté`,
                description: `${detectedCount} produit${detectedCount > 1 ? 's' : ''} prêt${detectedCount > 1 ? 's' : ''} à enrichir.`,
            });
        };
        reader.readAsText(file);
    };

    const handleWooFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processWooFile(file);
    };

    const handleWooDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingWoo(true); };
    const handleWooDragLeave = () => setIsDraggingWoo(false);
    const handleWooDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDraggingWoo(false);
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.name.endsWith('.csv')) {
            toast({ variant: 'destructive', title: 'Format invalide', description: 'Seuls les fichiers .csv sont acceptés.' });
            return;
        }
        processWooFile(file);
    };

    const downloadEnrichedWooCommerceCsv = () => {
        const csv = buildEnrichedWooCommerceCsv(wooHeaders, products, wooFormat, wooDelimiter);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `woocommerce-enrichi-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ─── History ──────────────────────────────────────────────────────────────

    const loadHistory = async () => {
        if (!user) return;
        setHistoryLoading(true);
        try {
            const history = await getImportHistory(user.uid);
            setImportHistory(history);
        } catch { } finally {
            setHistoryLoading(false);
        }
    };

    // ─── Core batch runner ────────────────────────────────────────────────────

    const BATCH_SIZE = 3;
    const BATCH_DELAY_MS = 1500;

    const processProduct = async (product: ProcessedRow): Promise<void> => {
        if (!user) return;
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'processing' } : p));
        try {
            if (!isSuperAdmin) await decrementCredits(user.uid);
            const seoResult = await generateSeoOptimizedProductDescription({
                productName: product.productName,
                brand: product.brand,
                category: product.category,
                language: 'French',
                productMode: product.brand?.trim() ? 'marque-connue' : 'mon-produit',
            });
            if (!seoResult.success) throw new Error(seoResult.error);
            const seoData = seoResult.data;
            const newProductData: any = {
                name: product.productName,
                brand: product.brand,
                productType: product.category,
                weight: product.weight,
                userId: user.uid,
                seo: seoData,
            };
            if (product.price) newProductData.price = parseFloat(product.price);
            if (product.imageUrl) newProductData.imageUrl = product.imageUrl;
            await saveProduct(user.uid, newProductData);
            // Stocker le résultat SEO (data uniquement) pour le CSV WooCommerce enrichi
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'success', generatedSeo: seoData } : p));
        } catch (error: any) {
            console.error('Erreur pour:', product.productName, error);
            let errorMessage = error.message || 'Erreur inconnue.';
            if (errorMessage.includes('API key expired') || errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
                errorMessage = 'Clé API IA invalide. Renouvelez-la dans Google AI Studio.';
            } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('rateLimitExceeded') || errorMessage.includes('429')) {
                errorMessage = 'Quota API dépassé. Attendez quelques minutes.';
            }
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'error', errorMessage } : p));
        }
    };

    const runBatch = async (toProcess: ProcessedRow[]) => {
        if (!user) return;
        setStep('processing');
        let successCount = 0;
        let failCount = 0;
        for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
            const batch = toProcess.slice(i, i + BATCH_SIZE);
            setProcessingIndex(i);
            const results = await Promise.allSettled(batch.map(p => processProduct(p)));
            const batchSuccess = results.filter(r => r.status === 'fulfilled').length;
            successCount += batchSuccess;
            failCount += results.length - batchSuccess;
            if (i + BATCH_SIZE < toProcess.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
            }
        }
        if (!isSuperAdmin && successCount > 0) {
            await incrementDailyImportCount(user.uid, successCount).catch(() => {});
        }
        await saveImportHistory(user.uid, {
            fileName,
            totalProducts: toProcess.length,
            successCount,
            failedCount: failCount,
        }).catch(() => {});
        setStep('complete');
        setProcessingIndex(-1);
        toast({ title: 'Génération terminée !', description: `${successCount} fiche${successCount > 1 ? 's' : ''} générée${successCount > 1 ? 's' : ''}.` });
    };

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleParfumsImport = async () => {
        if (!user) return;
        const toProcess = parfumsValid;
        if (toProcess.length === 0) {
            toast({ variant: 'destructive', title: 'Liste vide', description: 'Collez au moins un nom de parfum.' });
            return;
        }
        if (!isSuperAdmin && toProcess.length > availableCredits) {
            toast({ variant: 'destructive', title: 'Crédits insuffisants', description: `Il vous faut ${toProcess.length} crédits, vous en avez ${availableCredits}.` });
            return;
        }
        const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        setFileName(`Parfums - ${today}`);
        setWooMode(false);
        setParfumsMode(true);
        setWooPublishResult(null);
        // Fusionner les images éditées dans le tableau avec celles du pipe
        const withImages = toProcess.map(p => ({
            ...p,
            imageUrl: parfumsImages[p.id] || p.imageUrl || undefined,
        }));
        setProducts(withImages);
        await runBatch(withImages);
    };

    const handleWooPublish = async () => {
        if (!user) return;
        const successProducts = products.filter(p => p.status === 'success' && p.generatedSeo);
        if (successProducts.length === 0) return;
        setWooPublishing(true);
        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/woo/publish', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: successProducts.map(p => ({ ...p, seo: p.generatedSeo?.data ?? p.generatedSeo })) }),
            });
            const data: WooPublishResult = await res.json();
            if (!res.ok) throw new Error((data as any).error || 'Erreur publication');
            setWooPublishResult(data);
            toast({
                title: `✅ ${data.succeeded.length} produit${data.succeeded.length > 1 ? 's' : ''} publié${data.succeeded.length > 1 ? 's' : ''} sur WooCommerce !`,
                description: data.failed.length > 0 ? `${data.failed.length} échec(s).` : 'Tous publiés avec succès.',
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur WooCommerce', description: error.message });
        } finally {
            setWooPublishing(false);
        }
    };

    const handleImport = async () => {
        if (!user) return;
        const toProcess = validProducts;
        if (!isSuperAdmin && toProcess.length > availableCredits) {
            toast({ variant: 'destructive', title: 'Crédits insuffisants', description: `Vous avez ${availableCredits} crédits, mais ${toProcess.length} produits.` });
            return;
        }
        if (!isSuperAdmin) {
            try {
                await checkDailyImportQuota(user.uid, toProcess.length);
            } catch (e: any) {
                const msg: string = e.message || '';
                toast({ variant: 'destructive', title: msg.startsWith('MAX_BATCH:') ? 'Limite dépassée' : 'Quota journalier atteint', description: msg.replace(/^MAX_BATCH:|^MAX_DAILY:/, '') });
                return;
            }
        }
        await runBatch(toProcess);
    };

    const handleQuickEntryImport = async () => {
        if (!user) return;
        const toProcess = quickEntryValid;
        if (toProcess.length === 0) {
            toast({ variant: 'destructive', title: 'Aucun produit valide', description: 'Corrigez les lignes en rouge avant de lancer.' });
            return;
        }
        if (!isSuperAdmin && toProcess.length > availableCredits) {
            toast({ variant: 'destructive', title: 'Crédits insuffisants', description: `Vous avez ${availableCredits} crédits, mais ${toProcess.length} produits.` });
            return;
        }
        if (!isSuperAdmin) {
            try {
                await checkDailyImportQuota(user.uid, toProcess.length, QUICK_ENTRY_MAX);
            } catch (e: any) {
                const msg: string = e.message || '';
                toast({ variant: 'destructive', title: msg.startsWith('MAX_BATCH:') ? 'Limite dépassée' : 'Quota journalier atteint', description: msg.replace(/^MAX_BATCH:|^MAX_DAILY:/, '') });
                return;
            }
        }
        const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        setFileName(`Saisie Rapide - ${today}`);
        setWooMode(false);
        setProducts(toProcess);
        await runBatch(toProcess);
    };

    const handleScheduleImport = () => {
        if (!scheduledTime) {
            toast({ variant: 'destructive', title: 'Heure manquante', description: 'Choisissez une heure.' });
            return;
        }
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);
        if (target <= new Date()) target.setDate(target.getDate() + 1);
        const delay = target.getTime() - Date.now();
        if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
        scheduleTimeoutRef.current = setTimeout(() => { setScheduledAt(null); runBatch(validProducts); }, delay);
        setScheduledAt(target);
        toast({ title: 'Import planifié !', description: `Lancement automatique à ${scheduledTime}. Gardez l'onglet ouvert.` });
    };

    const handleCancelSchedule = () => {
        if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
        setScheduledAt(null);
        setScheduleEnabled(false);
        toast({ title: 'Planification annulée' });
    };

    const handleRetryFailed = async () => {
        const failedIds = products.filter(p => p.status === 'error').map(p => p.id);
        const reset = products.filter(p => failedIds.includes(p.id)).map(p => ({ ...p, status: 'pending' as const, errorMessage: undefined }));
        setProducts(prev => prev.map(p => failedIds.includes(p.id) ? { ...p, status: 'pending', errorMessage: undefined } : p));
        await runBatch(reset);
    };

    const downloadFailedCsv = () => {
        const failed = products.filter(p => p.status === 'error');
        if (!failed.length) return;
        const header = 'productName,brand,category,weight,price,imageUrl';
        const rows = failed.map(p => `"${p.productName}","${p.brand}","${p.category}","${p.weight}","${p.price ?? ''}","${p.imageUrl ?? ''}"`);
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'produits-en-echec.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleRemoveProduct = (id: number) => setProducts(prev => prev.filter(p => p.id !== id));
    const triggerFileInput = () => fileInputRef.current?.click();
    const triggerWooFileInput = () => wooFileInputRef.current?.click();

    if (userLoading || profileLoading || !user) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // ─── Step: Upload ─────────────────────────────────────────────────────────

    const UploadStep = () => (
        <Card>
            <CardHeader>
                <CardTitle>Import de produits</CardTitle>
                <CardDescription>
                    Saisissez vos produits, importez depuis WooCommerce ou uploadez un CSV.
                    {!isSuperAdmin && <> — Crédits : <span className="font-bold">{availableCredits}</span></>}
                    {isSuperAdmin && <> — <span className="font-bold text-primary">Admin — limites désactivées.</span></>}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* ── Tabs ── */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg flex-wrap">
                    {([
                        { id: 'parfums', icon: <Sparkles className="h-4 w-4" />, label: '✨ Parfums' },
                        { id: 'quick', icon: <Keyboard className="h-4 w-4" />, label: 'Saisie Rapide' },
                        { id: 'woo', icon: <ShoppingCart className="h-4 w-4" />, label: 'Import WooCommerce' },
                        { id: 'csv', icon: <FileUp className="h-4 w-4" />, label: 'CSV Maison' },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setUploadTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${uploadTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Panel : Parfums (mode ultra-simple) ── */}
                {uploadTab === 'parfums' && (
                    <div className="space-y-4">
                        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                            <p className="font-semibold text-sm">Colle juste les noms de tes parfums — un par ligne</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                La marque est détectée automatiquement. Ajoute une image en option avec un <code className="bg-black/10 px-1 rounded">|</code> après le nom.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Liste de parfums</p>
                                {parfumsParsed.length > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">{parfumsParsed.length}</span> détecté{parfumsParsed.length > 1 ? 's' : ''}
                                        {parfumsParsed.length >= QUICK_ENTRY_MAX && <span className="text-amber-500"> (max)</span>}
                                    </span>
                                )}
                            </div>
                            <textarea
                                value={parfumsText}
                                onChange={e => setParfumsText(e.target.value)}
                                placeholder={`Lattafa Asad\nKhamrah Lattafa | https://monsite.com/khamrah.jpg\nMaison Alhambra Baroque Rouge\nDior Sauvage | https://monsite.com/sauvage.jpg`}
                                className="w-full h-48 p-3 rounded-md border border-input bg-background text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                                spellCheck={false}
                            />
                            <p className="text-xs text-muted-foreground">
                                Un nom par ligne — max {QUICK_ENTRY_MAX} parfums — image optionnelle : <code className="bg-muted px-1 rounded">Nom du parfum | https://url-image.jpg</code>
                            </p>
                        </div>

                        {/* Aperçu de détection avec colonne image éditable */}
                        {parfumsParsed.length > 0 && (
                            <div className="space-y-2">
                                {/* Mini-tuto image */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aperçu — tu peux ajouter/corriger les images ici</p>
                                    <button
                                        onClick={() => setShowImageTuto(v => !v)}
                                        className="text-xs text-primary underline flex items-center gap-1"
                                    >
                                        {showImageTuto ? 'Masquer' : '📷 Comment trouver l\'URL d\'une image ?'}
                                    </button>
                                </div>

                                {showImageTuto && (
                                    <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-sm space-y-2">
                                        <p className="font-semibold text-amber-800">📷 Trouver l'URL d'une image dans WooCommerce</p>
                                        <ol className="list-decimal list-inside space-y-1.5 text-amber-900 text-xs">
                                            <li>Va dans ton <strong>administration WooCommerce</strong> → <strong>Médias</strong></li>
                                            <li>Clique sur l'image de ton parfum (ou téléverse-la si elle n'est pas encore là)</li>
                                            <li>Dans le panneau de droite, tu vois <strong>"URL du fichier"</strong> — copie ce lien</li>
                                            <li>Colle-le dans la colonne "Image URL" ci-dessous ou directement après un <code className="bg-amber-100 px-1 rounded">|</code> dans la zone de saisie</li>
                                        </ol>
                                        <p className="text-xs text-amber-700 border-t border-amber-200 pt-2 mt-2">
                                            💡 <strong>Astuce :</strong> si tu n'as pas encore les images, laisse vide — tu pourras les ajouter directement depuis ton catalogue WooCommerce après import.
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-md border max-h-64 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nom du parfum</TableHead>
                                                <TableHead>Marque</TableHead>
                                                <TableHead className="min-w-[200px]">Image URL <span className="font-normal text-muted-foreground">(optionnel)</span></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parfumsParsed.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-medium">{p.productName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{p.brand}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="url"
                                                            placeholder="https://... (colle l'URL ici)"
                                                            value={parfumsImages[p.id] ?? (p.imageUrl || '')}
                                                            onChange={e => setParfumsImages(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                            className="w-full h-8 px-2 text-xs rounded border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {!isSuperAdmin && parfumsValid.length > availableCredits && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Crédits insuffisants</AlertTitle>
                                <AlertDescription>Il vous faut {parfumsValid.length} crédits mais vous en avez {availableCredits}. <Link href="/pricing" className="underline font-bold">Recharger</Link>.</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-between items-center pt-1">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => { setStep('history'); loadHistory(); }}>
                                <History className="h-4 w-4" />Historique
                            </Button>
                            <Button
                                onClick={handleParfumsImport}
                                disabled={parfumsValid.length === 0 || (!isSuperAdmin && parfumsValid.length > availableCredits)}
                                size="lg"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                {parfumsValid.length > 0 ? `Générer ${parfumsValid.length} fiche${parfumsValid.length > 1 ? 's' : ''}` : 'Générer'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Panel : Saisie Rapide ── */}
                {uploadTab === 'quick' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Une ligne = un produit</p>
                                {quickEntryParsed.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            <span className="font-bold text-foreground">{quickEntryParsed.length}</span>
                                            {quickEntryParsed.length >= QUICK_ENTRY_MAX && <span className="text-amber-500"> (max)</span>}
                                            {' '}détecté{quickEntryParsed.length > 1 ? 's' : ''}
                                        </span>
                                        {quickEntryValid.length > 0 && <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/20">{quickEntryValid.length} valide{quickEntryValid.length > 1 ? 's' : ''}</Badge>}
                                        {quickEntryInvalid.length > 0 && <Badge variant="destructive">{quickEntryInvalid.length} erreur{quickEntryInvalid.length > 1 ? 's' : ''}</Badge>}
                                    </div>
                                )}
                            </div>
                            <textarea
                                value={quickEntryText}
                                onChange={e => setQuickEntryText(e.target.value)}
                                placeholder={`Dior Sauvage, Dior, Parfum, 100\nLa Roche-Posay Effaclar, LRP, Soin, 200\nMAC Ruby Woo, MAC, Cosmétique, 3`}
                                className="w-full h-52 p-3 rounded-md border border-input bg-background text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                                spellCheck={false}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format : <code className="bg-muted px-1 rounded">Nom, Marque, Catégorie, Poids</code> — séparateurs : virgule, point-virgule ou pipe — max {QUICK_ENTRY_MAX}
                            </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Catégories : {VALID_CATEGORIES.map(c => <code key={c} className="bg-muted px-1 py-0.5 rounded mr-1">{c}</code>)} — ou tapez librement (auto-détection)
                        </div>
                        {quickEntryInvalid.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-destructive flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />Lignes à corriger :</p>
                                <div className="max-h-36 overflow-y-auto space-y-1">
                                    {quickEntryInvalid.map(p => (
                                        <div key={p.id} className="flex items-start gap-2 text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded px-2 py-1.5">
                                            <span className="font-semibold text-destructive shrink-0">L.{p.id + 1}</span>
                                            <span className="text-muted-foreground truncate">{p.productName || '(vide)'}{p.brand ? ` · ${p.brand}` : ''}</span>
                                            <span className="text-destructive ml-auto shrink-0">{p.validationErrors.join(', ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!isSuperAdmin && quickEntryValid.length > availableCredits && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Crédits insuffisants</AlertTitle>
                                <AlertDescription>Il vous faut {quickEntryValid.length} crédits mais vous en avez {availableCredits}. <Link href="/pricing" className="underline font-bold">Recharger</Link>.</AlertDescription>
                            </Alert>
                        )}
                        <div className="flex justify-between items-center pt-1">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => { setStep('history'); loadHistory(); }}>
                                <History className="h-4 w-4" />Historique
                            </Button>
                            <Button onClick={handleQuickEntryImport} disabled={quickEntryValid.length === 0 || (!isSuperAdmin && quickEntryValid.length > availableCredits)} size="lg">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {quickEntryValid.length > 0 ? `Générer ${quickEntryValid.length} produit${quickEntryValid.length > 1 ? 's' : ''}` : 'Générer'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Panel : Import WooCommerce ── */}
                {uploadTab === 'woo' && (
                    <div className="space-y-4">
                        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800 dark:text-blue-300">Comment exporter depuis WooCommerce ?</AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                                Administration WooCommerce → <strong>Produits</strong> → <strong>Tous les produits</strong> → bouton <strong>Exporter</strong> → cocher tous les champs → <strong>Générer le CSV</strong>
                            </AlertDescription>
                        </Alert>

                        <div
                            onClick={triggerWooFileInput}
                            onDragOver={handleWooDragOver}
                            onDragLeave={handleWooDragLeave}
                            onDrop={handleWooDrop}
                            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDraggingWoo ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                        >
                            <ShoppingCart className={`h-12 w-12 mb-4 transition-colors ${isDraggingWoo ? 'text-primary' : 'text-muted-foreground'}`} />
                            <p className="font-semibold">
                                {isDraggingWoo ? 'Déposez votre export WooCommerce ici' : 'Glissez ou cliquez pour uploader votre export WooCommerce'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">CSV exporté depuis WooCommerce (FR ou EN, Max 10MB)</p>
                        </div>
                        <input type="file" ref={wooFileInputRef} onChange={handleWooFileChange} className="hidden" accept=".csv" />

                        <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                                Format auto-détecté (FR/EN) — Seules les descriptions sont mises à jour. Toutes les autres données (prix, stock, images, SKU…) sont préservées.
                            </p>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground shrink-0" onClick={() => { setStep('history'); loadHistory(); }}>
                                <History className="h-4 w-4" />Historique
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Panel : CSV Maison ── */}
                {uploadTab === 'csv' && (
                    <div className="space-y-6">
                        <div
                            onClick={triggerFileInput}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                        >
                            <FileUp className={`h-12 w-12 mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                            <p className="font-semibold">{isDragging ? 'Déposez le fichier ici' : 'Glissez votre CSV ici ou cliquez pour téléverser'}</p>
                            <p className="text-sm text-muted-foreground mt-1">CSV format Woosenteur (Max 5MB)</p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground">Télécharger un template :</p>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Parfum', 'Soin', 'Cosmetique'] as const).map((type) => (
                                    <Button key={type} variant="outline" size="sm" asChild className="gap-2">
                                        <a href={`/template-import-${type === 'Cosmetique' ? 'cosmetique' : type.toLowerCase()}.csv`} download>
                                            <Download className="h-3.5 w-3.5" />{type === 'Cosmetique' ? 'Cosmétique' : type}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-xs text-muted-foreground">
                                Requis : <code className="bg-muted px-1 rounded">productName</code> <code className="bg-muted px-1 rounded">brand</code> <code className="bg-muted px-1 rounded">category</code> <code className="bg-muted px-1 rounded">weight</code> — Optionnel : <code className="bg-muted px-1 rounded">price</code> <code className="bg-muted px-1 rounded">imageUrl</code>
                            </p>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground shrink-0" onClick={() => { setStep('history'); loadHistory(); }}>
                                <History className="h-4 w-4" />Historique
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // ─── Step: Preview ────────────────────────────────────────────────────────

    const PreviewStep = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ListChecks />Aperçu &amp; Validation
                    {wooMode && <Badge className="bg-blue-500/20 text-blue-700 ml-2">WooCommerce {wooFormat.toUpperCase()}</Badge>}
                </CardTitle>
                <CardDescription>
                    {fileName && <><span className="font-semibold">{fileName}</span> — </>}
                    {!isSuperAdmin && <>Crédits disponibles : <span className="font-bold">{availableCredits}</span></>}
                    {isSuperAdmin && <span className="font-bold text-primary">Admin — limites désactivées.</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {wooMode && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Format WooCommerce {wooFormat === 'fr' ? 'FR' : 'EN'} détecté</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400 text-sm">
                            {wooDetectedCount} produit{wooDetectedCount > 1 ? 's' : ''} détecté{wooDetectedCount > 1 ? 's' : ''}. Seules les descriptions, mots-clés et métadonnées SEO seront mis à jour. Prix, stock, images et SKU sont préservés.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline">{products.length} produit{products.length > 1 ? 's' : ''}</Badge>
                    {validProducts.length > 0 && <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/20">{validProducts.length} valide{validProducts.length > 1 ? 's' : ''}</Badge>}
                    {invalidProducts.length > 0 && <Badge variant="destructive">{invalidProducts.length} erreur{invalidProducts.length > 1 ? 's' : ''}</Badge>}
                    {!isSuperAdmin && (
                        <Badge className={validProducts.length > availableCredits ? 'bg-red-500/20 text-red-700' : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/20'}>
                            Coût : {validProducts.length} crédit{validProducts.length > 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>

                {!isSuperAdmin && validProducts.length > IMPORT_BATCH_MAX && !wooMode && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Trop de produits</AlertTitle>
                        <AlertDescription>Max {IMPORT_BATCH_MAX} produits par import CSV maison. Divisez votre fichier.</AlertDescription>
                    </Alert>
                )}
                {!isSuperAdmin && validProducts.length > availableCredits && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Crédits insuffisants</AlertTitle>
                        <AlertDescription>Il vous faut {validProducts.length} crédits mais vous en avez {availableCredits}. <Link href="/pricing" className="underline font-bold ml-1">Recharger</Link>.</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex gap-1.5">
                        {(['all', 'valid', 'invalid'] as const).filter(f => f !== 'invalid' || invalidProducts.length > 0).map(f => (
                            <Button key={f} size="sm" variant={previewFilter === f ? (f === 'invalid' ? 'destructive' : 'default') : 'outline'} className="h-7 px-3 text-xs" onClick={() => setPreviewFilter(f)}>
                                {f === 'all' ? `Tous (${products.length})` : f === 'valid' ? `Valides (${validProducts.length})` : `Erreurs (${invalidProducts.length})`}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead>Marque</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Poids</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPreview.map(p => (
                                <TableRow key={p.id} className={!p.isValid ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                    <TableCell className={!p.productName?.trim() ? 'text-red-500 font-medium' : ''}>{p.productName || '—'}</TableCell>
                                    <TableCell className={!p.brand?.trim() ? 'text-red-500 font-medium' : ''}>{p.brand || '—'}</TableCell>
                                    <TableCell><Badge variant={VALID_CATEGORIES.includes(p.category) ? 'outline' : 'destructive'}>{p.category || '—'}</Badge></TableCell>
                                    <TableCell className={!p.weight?.trim() || isNaN(parseFloat(p.weight)) ? 'text-red-500 font-medium' : ''}>{p.weight || '—'}</TableCell>
                                    <TableCell>
                                        {p.isValid ? <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/20">Valide</Badge> : <Badge variant="destructive" title={p.validationErrors.join(', ')}>Erreur</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveProduct(p.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredPreview.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Aucun produit dans ce filtre.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Planification — uniquement hors mode WooCommerce */}
                {!wooMode && (
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Planifier l'import</p>
                            {!scheduledAt && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs ml-auto" onClick={() => setScheduleEnabled(v => !v)}>
                                    {scheduleEnabled ? 'Masquer' : 'Planifier'}
                                </Button>
                            )}
                        </div>
                        {scheduledAt ? (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    Planifié à <strong>{scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong> — dans <strong className="text-primary">{countdown}</strong>
                                </span>
                                <Button variant="destructive" size="sm" onClick={handleCancelSchedule}>Annuler</Button>
                            </div>
                        ) : scheduleEnabled && (
                            <div className="flex items-center gap-2">
                                <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                                <Button size="sm" onClick={handleScheduleImport} disabled={!scheduledTime || validProducts.length === 0}><Clock className="mr-1.5 h-3.5 w-3.5" />Confirmer</Button>
                                <p className="text-xs text-muted-foreground">Gardez l'onglet ouvert</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('upload')}>Annuler</Button>
                <Button
                    onClick={handleImport}
                    disabled={
                        validProducts.length === 0 || !!scheduledAt ||
                        (!isSuperAdmin && (validProducts.length > availableCredits || (!wooMode && validProducts.length > IMPORT_BATCH_MAX)))
                    }
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {wooMode ? `Enrichir ${validProducts.length} fiche${validProducts.length > 1 ? 's' : ''}` : `Lancer pour ${validProducts.length} produit${validProducts.length > 1 ? 's' : ''}`}
                </Button>
            </CardFooter>
        </Card>
    );

    // ─── Step: Processing ─────────────────────────────────────────────────────

    const ProcessingStep = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Loader2 className="animate-spin" />Génération en cours...</CardTitle>
                <CardDescription>{wooMode ? 'Enrichissement de vos fiches WooCommerce. Ne fermez pas cette page.' : 'Génération des fiches produits en cours. Ne fermez pas cette page.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={Math.min(((processingIndex + BATCH_SIZE) / products.length) * 100, 100)} className="w-full" />
                <p className="text-center text-muted-foreground">
                    Lot {Math.floor(processingIndex / BATCH_SIZE) + 1} / {Math.ceil(products.length / BATCH_SIZE)} — {processingIndex + 1}–{Math.min(processingIndex + BATCH_SIZE, products.length)} sur {products.length}
                </p>
                <div className="max-h-80 overflow-y-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead>Produit</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {products.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.productName}</TableCell>
                                    <TableCell>
                                        {p.status === 'pending' && <Badge variant="outline">En attente</Badge>}
                                        {p.status === 'processing' && <Badge className="bg-blue-500/20 text-blue-700"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Traitement</Badge>}
                                        {p.status === 'success' && <Badge className="bg-green-500/20 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Succès</Badge>}
                                        {p.status === 'error' && <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Échec</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );

    // ─── Step: Complete ───────────────────────────────────────────────────────

    const CompleteStep = () => {
        const failedProducts = products.filter(p => p.status === 'error');
        const successProducts = products.filter(p => p.status === 'success');
        return (
            <Card>
                <CardHeader className="items-center text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle>{wooMode ? 'Enrichissement Terminé !' : 'Génération Terminée !'}</CardTitle>
                    <CardDescription>
                        <span className="text-green-600 font-bold">{successProducts.length} succès</span>
                        {failedProducts.length > 0 && <>, <span className="text-red-600 font-bold">{failedProducts.length} échec{failedProducts.length > 1 ? 's' : ''}</span></>}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Mode Parfums — Publication directe WooCommerce + CSV */}
                    {parfumsMode && successProducts.length > 0 && (
                        <div className="mb-4 space-y-3">
                            {/* Publication directe */}
                            {!wooPublishResult ? (
                                <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4 text-primary" />
                                                Publier directement sur ta boutique
                                            </p>
                                            <p className="text-sm text-muted-foreground">{successProducts.length} fiche{successProducts.length > 1 ? 's' : ''} prête{successProducts.length > 1 ? 's' : ''} — 1 clic pour publier sur WooCommerce</p>
                                        </div>
                                        <Button onClick={handleWooPublish} disabled={wooPublishing} size="lg" className="gap-2 shrink-0">
                                            {wooPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                                            {wooPublishing ? 'Publication...' : 'Publier sur WooCommerce'}
                                        </Button>
                                    </div>
                                    <WooConnectionTest user={user} />
                                </div>
                            ) : (
                                <div className={`p-4 rounded-lg border-2 ${wooPublishResult.succeeded.length > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                    {wooPublishResult.succeeded.length > 0 && (
                                        <p className="font-semibold text-green-800 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            {wooPublishResult.succeeded.length} produit{wooPublishResult.succeeded.length > 1 ? 's' : ''} publié{wooPublishResult.succeeded.length > 1 ? 's' : ''} sur WooCommerce !
                                        </p>
                                    )}
                                    {wooPublishResult.failed.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm font-semibold text-red-700">{wooPublishResult.failed.length} échec(s) :</p>
                                            {wooPublishResult.failed.map((f: any, i: number) => (
                                                <div key={i} className="text-xs bg-red-100 rounded px-2 py-1 flex justify-between gap-2">
                                                    <span className="font-medium text-red-800">{f.name}</span>
                                                    <span className="text-red-600">{f.error}</span>
                                                </div>
                                            ))}
                                            <WooConnectionTest user={user} />
                                        </div>
                                    )}
                                    {wooPublishResult.succeeded.length > 0 && (
                                        <a href={`${wooPublishResult.succeeded[0].permalink?.split('/wp-json')[0]}/wp-admin/edit.php?post_type=product`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-primary underline mt-2 inline-block">
                                            Voir les produits dans WooCommerce →
                                        </a>
                                    )}
                                </div>
                            )}
                            {/* CSV de secours */}
                            <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between gap-4">
                                <p className="text-sm text-muted-foreground">Ou télécharge le CSV WooCommerce pour import manuel</p>
                                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => {
                                    const csv = buildFreshWooCommerceCsv(products);
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url; a.download = `parfums-woocommerce-${new Date().toISOString().split('T')[0]}.csv`; a.click();
                                    URL.revokeObjectURL(url);
                                }}>
                                    <Download className="h-4 w-4" />CSV WooCommerce
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Bouton WooCommerce enrichi (mode import WooCommerce existant) */}
                    {wooMode && successProducts.length > 0 && (
                        <div className="mb-4 p-4 rounded-lg border-2 border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-semibold">CSV WooCommerce enrichi prêt !</p>
                                <p className="text-sm text-muted-foreground">Réimportez ce fichier dans WooCommerce pour mettre à jour vos {successProducts.length} fiches produits.</p>
                            </div>
                            <Button onClick={downloadEnrichedWooCommerceCsv} size="lg" className="gap-2 shrink-0">
                                <Download className="h-4 w-4" />
                                Télécharger le CSV
                            </Button>
                        </div>
                    )}

                    <div className="max-h-72 overflow-y-auto rounded-md border">
                        <Table>
                            <TableHeader><TableRow><TableHead>Produit</TableHead><TableHead>Statut</TableHead><TableHead>Détails</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {products.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.productName}</TableCell>
                                        <TableCell>
                                            {p.status === 'success' && <Badge className="bg-green-500/20 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Succès</Badge>}
                                            {p.status === 'error' && <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Échec</Badge>}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{p.errorMessage}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-2">
                    <Button variant="outline" onClick={() => { setStep('upload'); setProducts([]); setWooMode(false); setParfumsMode(false); setWooPublishResult(null); setParfumsText(''); setParfumsImages({}); }}>Nouveau batch</Button>
                    <div className="flex flex-wrap gap-2">
                        {failedProducts.length > 0 && (
                            <>
                                {!wooMode && (
                                    <Button variant="outline" onClick={downloadFailedCsv} className="gap-2">
                                        <Download className="h-4 w-4" />CSV des échecs ({failedProducts.length})
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={handleRetryFailed} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />Relancer les échecs
                                </Button>
                            </>
                        )}
                        <Button asChild><Link href="/dashboard/products">Voir le catalogue</Link></Button>
                    </div>
                </CardFooter>
            </Card>
        );
    };

    // ─── Step: History ────────────────────────────────────────────────────────

    const HistoryStep = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Historique des imports</CardTitle>
                <CardDescription>Les 20 derniers imports et générations.</CardDescription>
            </CardHeader>
            <CardContent>
                {historyLoading ? (
                    <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : importHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">Aucun import enregistré.</p>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead className="text-center">Succès</TableHead>
                                    <TableHead className="text-center">Échecs</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {importHistory.map(h => (
                                    <TableRow key={h.id}>
                                        <TableCell className="font-medium max-w-[200px] truncate">{h.fileName}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {h.createdAt?.toDate?.()?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell className="text-center">{h.totalProducts}</TableCell>
                                        <TableCell className="text-center"><Badge className="bg-green-500/20 text-green-700">{h.successCount}</Badge></TableCell>
                                        <TableCell className="text-center">
                                            {h.failedCount > 0 ? <Badge variant="destructive">{h.failedCount}</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            <CardFooter><Button variant="outline" onClick={() => setStep('upload')}>← Retour</Button></CardFooter>
        </Card>
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    const renderStep = () => {
        switch (step) {
            case 'upload': return <UploadStep />;
            case 'preview': return <PreviewStep />;
            case 'processing': return <ProcessingStep />;
            case 'complete': return <CompleteStep />;
            case 'history': return <HistoryStep />;
            default: return <UploadStep />;
        }
    };

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="font-headline text-3xl font-bold text-foreground">Import de Produits</h1>
                <p className="text-muted-foreground">Générez des centaines de fiches produits en une seule fois.</p>
            </div>
            <div className="max-w-4xl mx-auto">
                {renderStep()}
            </div>
        </>
    );
}
