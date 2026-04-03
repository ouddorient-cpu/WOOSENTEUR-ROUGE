
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, BarChart, Sparkles, ArrowRight, FileUp, Package, Clock, Eye, Gift, Check } from 'lucide-react';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { query, orderBy, limit, collection } from 'firebase/firestore';
import type { UserProfile, Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import Image from 'next/image';
import { CoinIndicator } from '@/components/ui/coin-indicator';
import { Badge } from '@/components/ui/badge';

const StatCard = ({ title, value, icon, description, isCredits = false }: { title: string, value: string, icon: React.ReactNode, description?: string, isCredits?: boolean }) => (
    <Card className="overflow-hidden relative group transition-all duration-300 hover:shadow-lg hover:border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            {isCredits ? (
                <CoinIndicator amount={value} showLabel={false} className="border-none bg-transparent p-0 shadow-none scale-125 origin-left" />
            ) : (
                <div className="text-2xl font-bold text-gradient">{value}</div>
            )}
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </CardContent>
        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            {React.cloneElement(icon as React.ReactElement, { size: 100 })}
        </div>
    </Card>
);

function PromoCodeWidget({ user }: { user: any }) {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');

    const handleRedeem = useCallback(async () => {
        if (!code.trim()) return;
        setStatus('loading');
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/redeem-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ code: code.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
            setMsg(data.message);
            setStatus('success');
            setCode('');
        } catch (e: any) {
            setMsg(e.message);
            setStatus('error');
        }
    }, [code, user]);

    if (status === 'success') {
        return (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
                <Check className="h-4 w-4 shrink-0" />
                <span className="font-medium">{msg}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-4 py-3">
            <Gift className="h-4 w-4 text-primary shrink-0" />
            <Input
                placeholder="Code promo (ex: BETA50)"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setMsg(''); }}
                className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 px-1 uppercase placeholder:normal-case"
                onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            />
            {status === 'error' && <span className="text-xs text-destructive shrink-0">{msg}</span>}
            <Button size="sm" onClick={handleRedeem} disabled={!code.trim() || status === 'loading'} className="shrink-0 h-8">
                {status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Utiliser'}
            </Button>
        </div>
    );
}

export default function DashboardHomePage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const userProfilePath = user ? `users/${user.uid}` : null;
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

    const productsPath = user ? `users/${user.uid}/products` : null;
    const { data: recentProducts, isLoading: productsLoading } = useCollection<Product>(
        productsPath ? query(collection(firestore, productsPath), orderBy('createdAt', 'desc'), limit(6)) : null
    );

    const { data: allProducts, isLoading: allProductsLoading } = useCollection<Product>(
        productsPath ? query(collection(firestore, productsPath)) : null
    );

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const isLoading = userLoading || profileLoading || productsLoading || allProductsLoading;

    if (isLoading || !user) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const creditBalance = userProfile?.isUnlimited ? 'Illimité' : userProfile?.creditBalance?.toString() ?? '0';
    const totalGenerations = allProducts?.length ?? 0;

    return (
        <div className="space-y-8 relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-dots opacity-30 pointer-events-none -z-10" />
            <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
                        <Sparkles className="mr-2 h-3 w-3" /> Espace Créatif
                    </Badge>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold text-gradient">Studio Dashboard</h1>
                    <p className="text-muted-foreground">Bienvenue dans votre atelier, {user.displayName || user.email}.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/import"><FileUp className="mr-2 h-4 w-4" />Bulk Import</Link>
                    </Button>
                    <Button asChild size="sm" className="shadow-lg shadow-primary/20">
                        <Link href="/dashboard/generate"><Sparkles className="mr-2 h-4 w-4" />Nouveau Produit</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Générations totales"
                    value={totalGenerations.toString()}
                    icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
                    description="Nombre total de fiches créées"
                />
                <StatCard
                    title="Crédits restants"
                    value={creditBalance}
                    icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
                    description={userProfile?.isUnlimited ? "Accès total" : "Pour le cycle en cours"}
                    isCredits={!userProfile?.isUnlimited}
                />
                <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 overflow-hidden border-2 border-primary/20">
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="text-lg">Prêt à créer ?</CardTitle>
                        <CardDescription>Lancez une nouvelle génération ou importez vos produits WooCommerce.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 relative z-10">
                        <Button asChild size="lg" className="h-14 text-lg font-bold">
                            <Link href="/dashboard/generate"><Sparkles className="mr-2 h-5 w-5" />Générer</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 text-lg font-bold border-2">
                            <Link href="/dashboard/import"><FileUp className="mr-2 h-5 w-5" />Importer</Link>
                        </Button>
                    </CardContent>
                    <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                </Card>
            </div>

            {/* Promo code */}
            {!userProfile?.isUnlimited && (
                <PromoCodeWidget user={user} />
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Récentes Créations
                    </h2>
                    <Button asChild size="sm" variant="ghost">
                        <Link href="/dashboard/products" className="flex items-center gap-1 group">
                            Voir tout <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>

                {recentProducts && recentProducts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recentProducts.map(product => (
                            <Card key={product.id} className="group overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 studio-card">
                                <div className="aspect-[16/10] relative bg-muted flex items-center justify-center overflow-hidden">
                                    {product.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name || 'Produit'}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <Package className="h-12 w-12 text-muted-foreground/30" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Button asChild size="sm" variant="secondary">
                                            <Link href={`/dashboard/products/${product.id}`}>
                                                <Eye className="mr-2 h-4 w-4" /> Détails
                                            </Link>
                                        </Button>
                                    </div>
                                    <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                                        {product.productType || 'Produit'}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                                        <span className="text-xs text-muted-foreground">
                                            {product.createdAt ? new Date(product.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <Link href={`/dashboard/products/${product.id}`} className="text-xs font-bold text-primary flex items-center gap-1">
                                            Éditer <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed h-48 flex flex-col items-center justify-center bg-muted/30">
                        <Package className="h-10 w-10 text-muted-foreground/30 mb-2" />
                        <p className="text-muted-foreground text-sm">Aucun produit récent.</p>
                        <Button variant="link" asChild className="text-primary"><Link href="/dashboard/generate">Créer ma première fiche</Link></Button>
                    </Card>
                )}
            </div>
        </div>
    );
}
