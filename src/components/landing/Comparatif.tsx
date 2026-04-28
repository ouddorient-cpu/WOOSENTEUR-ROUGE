'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/lib/i18n/useT';

// Values stay language-agnostic (booleans + universal numbers)
const rowValues = [
  { chatgpt: 'Générique', woosenteur: 'Spécialisé (Pyramides, Notes, Labels)' },
  { chatgpt: '20 – 30 min', woosenteur: '3 min' },
  { chatgpt: 'Partiel', woosenteur: "Optimisée d'emblée" },
  { chatgpt: 'À faire manuellement', woosenteur: 'Export 1 clic' },
  { chatgpt: false, woosenteur: true },
  { chatgpt: false, woosenteur: true },
  { chatgpt: false, woosenteur: true },
  { chatgpt: false, woosenteur: true },
  { chatgpt: '20€/mois', woosenteur: 'Dès 5,99€' },
];

type CellValue = boolean | string | null;

const Cell = ({ value, isWoosenteur }: { value: CellValue; isWoosenteur?: boolean }) => {
  if (typeof value === 'boolean') {
    if (value) return <Check className={`h-5 w-5 mx-auto ${isWoosenteur ? 'text-green-400' : 'text-green-500/60'}`} />;
    return <X className="h-5 w-5 mx-auto text-red-400/60" />;
  }
  if (value === null) return <Minus className="h-4 w-4 mx-auto text-muted-foreground/40" />;
  return (
    <span className={`text-sm font-medium ${isWoosenteur ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
      {value}
    </span>
  );
};

const Comparatif = () => {
  const t = useT();
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
            {t.comparatif.title} <span className="text-muted-foreground line-through decoration-red-400">ChatGPT</span> ?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {t.comparatif.sub}
          </p>
        </motion.div>

        {/* Avant / Après */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative rounded-2xl overflow-hidden border-2 border-red-300 shadow-lg group"
          >
            <Image src="/dev-avant.png" alt="Sans Woosenteur" width={640} height={400}
              className="w-full object-cover" style={{ height: 240, objectFit: 'cover', objectPosition: 'center top' }} />
            <div className="absolute inset-0 bg-red-600/20 group-hover:bg-red-600/10 transition-colors" />
            <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <X className="h-4 w-4" /> SANS WOOSENTEUR
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white text-sm font-medium">😤 1h–2h par fiche · Erreurs · SEO manquant · Frustration</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="relative rounded-2xl overflow-hidden border-2 border-green-400 shadow-lg group"
          >
            <Image src="/dev-apres.png" alt="Avec Woosenteur" width={640} height={400}
              className="w-full object-cover" style={{ height: 240, objectFit: 'cover', objectPosition: 'center top' }} />
            <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/5 transition-colors" />
            <div className="absolute top-4 left-4 bg-green-600 text-white text-sm font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Check className="h-4 w-4" /> AVEC WOOSENTEUR
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white text-sm font-medium">✨ 3 min par fiche · SEO optimisé · Publié direct · Zen</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-border"
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground w-2/5">{t.comparatif.criterion}</th>
                <th className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">ChatGPT</span>
                    <span className="text-lg">🤖</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center bg-primary/5 rounded-t-lg">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-primary">✦ Woosenteur</span>
                    <div className="flex items-center gap-1">
                      <Image src="/logo-woocommerce.png" alt="WooCommerce" width={70} height={18} style={{ height: 16, width: 'auto', objectFit: 'contain' }} />
                      <Image src="/logo-shopify.png" alt="Shopify" width={60} height={18} style={{ height: 16, width: 'auto', objectFit: 'contain' }} />
                      <Image src="/logo-magento.png" alt="Magento" width={60} height={18} style={{ height: 16, width: 'auto', objectFit: 'contain' }} />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {t.comparatif.rows.map((row, i) => (
                <tr key={i} className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="py-4 px-6 font-medium text-foreground">{row.label}</td>
                  <td className="py-4 px-4 text-center"><Cell value={rowValues[i].chatgpt} /></td>
                  <td className="py-4 px-4 text-center bg-primary/5"><Cell value={rowValues[i].woosenteur} isWoosenteur /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-6 text-xs text-muted-foreground"
        >
          * Comparaison basée sur un usage standard pour une fiche produit cosmétique complète
        </motion.p>
      </div>
    </section>
  );
};

export default Comparatif;
