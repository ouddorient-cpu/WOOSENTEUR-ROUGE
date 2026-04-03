'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Check, Zap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const ShopOffer = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-background">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-dots opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <Card className="studio-card border-2 border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                                <Zap className="h-4 w-4" /> Offre Spéciale
                            </div>
                            <h2 className="font-headline text-3xl md:text-5xl font-bold leading-tight">
                                Vous n'avez pas encore <br />
                                <span className="text-gradient">votre boutique ?</span>
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Je crée pour vous un site WooCommerce **clé en main**, optimisé pour vos produits beauté, et je vous accompagne après la mise en ligne. Domaines, hébergement, design : **je m'occupe de tout.**
                            </p>

                            <div className="space-y-3 pt-2">
                                {[
                                    "Boutique prête à vendre en quelques jours",
                                    "Hébergement et domaine inclus 1 an",
                                    "Formation visio pour gérer votre site",
                                    "Intégration native avec Woosenteur AI"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 bg-[#25D366] hover:bg-[#20ba5a] border-none">
                                    <Link href="https://wa.me/212699245542?text=Bonjour,%20je%20viens%20de%20Woosenteur%20et%20je%20souhaite%20créer%20ma%20boutique" target="_blank">
                                        <MessageCircle className="mr-2 h-5 w-5" /> Discuter sur WhatsApp
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold bg-background/50">
                                    <Link href="/creation-boutique#tarifs">Voir les packs</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10 p-4 bg-background rounded-2xl shadow-2xl border border-primary/10"
                            >
                                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-muted">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShoppingBag size={120} className="text-primary/10" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Pack Starter</p>
                                        <h3 className="text-2xl font-bold">À partir de 229€</h3>
                                        <p className="text-xs text-white/70">Tout inclus : Site + Domaine + Hébergement</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative element */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
};
