# Améliorations du Prompt pour Rank Math SEO (24/12/2024)

## Objectif
Atteindre un score Rank Math de 90+ au lieu de 82/100 en corrigeant les erreurs SEO identifiées.

## Erreurs Rank Math Corrigées

### ✅ 1. Image sans texte alternatif (CORRIGÉ)
**Problème**: L'image du produit n'avait pas de texte alternatif contenant le mot-clé principal.

**Solution**:
- Ajout du champ `imageAltText` dans le schéma de sortie
- Le prompt génère maintenant un texte alternatif descriptif contenant le mot-clé
- Format: "Flacon de parfum [Nom Produit] [Marque] sur fond blanc"
- Limitation: 125 caractères maximum
- Intégration dans WooCommerce via le champ `alt` de l'image

### ✅ 2. Densité de mot-clé optimisée (CORRIGÉ)
**Problème**: La densité du mot-clé était de 1.37%, légèrement au-dessus de la plage optimale.

**Solution**:
- Règle stricte dans le prompt : densité entre 1.0% et 1.2%
- Pour un texte de 300 mots : utiliser le mot-clé 3-4 fois seulement
- Instruction de vérification ajoutée dans les "Final Instructions"

### ✅ 3. URL raccourcie (CORRIGÉ)
**Problème**: L'URL avait 84 caractères, trop longue pour le SEO.

**Solution**:
- Ajout du champ `slug` dans le schéma de sortie
- Le prompt génère un slug court (maximum 40 caractères)
- Format: lowercase, tirets, contient le mot-clé principal
- Utilise des abréviations si le nom complet est trop long
- Intégration dans WooCommerce via le champ `slug`

### ✅ 4. Power Word dans le titre (CORRIGÉ)
**Problème**: Le titre SEO ne contenait pas de "power word" pour augmenter le CTR.

**Solution**:
- Règle **CRITIQUE** ajoutée : le titre doit contenir un power word
- Liste de power words élargie : Incontournable, Exclusif, Essentiel, Nouveau, Garanti, Éprouvé, Révolutionnaire, Secret, Iconique, Ultime, Magique
- Le power word doit apparaître dans les 10 premiers caractères
- Formats recommandés :
  - "[Nom Produit] [Marque] : Le Parfum Iconique"
  - "[Nom Produit] [Marque] Exclusif"
- Instruction de vérification ajoutée

## Améliorations Supplémentaires

### Structure du contenu
- Paragraphes courts (3-4 phrases maximum)
- Mot-clé dans les 50 premiers caractères du premier paragraphe
- Utilisation obligatoire de listes `<ul>` pour les notes/bénéfices
- Tags `<strong>` pour les termes importants

### Meta Description
- Mot-clé dans les 50 premiers caractères
- CTA obligatoire à la fin
- Si parfum : résumé de la pyramide olfactive

## Fichiers Modifiés

1. **src/ai/flows/generate-seo-optimized-product-description.ts**
   - Ajout des champs `imageAltText` et `slug` au schéma de sortie
   - Amélioration du prompt avec règles strictes pour Rank Math
   - Instructions de vérification ajoutées

2. **src/ai/flows/publish-to-woocommerce.ts**
   - Intégration du champ `slug` dans le payload WooCommerce
   - Intégration de `imageAltText` dans le champ `alt` de l'image
   - Fallback sur `focusKeyword` si `imageAltText` n'est pas disponible

## Résultats Attendus

Avec ces améliorations, le score Rank Math devrait passer de **82/100** à **90+/100**, en corrigeant les 4 erreurs identifiées :

- ✅ Image avec texte alternatif optimisé
- ✅ Densité de mot-clé dans la plage optimale (1.0-1.2%)
- ✅ URL courte et optimisée (<40 caractères)
- ✅ Power word présent dans le titre SEO

## Notes Importantes

⚠️ **Ces modifications ne changent pas la logique métier du SaaS**, elles améliorent uniquement la qualité SEO des fiches produits générées.

⚠️ **Compatibilité descendante**: Les produits existants sans `imageAltText` ou `slug` utiliseront le `focusKeyword` comme fallback, donc aucune régression.

## Prochaine Étape

Tester la génération d'un nouveau produit et vérifier que le score Rank Math atteint bien 90+.
