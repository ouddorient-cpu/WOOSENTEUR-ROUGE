# Architecture du Générateur IA - WooSenteur

Ce document décrit le fonctionnement interne du cœur de l'application WooSenteur : le pipeline de génération de fiches produits. Il détaille les étapes, les technologies et les modèles d'intelligence artificielle utilisés.

---

## 🎯 Vue d'Ensemble du Pipeline

La génération d'une fiche produit n'est pas une simple requête à une IA. C'est un processus en plusieurs étapes (un "pipeline") conçu pour être robuste, flexible et produire un contenu de haute qualité.

Le processus se déroule comme suit :

1.  **Entrée Utilisateur** : L'utilisateur fournit les informations de base (nom du produit, marque, catégorie, etc.).
2.  **Étape 1 : Enrichissement par Recherche Web** : Une recherche est effectuée sur des sources fiables pour trouver un contexte supplémentaire.
3.  **Étape 2 : Génération du Contenu SEO** : Un modèle IA spécialisé (Agent SEO) rédige l'ensemble de la fiche produit.
4.  **Étape 3 : Validation de l'Image (Optionnel)** : Si l'utilisateur téléverse une image, une autre IA (Directeur Artistique) la valide.
5.  **Étape 4 : Sauvegarde et Export** : La fiche est sauvegardée et prête à être publiée.

---

## 🔧 Détail des Étapes et Technologies

### Étape 1 : Enrichissement par Recherche Web (Facultatif)

-   **Objectif** : Fournir à l'agent IA un contexte récent et fiable sur le produit.
-   **Technologie** : Utilisation de l'outil `searchProductOnWeb` (`src/ai/tools/search-product-tool.ts`).
-   **Fonctionnement** :
    -   L'outil interroge l'**API Google Custom Search** pour chercher le produit sur des sites présélectionnés (`notino.fr`, `fragrantica.com`, etc.).
    -   **Important** : Cette étape n'est **pas bloquante**. Si aucun résultat n'est trouvé, le pipeline continue. L'agent IA utilisera alors ses connaissances générales.
    -   Si des résultats sont trouvés, les extraits (snippets) sont compilés et ajoutés au contexte fourni à l'étape suivante.

### Étape 2 : Génération du Contenu SEO (Le Cœur du Réacteur)

-   **Objectif** : Rédiger l'intégralité de la fiche produit en respectant des règles SEO strictes (style Rank Math).
-   **Modèle IA Principal** : **`googleai/gemini-2.5-flash`**. C'est le modèle de langage principal qui agit comme notre "Agent Rédacteur SEO".
-   **Fichier Clé** : `src/ai/flows/generate-seo-optimized-product-description.ts`.
-   **Fonctionnement** :
    1.  Le flux reçoit les informations de l'utilisateur et le contexte de la recherche web (si disponible).
    2.  Il exécute le prompt `generateRankMathCompliantDescriptionPrompt`. Ce prompt est extrêmement détaillé et donne des instructions très précises au modèle Gemini pour qu'il génère :
        -   Le `focusKeyword` (mot-clé principal).
        -   Le `productTitle` (titre SEO avec "Power Word").
        -   La `shortDescription` (méta-description optimisée).
        -   La `longDescription` (description longue formatée en HTML, avec une densité de mot-clé contrôlée).
        -   La `category` (Homme, Femme, Unisexe), déterminée par l'IA.
        -   La `contenance` (ex: "100ml"), extraite par l'IA.
        -   L'`imageAltText` (texte alternatif pour l'image).
        -   Le `slug` (URL optimisée).
    3.  La sortie est **formatée en JSON** pour être directement utilisable par l'application.

### Étape 3 : Validation de l'Image par l'IA (Contrôle Qualité)

-   **Objectif** : S'assurer que les images téléversées par les utilisateurs respectent une esthétique "luxe" et professionnelle.
-   **Modèle IA Visuel** : **`googleai/gemini-2.5-flash`** (le même modèle, mais utilisé pour ses capacités de reconnaissance d'image).
-   **Fichier Clé** : `src/ai/tools/image-validator-tool.ts`.
-   **Fonctionnement** :
    1.  L'outil `validateProductImage` reçoit l'image de l'utilisateur sous forme de Data URI.
    2.  Il envoie l'image au modèle Gemini avec un prompt spécifique lui demandant d'agir en tant que **"Directeur Artistique"** d'une marque de luxe.
    3.  L'IA analyse l'image selon des critères de propreté, de qualité et de professionnalisme.
    4.  Elle retourne un score de confiance et un feedback constructif (ex: "L'image est un peu floue. Essayez de refaire la photo...").
    5.  Si le score est trop bas, l'application affiche le feedback et empêche la publication, garantissant ainsi une haute qualité visuelle sur la boutique.

---

## ✅ Synthèse des Modèles d'IA

| Tâche | Modèle Utilisé | Fichier de Configuration | Rôle dans l'application |
| :--- | :--- | :--- | :--- |
| **Génération de Texte SEO** | `googleai/gemini-2.5-flash` | `generate-seo-optimized-product-description.ts` | **Agent Rédacteur SEO** : Crée tout le contenu écrit de la fiche produit. |
| **Validation d'Image** | `googleai/gemini-2.5-flash` | `image-validator-tool.ts` | **Directeur Artistique IA** : Juge la qualité esthétique des images produits. |

Le choix de **Gemini 2.5 Flash** pour les deux tâches est stratégique : c'est un modèle rapide, peu coûteux et nativement **multimodal** (capable de comprendre à la fois le texte, le code et les images), ce qui le rend parfait pour les besoins de WooSenteur.
