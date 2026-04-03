'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Check,
    Coffee,
    Settings,
    ArrowRight,
    Globe,
    Zap,
    ShieldCheck,
    BarChart3,
    Search,
    Users,
    MessageCircle,
    Star,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';

const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-3 w-3 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">{text}</span>
    </div>
);

const PricingCard = ({
    tier,
    price,
    description,
    features,
    highlight = false
}: {
    tier: string,
    price: string,
    description: string,
    features: string[],
    highlight?: boolean
}) => (
    <Card className={`relative flex flex-col h-full studio-card ${highlight ? 'border-primary ring-1 ring-primary/20 scale-105 z-10' : ''}`}>
        {highlight && (
            <div className="absolute top-0 right-0 left-0 -translate-y-1/2 flex justify-center">
                <Badge className="bg-primary text-white px-3 py-1">Plus populaire</Badge>
            </div>
        )}
        <CardHeader>
            <CardTitle className="text-xl font-bold">{tier}</CardTitle>
            <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-gradient">{price}</span>
                {price !== "Sur devis" && <span className="text-muted-foreground text-sm">HT</span>}
            </div>
            <CardDescription className="mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
            {features.map((f, i) => (
                <FeatureItem key={i} text={f} />
            ))}
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full" variant={highlight ? 'default' : 'outline'}>
                <Link href="https://wa.me/212699245542?text=Bonjour,%20je%20souhaite%20discuter%20de%20mon%20projet%20de%20boutique%20WooCommerce" target="_blank">
                    <MessageCircle className="mr-2 h-4 w-4" /> Choisir ce pack
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

export default function ShopCreationPage() {
    return (
        <main className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-8 lg:pt-32 lg:pb-12 bg-dots">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-sm font-medium">
                            <ShoppingBag className="mr-2 h-4 w-4" /> Service Premium
                        </Badge>
                        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto mb-4">
                            Votre boutique WooCommerce <br />
                            <span className="text-primary text-gradient">clé en main en quelques jours</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                            Je m'occupe de tout : du nom de domaine à la configuration finale. <br className="hidden md:block" />
                            Lancez votre marque avec un site professionnel, performant et optimisé.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20">
                                <Link href="#tarifs">Lancer mon projet</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold bg-background/50 backdrop-blur-sm">
                                <Link href="#process">Comment ça marche ?</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Proposition de valeur */}
            <section id="process" className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Un site prêt à vendre, sans stress</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            L'e-commerce ne devrait pas être une barrière technique. Ma mission est de vous livrer une plateforme solide pour que vous puissiez vous concentrer sur vos produits.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="studio-card p-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                <Globe className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Fondation Solide</h3>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                Achat du nom de domaine, configuration de l'hébergeur (o2switch ou Hostinger) et installation sécurisée de WordPress + WooCommerce.
                            </p>
                        </Card>

                        <Card className="studio-card p-6">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Design Optimisé</h3>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                Thème moderne, responsive et optimisé pour le taux de conversion. Toutes les pages essentielles sont prêtes : Accueil, Boutique, Panier, Paiement.
                            </p>
                        </Card>

                        <Card className="studio-card p-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                <Coffee className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Accompagnement Humain</h3>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                Avant le lancement, on partage un café virtuel pour caler vos besoins. Après la livraison, je vous forme en visio pour utiliser votre site.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing / Packs */}
            <section id="tarifs" className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Des tarifs clairs, sans surprise</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Choisissez le pack qui correspond à votre catalogue actuel. Chaque offre est pensée pour une croissance sereine.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <PricingCard
                            tier="Starter"
                            price="229 €"
                            description="Idéal pour les petits créateurs et artisans."
                            features={[
                                "1 à 10 produits inclus",
                                "Hébergement + Domaine 1 an",
                                "Installation WordPress/WooCommerce",
                                "Thème responsive mobile",
                                "Moyens de paiement (Stripe/Paypal)",
                                "Connexion avec Woosenteur AI"
                            ]}
                        />
                        <PricingCard
                            tier="Croissance"
                            price="399 €"
                            highlight={true}
                            description="Pour les marques avec un catalogue varié."
                            features={[
                                "10 à 100 produits inclus",
                                "Hébergement + Domaine 1 an",
                                "Structure de catégories propre",
                                "Système de filtres de base",
                                "Optimisation SEO (Rank Math)",
                                "Formation visio 45 min"
                            ]}
                        />
                        <PricingCard
                            tier="Catalogue"
                            price="699 €"
                            description="Pour les e-commerçants confirmés."
                            features={[
                                "100 à 300 produits inclus",
                                "Import automatique depuis CSV",
                                "Filtres avancés & Recherche pro",
                                "Optimisation de la vitesse",
                                "Sécurité renforcée",
                                "Formation approfondie"
                            ]}
                        />
                        <PricingCard
                            tier="Sur-mesure"
                            price="Sur devis"
                            description="Pour les projets ambitieux (+300 prods)."
                            features={[
                                "Produits illimités",
                                "Synchronisation stock complexe",
                                "Fonctionnalités spécifiques",
                                "Design 100% personnalisé",
                                "Accompagnement stratégique",
                                "Support prioritaire"
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials / Success Stories Section */}
            <section className="py-24 relative overflow-hidden bg-background">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-sm font-medium">
                            Success Stories
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Ils m'ont fait confiance</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            Découvrez des exemples concrets de boutiques lancées avec succès. Projetez-vous dans votre futur business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        {/* Mockup Image Display */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border">
                                <img
                                    src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1770636544/ChatGPT_Image_9_f%C3%A9vr._2026_12_26_50_1_ednr3a.png"
                                    alt="Aperçu Boutique Premium"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                            {/* Decorative background for the image */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-2xl -z-10 rounded-3xl opacity-50" />
                        </motion.div>

                        {/* Testimonials Cards */}
                        <div className="space-y-6">
                            {[
                                {
                                    name: "Dubai Negoce",
                                    url: "https://dubainegoce.fr",
                                    owner: "Maghzaz Nourddine",
                                    comment: "Notre boutique en ligne est un véritable succès ! La navigation est fluide et les paiements sont sécurisés, ce qui rassure nos clients. Une collaboration que je recommande vivement.",
                                    rating: 5
                                },
                                {
                                    name: "French Avenue",
                                    url: "https://www.frenchavenue.fr",
                                    owner: "Maghzaz Nourddine",
                                    comment: "Une boutique WooCommerce exceptionnelle. Le design est épuré, professionnel et l'aspect sécurisé des paiements est un vrai plus pour la confiance de nos clients.",
                                    rating: 5
                                }
                            ].map((client, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.2 }}
                                >
                                    <Card className="studio-card p-6 border-l-4 border-l-primary group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-foreground">{client.name}</h3>
                                                    <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-none">Propriété de {client.owner}</Badge>
                                                </div>
                                                <Link
                                                    href={client.url}
                                                    target="_blank"
                                                    className="text-xs text-primary hover:underline flex items-center gap-1 mb-2 w-fit"
                                                >
                                                    {client.url.replace('https://', '')} <ExternalLink className="h-3 w-3" />
                                                </Link>
                                                <div className="flex gap-1">
                                                    {[...Array(client.rating)].map((_, i) => (
                                                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                    ))}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild className="group-hover:text-primary transition-colors">
                                                <Link href={client.url} target="_blank" className="flex items-center gap-1.5">
                                                    Voir le site <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <p className="text-muted-foreground italic leading-relaxed">
                                            "{client.comment}"
                                        </p>
                                    </Card>
                                </motion.div>
                            ))}

                            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 mt-8">
                                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" /> Pourquoi eux ?
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Ces partenaires utilisent désormais nos outils IA pour la maintenance de leurs fiches produits, assurant un SEO toujours au top.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Maintenance & Support */}
            <section className="py-24 bg-muted/20 border-y relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 opacity-[0.03] rotate-12 pointer-events-none">
                    <Settings size={500} />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                            <ShieldCheck className="h-4 w-4" /> Sérénité totale assurée
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 italic">Je ne vous laisse pas tomber</h2>
                        <p className="text-lg text-muted-foreground mb-12">
                            Une fois le site livré, je propose une option de **maintenance mensuelle** pour s'occuper des mises à jour WordPress, des plugins, et de la sécurité. <br className="hidden md:block" />
                            Chaque mois, vous recevez un **rapport simplifié** (visites, pages vues, produits stars) pour suivre votre progression.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-6 studio-card max-w-2xl mx-auto">
                            <div>
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <BarChart3 className="h-4 w-4 text-primary" /> Suivi Performance
                                </h4>
                                <p className="text-xs text-muted-foreground">Rapport mensuel sur vos visiteurs et ventes.</p>
                            </div>
                            <div>
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" /> Sécurité & Updates
                                </h4>
                                <p className="text-xs text-muted-foreground">Mises à jour pro actives et sauvegardes.</p>
                            </div>
                        </div>
                        <Button asChild size="lg" className="mt-12 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold border-none">
                            <Link href="https://wa.me/212699245542?text=Bonjour,%20je%20souhaite%20en%20savoir%20plus%20sur%27accompagnement%20WooCommerce" target="_blank">
                                <MessageCircle className="mr-2 h-5 w-5" /> Discuter par WhatsApp (Offert)
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
