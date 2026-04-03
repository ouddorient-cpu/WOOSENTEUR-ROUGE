# Analyse des Coûts d'API - WooSenteur

Ce document détaille les coûts prévisionnels liés à l'utilisation des API externes pour chaque client utilisant l'application WooSenteur.

---

## 🎯 Action Principale : Génération d'une Fiche Produit

Chaque fois qu'un utilisateur clique sur "Générer la Fiche Produit", plusieurs API sont sollicitées. C'est l'action principale qui engendre des coûts.

Le processus de génération se déroule comme suit :

1.  **Vérification d'Existence (Google Custom Search API)**
2.  **Génération du Contenu SEO (Google AI - Gemini via Genkit)**
3.  **Sauvegarde des Données (Firebase Firestore)**

Analysons le coût de chaque étape.

---

### 1. Google Custom Search API

Cette API est utilisée par notre outil `searchProductOnWeb` pour vérifier si le produit existe sur des sites de référence comme Notino ou Fragrantica.

- **Appels par génération :** 1 appel
- **Pricing :**
    - **Quota gratuit :** 100 requêtes par jour.
    - **Au-delà du quota :** 5 $ pour 1000 requêtes (soit ~0,005 € par recherche).

**Conclusion :** Le coût est négligeable pour un usage normal (jusqu'à 100 générations/jour). Il ne devient un facteur qu'en cas de génération en très grand volume.

---

### 2. Google AI Platform (via Genkit)

C'est le cœur de l'application et le principal poste de coût par génération. L'API est utilisée pour générer le titre, les descriptions (courte et longue), la catégorie, etc.

- **Appels par génération :** 1 appel au modèle Gemini.
- **Pricing (basé sur le modèle `gemini-2.5-flash`) :**
    - **Input (Prompt) :** Le coût est basé sur le nombre de caractères envoyés. Pour une requête standard (nom produit + marque), cela représente environ 2000-3000 caractères.
    - **Output (Réponse) :** Le coût est basé sur le nombre de caractères reçus. Une fiche produit complète contient environ 2500-3500 caractères.

- **Estimation du coût par génération :**
    - En se basant sur les tarifs actuels de Gemini, le coût total (input + output) pour une seule fiche produit est extrêmement faible.
    - On peut l'estimer à environ **0,0002 € à 0,0005 € par fiche produit générée**.

**Conclusion :** Le coût de l'IA est très marginal à l'échelle d'une seule génération. Vous pouvez effectuer des milliers de générations pour quelques euros seulement. Le modèle économique basé sur la vente de crédits est donc très rentable.

---

### 3. Firebase (Firestore, Authentication, Storage)

Firebase est utilisé pour stocker les profils utilisateurs, les produits générés et les images.

- **Pricing :** Firebase offre un quota gratuit très généreux ("Spark Plan") :
    - **Firestore :** 50 000 lectures/jour, 20 000 écritures/jour, 20 000 suppressions/jour.
    - **Storage :** 5 Go de stockage, 1 Go de téléchargement/jour.
    - **Authentication :** 10 000 authentifications/mois.

- **Opérations par génération :**
    - 1 écriture (`saveProduct`)
    - 1 lecture + 1 écriture (`decrementCredits`, si l'utilisateur n'est pas admin)
    - 1 écriture sur le stockage + 1 mise à jour Firestore (pour l'upload d'image)

**Conclusion :** Avec le quota gratuit, vous pouvez supporter des centaines d'utilisateurs actifs quotidiennement sans encourir de frais Firebase. Les coûts n'apparaîtront qu'à une échelle beaucoup plus grande.

---

### 4. Autres Services

- **Stripe :** Les frais sont transactionnels (un pourcentage du montant de l'abonnement, ex: 1.5% + 0.25€) et ne sont pas liés à l'usage de l'API.
- **WooCommerce API :** C'est votre propre boutique. Il n'y a pas de coût par appel, seulement les frais d'hébergement de votre serveur.
- **reCAPTCHA :** Gratuit jusqu'à 1 million d'évaluations par mois, donc aucun coût prévisible.

---

## ✅ Synthèse et Rentabilité

Le coût total par génération de fiche produit (hors actions optionnelles comme l'upload d'image) est principalement dicté par l'IA et la recherche Google.

**Coût total estimé par génération : ~0,005€ (si le quota gratuit de recherche est dépassé) + ~0,0005€ (IA) ≈ 0,0055 €**

Le modèle économique où vous vendez des packs de crédits (par exemple, 50 crédits pour 5.99€) est **extrêmement rentable**. Le coût d'API pour 50 générations serait d'environ 0,275 €, vous laissant une marge brute très confortable pour couvrir les autres frais (Stripe, hébergement, etc.) et générer des bénéfices.