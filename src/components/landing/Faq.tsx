
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';

const faqs = [
    {
        question: 'Qu\'est-ce qu\'un crédit et à quoi ça correspond ?',
        answer: '1 crédit = 1 fiche produit SEO complète générée. Le plan Gratuit offre 5 crédits à vie pour tester sans risque. Les plans payants renouvellent vos crédits chaque mois automatiquement.'
    },
    {
        question: 'Comment fonctionne l\'agent IA ?',
        answer: 'Notre agent a été conçu spécifiquement pour l\'e-commerce. Il analyse les informations que vous fournissez (nom, marque, catégorie), recherche le produit sur le web, puis rédige une fiche complète avec titre SEO, méta-description, description longue, slug URL, tags et balises alt. Tout est optimisé pour Rank Math et Yoast.'
    },
    {
        question: 'Combien de temps faut-il pour générer une fiche ?',
        answer: 'Entre 30 secondes et 3 minutes selon la complexité du produit. L\'agent effectue une recherche web en temps réel pour chaque génération, ce qui garantit un contenu précis et actualisé.'
    },
    {
        question: 'Les descriptions sont-elles vraiment uniques ?',
        answer: 'Oui, absolument. Chaque description est générée de manière unique à chaque requête. Notre système génère du contenu original à chaque fois, vous ne publierez jamais de contenu dupliqué — ce qui est essentiel pour votre référencement Google.'
    },
    {
        question: 'Fonctionne-t-il uniquement pour les cosmétiques ?',
        answer: 'Non ! Bien que nous soyons spécialisés en cosmétiques et parfums, l\'outil génère des fiches pour toutes les catégories : habillement, maison, sport, alimentation, etc. La catégorie cosmétique bénéficie simplement d\'une optimisation plus poussée (notes olfactives, pyramide de senteur, etc.).'
    },
    {
        question: 'Y a-t-il un engagement ? Puis-je annuler ?',
        answer: 'Aucun engagement. Les abonnements sont mensuels (ou annuels si vous choisissez cette option). Vous pouvez annuler à tout moment depuis votre espace client, sans pénalité. Votre accès reste actif jusqu\'à la fin de la période payée.'
    },
    {
        question: 'Que se passe-t-il si mes crédits sont épuisés ?',
        answer: 'Vous recevez une notification quand il vous reste peu de crédits. Une fois épuisés, vous pouvez passer à un plan supérieur ou attendre le renouvellement mensuel. Vos fiches déjà générées restent toujours accessibles dans votre tableau de bord.'
    },
    {
        question: 'Comment exporter mes fiches vers WooCommerce ou Shopify ?',
        answer: 'Pour WooCommerce : publication directe en 1 clic (URL + clé API, configuration unique de 2 minutes). Pour Shopify et toute autre plateforme : export en CSV universel à importer directement dans votre back-office. Le fichier est formaté pour être compatible avec la grande majorité des plateformes e-commerce.'
    }
];

const Faq = () => (
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
              Vous avez des questions ?{' '}
              <span className="text-gradient">Nous avons les réponses.</span>
            </h2>
        </div>
        <Accordion type="single" collapsible className="w-full mt-12">
            {faqs.map((faq, i) => (
            <AccordionItem value={`item-${i}`} key={i}>
                <AccordionTrigger className="text-lg font-medium text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
                </AccordionContent>
            </AccordionItem>
            ))}
        </Accordion>
        </div>
    </section>
);

export default Faq;
