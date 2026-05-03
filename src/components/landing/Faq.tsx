'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useT } from '@/lib/i18n/useT';

const C = {
  bg: '#07090F', bgAlt: '#0A0F1C',
  text: '#E2EAF8', muted: '#6B7FAD', border: '#101E36',
  sage: '#3B82F6', sagePale: 'rgba(59,130,246,0.10)',
  terra: '#60A5FA',
};

const Faq = () => {
  const t = useT();
  return (
    <section id="faq" className="py-20 lg:py-24" style={{ background: C.bg }}>
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-12">
          <span
            className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide"
            style={{ background: C.sagePale, color: C.sage }}
          >
            ✦ FAQ
          </span>
          <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 700, color: C.text }}>
            {t.faq.title}{' '}
            <span style={{ color: C.terra }}>{t.faq.titleHighlight}</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {t.faq.items.map((item, i) => (
            <AccordionItem
              value={`item-${i}`}
              key={i}
              style={{ borderColor: C.border }}
            >
              <AccordionTrigger
                className="text-base font-semibold text-left hover:no-underline"
                style={{ color: C.text }}
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed" style={{ color: C.muted }}>
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Faq;
