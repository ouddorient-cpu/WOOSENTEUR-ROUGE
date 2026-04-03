'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, Info, Search, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { Product } from '@/lib/types';

interface LivePreviewProps {
    product: Partial<Product> | null;
    isGenerating: boolean;
    progress: number;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ product, isGenerating, progress }) => {
    if (!product && !isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 bg-muted/20 border-2 border-dashed rounded-xl p-8">
                <div className="p-6 rounded-full bg-muted/50 mb-4">
                    <Package className="h-12 w-12" />
                </div>
                <p className="text-sm font-medium">Configurez votre produit à gauche pour voir la prévisualisation</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-white rounded-xl border border-primary/20 shadow-2xl flex flex-col studio-card">
            {/* Browser-like header */}
            <div className="h-10 bg-muted/30 border-b flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 max-w-sm mx-auto h-6 bg-white/50 rounded flex items-center px-3 gap-2">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <div className="text-[10px] text-muted-foreground truncate">
                        {product?.seo?.slug ? `woosenteur.fr/produit/${product.seo.slug}` : 'Aperçu du produit...'}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <AnimatePresence mode="wait">
                    {isGenerating && progress < 100 ? (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full space-y-4"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-gradient animate-pulse">L'IA façonne votre contenu...</p>
                            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Product Header */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="aspect-square relative bg-muted rounded-lg overflow-hidden border">
                                    {product?.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt="Product preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                                            <ShoppingBag className="h-16 w-16 mb-2" />
                                            <p className="text-xs">Image non disponible</p>
                                        </div>
                                    )}
                                    {product?.brand && (
                                        <Badge className="absolute top-4 left-4 bg-white/90 text-foreground backdrop-blur-sm border-none shadow-sm capitalize">
                                            {product.brand}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold tracking-tight">{product?.name || "Nom du produit"}</h2>
                                        <p className="text-xl font-semibold text-primary">
                                            {product?.price ? `${product.price}€` : "Prix non défini"}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground line-clamp-3 italic">
                                            {product?.seo?.shortDescription || "La méta-description apparaîtra ici après la génération..."}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="w-4 h-4 rounded-full bg-amber-400" />
                                        ))}
                                        <span className="text-xs text-muted-foreground">(4.9/5 - 42 avis)</span>
                                    </div>

                                    <button className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                                        Ajouter au panier <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Product Details (Generated SEO Content) */}
                            <div className="space-y-6 pt-8 border-t">
                                {product?.seo?.longDescription ? (
                                    <div className="prose prose-sm max-w-none">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 italic">
                                            <Info className="h-4 w-4 text-primary" />
                                            L'histoire du produit
                                        </h3>
                                        <div
                                            className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{ __html: product.seo.longDescription.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4 opacity-50">
                                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                                        <div className="h-4 bg-muted rounded w-full animate-pulse" />
                                        <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                                    </div>
                                )}

                                {product?.seo?.shortDescription && (
                                    <div className="p-4 bg-muted/30 rounded-lg border border-primary/5">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Points Clés</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {product.seo.shortDescription}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trust badges footer */}
            <div className="p-4 bg-muted/10 border-t flex justify-center gap-8 grayscale opacity-50 scale-75">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-primary/20 rounded-full" />
                    <span className="text-[10px] font-bold">LIVRAISON 48H</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-primary/20 rounded-full" />
                    <span className="text-[10px] font-bold">PAIEMENT SÉCURISÉ</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-primary/20 rounded-full" />
                    <span className="text-[10px] font-bold">BIO & NATUREL</span>
                </div>
            </div>
        </div>
    );
};
