'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Zap,
  ArrowRight,
  FileUp,
  Package,
  Clock,
  Eye,
  Gift,
  Check,
  Loader2,
  Plug,
  CreditCard,
  HelpCircle,
  Key,
  Flame,
  Copy,
  ExternalLink,
  Code2,
  CheckCircle2,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Play,
} from 'lucide-react';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { query, orderBy, limit, collection } from 'firebase/firestore';
import type { UserProfile, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const C = {
  orange: '#E55625',
  orangeHover: '#C2451C',
  orangePale: 'rgba(229, 86, 37, 0.12)',
};

export default function WorkspaceHomePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'quickstart' | 'products' | 'api' | 'billing'>('quickstart');

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [promoMsg, setPromoMsg] = useState('');

  // API Key State
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const productsPath = user ? `users/${user.uid}/products` : null;
  const { data: recentProducts, isLoading: productsLoading } = useCollection<Product>(
    productsPath ? query(collection(firestore, productsPath), orderBy('createdAt', 'desc'), limit(8)) : null
  );

  const { data: allProducts } = useCollection<Product>(
    productsPath ? query(collection(firestore, productsPath)) : null
  );

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleRedeemPromo = useCallback(async () => {
    if (!promoCode.trim() || !user) return;
    setPromoStatus('loading');
    setPromoMsg('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code invalide ou déjà utilisé.');
      setPromoStatus('success');
      setPromoMsg(`+${data.creditsAdded} crédits ajoutés ! 🎉`);
      setPromoCode('');
      toast({
        variant: 'success',
        title: 'Code activé !',
        description: `${data.creditsAdded} crédits ont été ajoutés à votre compte.`,
      });
    } catch (e: any) {
      setPromoStatus('error');
      setPromoMsg(e.message);
    }
  }, [promoCode, user, toast]);

  const mockApiKey = user ? `ws_live_${user.uid.slice(0, 16)}_key` : 'ws_live_connect_demo';

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setApiKeyCopied(true);
    toast({
      title: 'Clé API copiée !',
      description: 'Collez-la dans votre plugin WooCommerce ou Shopify.',
    });
    setTimeout(() => setApiKeyCopied(false), 2500);
  };

  const isLoading = userLoading || profileLoading;

  if (isLoading || !user) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E55625]" />
      </div>
    );
  }

  const isSuperAdmin = !!(userProfile?.isUnlimited || userProfile?.role === 'superadmin');
  const creditBalance = isSuperAdmin ? '∞' : userProfile?.creditBalance ?? 0;
  const totalProductsCount = allProducts?.length ?? recentProducts?.length ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── TOP BAR (EXACTEMENT COMME SUR LE SCREENSHOT CAMB.AI) ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span className="text-foreground flex items-center gap-1.5 font-bold">
            <span className="text-base">🏠</span> Home
          </span>
          <span className="opacity-40">/</span>
          <span className="text-xs">Atelier Woosenteur</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5"
          >
            <Link href="/dashboard/profile#api">
              <Key className="h-3.5 w-3.5 text-[#E55625]" />
              Clés API & Développeurs
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5"
          >
            <Link href="/dashboard/billing">
              <HelpCircle className="h-3.5 w-3.5" />
              Help Center & Facturation
            </Link>
          </Button>

          {/* User Avatar Circle (Style Camb.ai Orange "A") */}
          <Link
            href="/dashboard/profile"
            className="h-8 w-8 rounded-full bg-[#E55625] text-white flex items-center justify-center text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
            title={user.email || 'Mon profil'}
          >
            {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
          </Link>
        </div>
      </div>

      {/* ── HERO BANNER: NOUVEAUTÉ / AVANT-APRÈS (STYLE CAMB.AI BANNER SPLIT) ── */}
      <div className="rounded-2xl border bg-card relative overflow-hidden p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="space-y-4 max-w-2xl z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: C.orangePale, color: C.orange }}
          >
            <Flame className="h-3.5 w-3.5 fill-current" />
            FONCTIONNALITÉ PHARE · RANK MATH 90+
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Générateur Automatique de Fiches Produits
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Transformez un simple nom de parfum ou produit en une fiche complète : description sensorielle, pyramide
            olfactive (tête, cœur, fond), mots-clés Rank Math et publication directe sur WooCommerce et Shopify. En
            quelques secondes.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-[#E55625] hover:bg-[#C2451C] text-white font-bold px-6 shadow-md shadow-[#E55625]/20 h-11"
            >
              <Link href="/dashboard/generate">
                <Sparkles className="mr-2 h-4 w-4" />
                Créer ma fiche produit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 text-xs sm:text-sm font-semibold border-2"
            >
              <button type="button" onClick={() => setActiveTab('api')}>
                <Key className="mr-2 h-4 w-4 text-[#E55625]" />
                Connecter votre API
              </button>
            </Button>
          </div>
        </div>

        {/* Visual Split Avant / Après (Style Camb.ai BOOM! Illustration & Prêt pour vidéos) */}
        <div className="relative w-full lg:w-[440px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#E55625]/15 via-muted to-muted/50 border p-3.5 shrink-0 shadow-inner group">
          <div className="grid grid-cols-2 gap-3">
            {/* Colonne Avant (Brut) */}
            <div className="p-3 rounded-xl bg-background/90 border flex flex-col justify-between text-xs space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  AVANT · Saisie brute
                </span>
                <p className="font-bold text-foreground mt-1 line-clamp-1">Khamrah Lattafa</p>
                <p className="text-[11px] text-muted-foreground line-clamp-3 mt-1">
                  Parfum oriental mixte 100ml. Notes de vanille et cannelle. Bon rapport qualité prix.
                </p>
              </div>
              <div className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                Score SEO : 25/100
              </div>
            </div>

            {/* Colonne Après (Généré par Woosenteur) */}
            <div className="p-3 rounded-xl bg-gradient-to-b from-[#E55625]/10 to-background border-2 border-[#E55625]/40 flex flex-col justify-between text-xs space-y-2 shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E55625] block flex items-center gap-1">
                  APRÈS · Fiche Pro
                </span>
                <p className="font-bold text-foreground mt-1 line-clamp-1">Khamrah Lattafa | Parfum Iconique</p>
                <p className="text-[11px] text-muted-foreground line-clamp-3 mt-1">
                  Pyramide olfactive complète : tête bergamote, cœur cannelle, fond vanille & tonka. Sillage 8h+.
                </p>
              </div>
              <div className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                Rank Math : 94/100 ✦
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 rounded-lg bg-background/95 border text-[11px] flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              Gain : 45 min économisées par fiche
            </span>
            <span className="font-bold text-[#E55625]">Prêt pour WooCommerce</span>
          </div>
        </div>
      </div>

      {/* ── TABS BAR (STYLE CAMB.AI : QUICKSTART, PROJECTS, FOLDERS, API) ── */}
      <div className="border-b flex items-center gap-8 text-sm font-medium overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('quickstart')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'quickstart'
              ? 'border-[#E55625] text-[#E55625] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="h-4 w-4" />
          Démarrage rapide
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#E55625] text-[#E55625] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="h-4 w-4" />
          Mes Fiches Produits ({totalProductsCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-[#E55625] text-[#E55625] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key className="h-4 w-4" />
          Clés API & Connecteurs
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#E55625]/15 text-[#E55625]">
            NOUVEAU
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-[#E55625] text-[#E55625] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Facturation & Crédits ({creditBalance})
        </button>
      </div>

      {/* ── TAB 1 : DÉMARRAGE RAPIDE (LES 5 CARTES HORIZONTALES AVEC VIGNETTES ET GAIN IMMÉDIAT) ── */}
      {activeTab === 'quickstart' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">Que souhaitez-vous créer aujourd'hui ?</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choisissez un outil pour démarrer instantanément.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Parfums */}
            <Link
              href="/dashboard/generate"
              className="group rounded-2xl border bg-card overflow-hidden hover:border-[#E55625]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              <div className="aspect-[16/10] bg-muted relative overflow-hidden flex items-center justify-center">
                <Image
                  src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544330/Gemini_Generated_Image_7bnxii7bnxii7bnx-removebg-preview_xfcumj.png"
                  alt="Parfum"
                  width={140}
                  height={140}
                  className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
                />
                <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-[10px] text-foreground backdrop-blur-sm border-none shadow-sm font-semibold">
                  Parfumerie
                </Badge>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#E55625] transition-colors">
                    Fiche Parfum & Senteur
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    Pyramide olfactive (tête, cœur, fond), sillage et score Rank Math 90+.
                  </p>
                </div>
                <span className="text-[11px] text-[#E55625] font-semibold mt-3 flex items-center gap-1">
                  Créer <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>

            {/* Card 2: Soins & Cosmétiques */}
            <Link
              href="/dashboard/generate"
              className="group rounded-2xl border bg-card overflow-hidden hover:border-[#E55625]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              <div className="aspect-[16/10] bg-muted relative overflow-hidden flex items-center justify-center">
                <div className="p-4 rounded-full bg-[#E55625]/10 text-[#E55625] group-hover:scale-110 transition-transform">
                  <Sparkles className="h-10 w-10" />
                </div>
                <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-[10px] text-foreground backdrop-blur-sm border-none shadow-sm font-semibold">
                  Cosmétique
                </Badge>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#E55625] transition-colors">
                    Soin & Cosmétique
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    Formule active, résultats cliniques prouvés, type de peau et routine.
                  </p>
                </div>
                <span className="text-[11px] text-[#E55625] font-semibold mt-3 flex items-center gap-1">
                  Créer <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>

            {/* Card 3: Clé API & Intégrations */}
            <button
              type="button"
              onClick={() => setActiveTab('api')}
              className="group rounded-2xl border bg-card overflow-hidden hover:border-[#E55625]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col text-left"
            >
              <div className="aspect-[16/10] bg-muted relative overflow-hidden flex items-center justify-center">
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                  <Key className="h-10 w-10" />
                </div>
                <Badge className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] border-none shadow-sm font-semibold">
                  Connecteurs
                </Badge>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#E55625] transition-colors">
                    Clé API WooCommerce & Shopify
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    Connectez votre boutique pour synchroniser et publier automatiquement en 1 clic.
                  </p>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-3 flex items-center gap-1">
                  Connecter mon API <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>

            {/* Card 4: Import CSV en masse */}
            <Link
              href="/dashboard/import"
              className="group rounded-2xl border bg-card overflow-hidden hover:border-[#E55625]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              <div className="aspect-[16/10] bg-muted relative overflow-hidden flex items-center justify-center">
                <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <FileUp className="h-10 w-10" />
                </div>
                <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-[10px] text-foreground backdrop-blur-sm border-none shadow-sm font-semibold">
                  Catalogue
                </Badge>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#E55625] transition-colors">
                    Import CSV en masse
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    Générez jusqu'à 500 fiches produits d'un coup pour WooCommerce et Shopify.
                  </p>
                </div>
                <span className="text-[11px] text-blue-500 font-semibold mt-3 flex items-center gap-1">
                  Importer <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>

            {/* Card 5: Crédits & Facturation */}
            <Link
              href="/dashboard/billing"
              className="group rounded-2xl border bg-card overflow-hidden hover:border-[#E55625]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              <div className="aspect-[16/10] bg-muted relative overflow-hidden flex items-center justify-center">
                <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-10 w-10" />
                </div>
                <Badge className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] border-none shadow-sm font-semibold">
                  Tarifs
                </Badge>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#E55625] transition-colors">
                    Packs & Recharges
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    Rechargez dès 4,90 € sans abonnement ou téléchargez vos factures Stripe.
                  </p>
                </div>
                <span className="text-[11px] text-amber-500 font-semibold mt-3 flex items-center gap-1">
                  Recharger <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* ── RECENT CREATIONS SECTION ── */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#E55625]" />
                  Dernières Fiches Produits Générées
                </h3>
                <p className="text-xs text-muted-foreground">Accédez et éditez vos créations récentes.</p>
              </div>

              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-[#E55625]">
                <Link href="/dashboard/products">
                  Voir tout le catalogue ({totalProductsCount})
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {recentProducts && recentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProducts.slice(0, 4).map((product) => (
                  <Card
                    key={product.id}
                    className="group border overflow-hidden hover:border-[#E55625]/40 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="aspect-[16/10] relative bg-muted flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name || 'Produit'}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      )}
                      <Badge className="absolute top-2 left-2 bg-background/90 text-foreground backdrop-blur-sm border-none text-[10px] shadow-sm font-semibold">
                        {product.productType || 'Parfum'}
                      </Badge>
                    </div>
                    <CardContent className="p-3.5 space-y-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-[#E55625] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{product.brand || 'Sans marque'}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t text-[11px]">
                        <span className="text-muted-foreground">
                          {product.createdAt
                            ? new Date(product.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                            : 'Récent'}
                        </span>
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="text-[#E55625] font-semibold flex items-center gap-0.5 hover:underline"
                        >
                          Éditer <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed text-center bg-card/40 space-y-3">
                <Package className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <div>
                  <h4 className="font-bold text-foreground">Aucune fiche créée pour le moment</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lancez votre première génération en 30 secondes grâce à notre agent IA.
                  </p>
                </div>
                <Button asChild size="sm" className="bg-[#E55625] hover:bg-[#C2451C] text-white font-bold">
                  <Link href="/dashboard/generate">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Créer ma première fiche
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2 : MES FICHES PRODUITS ── */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Votre Catalogue Produits</h2>
              <p className="text-xs text-muted-foreground">Toutes les fiches créées par l'agent IA.</p>
            </div>
            <Button asChild size="sm" className="bg-[#E55625] hover:bg-[#C2451C] text-white font-bold">
              <Link href="/dashboard/generate">
                <Sparkles className="mr-1.5 h-4 w-4" /> Nouvelle fiche
              </Link>
            </Button>
          </div>

          {recentProducts && recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProducts.map((p) => (
                <Card key={p.id} className="border hover:border-[#E55625]/40 transition-all overflow-hidden group">
                  <div className="aspect-[16/10] bg-muted relative">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-xs">
                      {p.productType || 'Parfum'}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-[#E55625] transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link href={`/dashboard/products/${p.id}`}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> Voir les détails
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-card">
              <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">Votre catalogue est encore vide.</p>
              <Button asChild size="sm" className="mt-4 bg-[#E55625] text-white">
                <Link href="/dashboard/generate">Générer une première fiche</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3 : CLÉS API & CONNECTEURS (WOOCOMMERCE / SHOPIFY / DEV) ── */}
      {activeTab === 'api' && (
        <div className="space-y-8 max-w-4xl">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{ background: C.orangePale, color: C.orange }}
            >
              <Key className="h-3.5 w-3.5" />
              Connecteur Développeurs & E-commerce
            </div>
            <h2 className="text-2xl font-bold text-foreground">Clés API & Synchronisation Boutique</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connectez votre boutique WooCommerce ou Shopify grâce à votre clé API pour publier automatiquement vos fiches en 1 clic.
            </p>
          </div>

          {/* Carte Clé API Active */}
          <Card className="border-2 border-[#E55625]/40 bg-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4 text-[#E55625]" />
                  Votre Clé API Secrète (Live)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Utilisez cette clé pour authentifier vos requêtes ou synchroniser votre boutique e-commerce.
                </p>
              </div>
              <Badge variant="outline" className="border-green-600 text-green-600 font-bold self-start sm:self-auto">
                ● Active
              </Badge>
            </div>

            <div className="flex items-center gap-2 bg-muted/60 p-2.5 rounded-xl border">
              <code className="text-xs font-mono font-bold text-foreground flex-1 truncate px-2">
                {mockApiKey}
              </code>
              <Button size="sm" onClick={handleCopyApiKey} className="bg-[#E55625] hover:bg-[#C2451C] text-white text-xs font-bold shrink-0">
                {apiKeyCopied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {apiKeyCopied ? 'Copié !' : 'Copier'}
              </Button>
            </div>
          </Card>

          {/* Grille des 2 connecteurs officiels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connecteur WooCommerce */}
            <Card className="border-2 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Plug className="h-5 w-5 text-purple-600" />
                    WooCommerce (WordPress)
                  </h3>
                  <Badge variant="secondary" className="text-[10px] font-bold">1-Clic</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Publiez directement vos fiches produits avec titre SEO, extrait Rank Math, pyramide olfactive et image validée.
                </p>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full bg-[#E55625] hover:bg-[#C2451C] text-white font-bold text-xs h-9">
                  <Link href="/dashboard/profile">
                    Configurer mes clés WooCommerce
                  </Link>
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  REST API v3 · Lecture & Écriture
                </p>
              </div>
            </Card>

            {/* Connecteur Shopify */}
            <Card className="border-2 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-600" />
                    Shopify
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-600 text-emerald-600">CSV & API</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Exportez au format officiel Shopify Products Import ou utilisez l'API pour synchroniser vos collections.
                </p>
              </div>

              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full font-bold text-xs h-9">
                  <Link href="/dashboard/import">
                    Exporter pour Shopify
                  </Link>
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  Compatible Shopify OS 2.0
                </p>
              </div>
            </Card>
          </div>

          {/* Exemple de requête API pour développeurs */}
          <Card className="border bg-card p-6 space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#E55625]" />
              Exemple de Requête API (cURL)
            </h4>
            <pre className="p-4 rounded-xl bg-muted/80 text-[11px] font-mono overflow-x-auto text-foreground/90 border">
{`curl -X POST https://woosenteur.fr/api/mobile/generate \\
  -H "Authorization: Bearer ${mockApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productName": "Khamrah",
    "brand": "Lattafa",
    "category": "Parfum"
  }'`}
            </pre>
          </Card>
        </div>
      )}

      {/* ── TAB 4 : FACTURATION & CRÉDITS ── */}
      {activeTab === 'billing' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-xl font-bold text-foreground">Solde & Recharges</h2>
            <p className="text-xs text-muted-foreground">
              Gérez votre consommation et rechargez vos crédits en quelques secondes.
            </p>
          </div>

          <Card className="p-6 border-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-muted-foreground">Crédits restants</span>
                <div className="text-4xl font-black text-foreground mt-1">
                  {isSuperAdmin ? 'Illimité (Admin)' : `${creditBalance} crédits`}
                </div>
              </div>
              <Badge variant="secondary" className="capitalize text-xs font-semibold">
                Plan {userProfile?.subscriptionPlan || 'Gratuit'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="bg-[#E55625] hover:bg-[#C2451C] text-white font-bold">
                <Link href="/dashboard/billing#recharge-packs">
                  <Flame className="mr-2 h-4 w-4 fill-current" />
                  Recharger mes crédits (dès 4,90 €)
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-semibold">
                <Link href="/dashboard/billing#plans">Changer de forfait mensuel</Link>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── CODE PROMO RAPIDE (EN BAS DE PAGE) ── */}
      <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Gift className="h-4 w-4 text-[#E55625]" />
          <span>Vous avez un code cadeau ou promotionnel ?</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="CODE PROMO"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="h-8 text-xs uppercase w-36 font-bold"
            disabled={promoStatus === 'loading'}
          />
          <Button
            size="sm"
            onClick={handleRedeemPromo}
            disabled={!promoCode.trim() || promoStatus === 'loading'}
            className="h-8 text-xs bg-[#E55625] hover:bg-[#C2451C] text-white font-bold shrink-0"
          >
            {promoStatus === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Activer'}
          </Button>
          {promoMsg && (
            <span
              className={`text-xs ${promoStatus === 'success' ? 'text-green-600 font-semibold' : 'text-destructive'}`}
            >
              {promoMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
