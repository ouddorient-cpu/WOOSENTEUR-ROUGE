'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { useT } from '@/lib/i18n/useT';

const Faq = () => {
    const t = useT();
    return (
        <section id="faq" className="py-20 lg:py-24 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image
                src="https://res.cloudinary.com/dzagwz94z/image/upload/v1767267988/ChatGPT_Image_29_d%C3%A9c._2025_23_42_04_dku5kn.png"
                alt="Fond texturé"
                fill
                style={{ objectFit: 'cover' }}
                className="opacity-10"
              />
               <div className="absolute inset-0 bg-background/80"></div>
            </div>
            <div className="container mx-auto px-4 md:px-6 max-w-3xl relative">
                <div className="text-center">
                    <h2 className="font-headline text-4xl font-bold text-foreground">
                        {t.faq.title}{' '}
                        <span className="text-gradient">{t.faq.titleHighlight}</span>
                    </h2>
                </div>
                <Accordion type="single" collapsible className="w-full mt-12">
                    {t.faq.items.map((item, i) => (
                        <AccordionItem value={`item-${i}`} key={i}>
                            <AccordionTrigger className="text-lg font-medium text-left">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
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
