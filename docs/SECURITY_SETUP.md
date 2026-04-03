# 🔐 Guide de Configuration Sécurisée - WooSenteur

Ce guide vous aide à régénérer et configurer toutes vos clés API en toute sécurité.

## ⚠️ IMPORTANT : Ne JAMAIS commiter le fichier `.env` !

Le fichier `.env` contient vos secrets. Il doit TOUJOURS rester local.

---

## 📋 Clés API à Régénérer

### 1️⃣ **Gemini API** (CRITIQUE)

**Statut** : 🔴 URGENT

1. Allez sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Supprimez** toutes les anciennes clés que vous ne reconnaissez pas.
3. Cliquez sur **"Create API Key"**.
4. Copiez la nouvelle clé.
5. Ajoutez dans `.env` :
   ```
   GOOGLE_GENAI_API_KEY=AIzaSy...votre_nouvelle_cle
   ```

---

### 2️⃣ **Firebase Service Account** (CRITIQUE)

**Statut** : 🔴 URGENT

1. Allez sur [Firebase Console](https://console.firebase.google.com/project/studio-2957055289-b4c78/settings/serviceaccounts/adminsdk)
2. Onglet **"Service Accounts"**.
3. Cliquez sur **"Generate new private key"**.
4. Téléchargez le fichier JSON.
5. Ouvrez le fichier, **copiez TOUT le contenu**.
6. Ajoutez dans `.env` (sur UNE SEULE ligne, entre guillemets simples) :
   ```
   SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"studio-2957055289-b4c78",...}'
   ```

⚠️ **ATTENTION** : Le JSON doit être sur UNE ligne, entouré de guillemets simples.

---

### 3️⃣ **Google Custom Search API**

**Statut** : 🟠 Important

1. Allez sur [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=studio-2957055289-b4c78)
2. Cliquez sur **"+ CREATE CREDENTIALS"** → **"API Key"**.
3. (Recommandé) Cliquez sur **"RESTRICT KEY"** et limitez-la à **Custom Search API**.
4. Copiez la clé.
5. Ajoutez dans `.env` :
   ```
   GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSy...votre_cle
   GOOGLE_CUSTOM_SEARCH_ENGINE_ID=remplacer_par_votre_id
   ```

---

### 4️⃣ **Stripe API Keys**

**Statut** : 🟠 Important

1. Allez sur [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
2. Section **"Secret key"** → Cliquez sur **"⋯"** → **"Roll key"**.
3. Copiez la nouvelle clé secrète.
4. Ajoutez dans `.env` :
   ```
   STRIPE_SECRET_KEY=sk_test_...votre_nouvelle_cle
   ```

---

### 5️⃣ **reCAPTCHA Secret Key**

**Statut** : 🟡 Moyen

1. Allez sur [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Cliquez sur votre site **"WooSenteur"**.
3. Section **"Settings"** → **"reCAPTCHA keys"**.
4. Régénérez la **Secret key**.
5. Ajoutez dans `.env` :
   ```
   RECAPTCHA_SECRET_KEY=6Ldx...votre_nouvelle_cle_secrete
   ```

⚠️ La clé **Site key** (publique) est différente et doit être dans `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.

---

## ✅ Checklist Complète du fichier `.env`

Après avoir régénéré toutes les clés, votre fichier `.env` doit contenir uniquement des clés nouvelles et valides.

```bash
# Firebase Client (Public - OK)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBQbrwDqMzPYilkFWi5wZ_Gsg9lg_UkgAk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-2957055289-b4c78.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-2957055289-b4c78
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-2957055289-b4c78.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=329200137078
NEXT_PUBLIC_FIREBASE_APP_ID=1:329200137078:web:726a24ac5fdfbbc6028057
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-GLNBW7LF5S

# Firebase Admin (SECRET - À REGÉNÉRER)
SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Google AI Gemini (SECRET - À REGÉNÉRER)
GOOGLE_GENAI_API_KEY=AIzaSy...

# Google Custom Search (SECRET - À REGÉNÉRER)
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSy...
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=...

# Stripe (SECRET - À REGÉNÉRER si exposé)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# reCAPTCHA (SECRET - À REGÉNérer)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6L...
RECAPTCHA_SECRET_KEY=6L...

# WooCommerce Admin (SECRET)
NEXT_PUBLIC_ADMIN_WOOCOMMERCE_STORE_URL=https://...
NEXT_PUBLIC_ADMIN_WOOCOMMERCE_CONSUMER_KEY=ck_...
NEXT_PUBLIC_ADMIN_WOOCOMMERCE_CONSUMER_SECRET=cs_...
```

---

## 🧪 Tester la Configuration

Une fois toutes les clés configurées :

```bash
# 1. Redémarrer le serveur
npm run dev

# 2. Tester l'inscription et la connexion

# 3. Tester la génération de produit
```

---

## 🛡️ Bonnes Pratiques de Sécurité

### ✅ À FAIRE
- ✅ Garder `.env` en local UNIQUEMENT.
- ✅ Utiliser `.env.example` pour la documentation (sans clés).
- ✅ Vérifier que `.gitignore` contient bien `.env`.

### ❌ À NE JAMAIS FAIRE
- ❌ Commiter `.env` dans Git.
- ❌ Partager les clés par email/chat.
- ❌ Mettre des clés en dur dans le code.
