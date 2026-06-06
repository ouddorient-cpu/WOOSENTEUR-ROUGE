"use client";

import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

/* ─── Parfums & produits e-commerce — Unsplash ─────────────────── */
const WOOSENTEUR_IMAGES = [
  // Parfums
  "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=600&fit=crop&q=80",
  // Baskets / sneakers
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=600&fit=crop&q=80",
  // Bougies
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1602607168099-f6c5e6208c78?w=400&h=600&fit=crop&q=80",
  // Vêtements
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop&q=80",
  // Montres / accessoires
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop&q=80",
  // Sacs / maroquinerie
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop&q=80",
  // Cosmétiques
  "https://images.unsplash.com/photo-1570194065650-d99fb4b38b32?w=400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=400&h=600&fit=crop&q=80",
];

export default function HeroAnimated() {
  const scrollToTrial = () => {
    document.getElementById("essai-gratuit")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatedMarqueeHero
      tagline="5 fiches offertes · Sans inscription · Sans carte bancaire"
      title={
        <>
          Vos fiches produit
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(110deg, #3B82F6 20%, #60A5FA 55%, #0EA5E9 90%)",
            }}
          >
            en 30 secondes.
          </span>
        </>
      }
      description="Décrivez votre produit en quelques mots. Woosenteur génère une fiche claire, professionnelle et optimisée SEO — prête à publier sur WooCommerce ou Shopify."
      ctaText="Générer ma première fiche — Gratuit"
      images={WOOSENTEUR_IMAGES}
      onCtaClick={scrollToTrial}
    />
  );
}
