'use client';
import SectionDivider from '@/components/ui/section-divider';

import { motion } from 'framer-motion';
import { Timer, FileText, ShoppingCart, Search, MessageSquare, Package } from 'lucide-react';

const benefits = [
  {
    icon: Timer,
    title: '2h de travail réduit à 5 min',
    desc: 'Ce qui vous prend une matinée entière, Woosenteur le fait pendant que vous prenez un café.',
  },
  {
    icon: FileText,
    title: 'Fini la page blanche',
    desc: "Donnez 3 informations sur votre produit. L'outil rédige, vous validez. Rien d'autre.",
  },
  {
    icon: ShoppingCart,
    title: 'Des fiches qui vendent',
    desc: "Un texte clair et convaincant rassure l'acheteur. Une fiche floue, c'est un panier abandonné.",
  },
  {
    icon: Search,
    title: 'Visible sur Google',
    desc: 'Titre optimisé, mots-clés et méta-description inclus. Vos produits remontent sans effort supplémentaire.',
  },
  {
    icon: MessageSquare,
    title: 'Dans votre langage, pas le nôtre',
    desc: "Vous choisissez le ton — formel, chaleureux, expert. Le texte s'adapte à votre marque.",
  },
  {
    icon: Package,
    title: 'Compatible WooCommerce & Shopify',
    desc: 'Export CSV en un clic. Importez 100 produits enrichis en quelques secondes dans votre boutique.',
  },
];

export default function BenefitsBlock() {
  return (
    <>
      <section className="bg-cream-alt py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-cream-surface rounded-2xl p-6 shadow-sm border border-warm-border"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(59,130,246,0.12)' }}
                  >
                    <Icon size={20} strokeWidth={1.6} style={{ color: '#60A5FA' }} />
                  </div>
                  <h3 className="font-semibold text-warm-brown text-base mb-1.5">{b.title}</h3>
                  <p className="text-warm-gray text-sm leading-relaxed m-0">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      <SectionDivider />
    </>
  );
}
