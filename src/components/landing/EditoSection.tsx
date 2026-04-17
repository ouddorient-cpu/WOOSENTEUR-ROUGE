'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n/useT';

const EditoSection = () => {
  const t = useT();

  return (
    <section className="py-20 lg:py-28 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">

        {/* Chapô */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="section-label">{t.edito.label}</span>
          <p className="mt-5 text-xl md:text-2xl font-semibold text-foreground leading-snug">
            {t.edito.intro}
          </p>
        </motion.div>

        {/* Corps dense */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="prose prose-base dark:prose-invert max-w-none text-foreground/80 leading-relaxed space-y-5"
        >
          <p>{t.edito.p1}</p>
          <p>{t.edito.p2}</p>
          <p>{t.edito.p3}</p>
          <p>{t.edito.p4}</p>
          <p className="pt-4 border-t border-border/40 text-foreground/50 italic text-sm">
            {t.edito.footer}
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default EditoSection;
