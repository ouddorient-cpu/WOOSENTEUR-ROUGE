# Feuille de route — Repositionnement Woosenteur

**Date :** 2026-04-18  
**Statut :** Approuvé — en cours d'exécution

---

## Nouveau positionnement

Woosenteur aide les petits e-commerçants à créer rapidement des fiches produit claires, rassurantes et prêtes à publier, même s'ils ne connaissent rien au SEO, à l'IA ou à la rédaction web.

### Cible

- Petits e-commerçants solo
- Jeunes mamans qui lancent une boutique
- Créateurs de produits maison
- Vendeurs de produits artisanaux ou peu connus
- Personnes qui ne maîtrisent ni l'IA, ni le SEO, ni les codes marketing

### Réalité du client

- Ils ont créé un bon produit mais ne savent pas comment le présenter
- Ils bloquent devant la fiche produit
- Ils ne savent pas quoi écrire
- Ils ont peur que leur boutique fasse amateur
- Ils veulent vendre sans apprendre un jargon technique

### Ce qu'on NE dit plus

- "Génération SEO automatisée"
- "IA", "machine learning", "automation", "growth", "funnel"
- Promesses "révolutionnaires"
- Ton startup agressif

### Ce qu'on dit à la place

- "Écrire une fiche produit claire et prête à publier"
- "Gagner du temps, trouver les bons mots, mieux expliquer un produit"
- "Rassurer vos visiteurs"
- "Publier plus vite sans jargon technique"

---

## Direction visuelle

### Palette

| Rôle | Couleur | Hex |
|------|---------|-----|
| Fond principal | Crème chaud | `#F7F3EE` |
| Surface | Blanc cassé | `#FFFDFC` |
| Texte principal | Brun profond | `#2F2A26` |
| Accent confiance | Vert sauge | `#7A9D96` |
| CTA chaleureux | Terracotta doux | `#C97B63` |
| Texte secondaire | Gris chaud | `#7A7168` |
| Bordures | Beige doux | `#E8E0D5` |

### Typographie

- Titres : serif élégant (Playfair Display, Lora ou similaire)
- Corps : sans-serif lisible (Inter, DM Sans)
- Taille corps minimum : 16px
- Interlignage : 1.6–1.8

### Ambiance

- Beaucoup d'espace blanc
- Sections courtes et aérées
- Icônes simples et discrets (stroke, pas fill)
- Illustrations douces ou photos réalistes de personnes qui vendent
- Boutons visibles mais non agressifs (sans effet néon)
- Mobile-first

---

## Structure de la landing page

1. **Hero** — Promesse claire et rassurante
2. **Frustrations** — Bloc pain points du public
3. **Comment ça marche** — 3 étapes simples, sans jargon
4. **Avant / Après** — Fiche produit brouillon vs fiche propre
5. **Bénéfices concrets** — Ce que ça change vraiment
6. **Réassurance / Objections** — "Pas besoin d'être expert"
7. **Pour qui** — Portraits de vendeurs cibles
8. **CTA final** — Un seul bouton répété sur toute la page

### CTA unique

> **"Écrire ma première fiche — Gratuitement"**

---

## Ressenti voulu

- "C'est simple"
- "Je peux le faire"
- "Je ne vais pas être jugé parce que je ne connais pas le SEO"
- "Cet outil m'aide à mieux vendre mon produit"

---

## Sections gardées de l'ancienne page

- `TrialGenerator` — générateur interactif (démonstration live)
- `Pricing` — plans tarifaires
- `Faq` — questions fréquentes
- `Footer`

## Sections remplacées / refaites

- Hero → `HeroNew.tsx`
- Frustrations → `FrustrationsBlock.tsx` (nouveau)
- How It Works → `HowItWorksNew.tsx`
- Before/After → `BeforeAfterNew.tsx`
- Benefits → `BenefitsBlock.tsx` (nouveau)
- Reassurance → `ReassuranceBlock.tsx` (nouveau)
- For Who → `ForWhoNew.tsx`
- Final CTA → `FinalCtaNew.tsx`

---

## Fichiers modifiés

- `src/app/globals.css` — nouvelles variables CSS palette
- `src/app/page.tsx` — ordre des sections
- `src/components/landing/*.tsx` — nouveaux composants
- `src/lib/i18n/fr.ts`, `en.ts`, `types.ts` — nouvelles clés i18n
- `public/landing-preview.html` — preview HTML statique générée par AIDesigner
