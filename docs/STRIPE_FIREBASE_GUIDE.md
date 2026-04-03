
# Guide de Configuration Stripe + Firebase

## 🔧 1. Configuration Stripe

### A. Créer les Prix (Products)
1. Allez sur https://dashboard.stripe.com/test/products
2. Créez 3 produits avec leurs prix récurrents :
   - **Basic**: 9€/mois → Copiez le `price_id`
   - **Pro**: 29€/mois → Copiez le `price_id`
   - **Enterprise**: 99€/mois → Copiez le `price_id`

### B. Configurer les Webhooks
1. Allez sur https://dashboard.stripe.com/test/webhooks
2. Cliquez "Add endpoint"
3. URL: `https://votre-domaine.com/api/webhooks/stripe`
4. **Sélectionnez ces événements** :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (commence par `whsec_`)

### C. Récupérer vos clés
- Clé secrète: https://dashboard.stripe.com/test/apikeys
- Copiez `sk_test_...` et `pk_test_...`

---

## 🔥 2. Configuration Firebase

### A. Activer Firebase Admin SDK
1. Allez dans votre projet Firebase Console
2. Paramètres du projet → Comptes de service
3. Cliquez "Générer une nouvelle clé privée"
4. Téléchargez le fichier JSON
5. Extrayez ces valeurs :
   - `project_id`
   - `client_email`
   - `private_key` (gardez les \n)

### B. Créer les règles Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Seulement via Admin SDK
    }
  }
}
```

---

## 🚀 3. Installation des dépendances

```bash
npm install stripe firebase-admin
```

---

## 🔑 4. Configuration des variables d'environnement

Créez `.env.local` à la racine du projet avec :

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@votre-projet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 5. Tester en local avec Stripe CLI

### Installation
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
```

### Lancer le webhook local
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copiez le webhook secret affiché (commence par `whsec_`) et mettez-le dans `.env.local`

---

## ✅ 6. Checklist finale

- [ ] Prix créés sur Stripe Dashboard
- [ ] Webhooks configurés sur Stripe
- [ ] Firebase Admin SDK configuré
- [ ] Toutes les variables d'environnement définies
- [ ] `firebase-admin` et `stripe` installés
- [ ] Stripe CLI installé et webhook écouté
- [ ] Routes API créées (`/api/stripe/checkout` et `/api/webhooks/stripe`)
- [ ] Règles Firestore configurées

---

## 🧪 7. Test complet

1. Lancez votre app : `npm run dev`
2. Lancez Stripe CLI : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Allez sur `/pricing`
4. Connectez-vous
5. Cliquez sur "Souscrire" pour un plan
6. Utilisez la carte de test : `4242 4242 4242 4242`
7. Date : n'importe quelle date future
8. CVC : n'importe quel 3 chiffres
9. Vérifiez dans Firestore que l'utilisateur a bien été mis à jour

---

## 🐛 Debugging

### Si erreur 403 sur /api/stripe/checkout
- Vérifiez que le token Firebase est bien envoyé dans le header
- Vérifiez que Firebase Admin SDK est bien configuré
- Console du backend : regardez les logs

### Si webhook ne fonctionne pas
- Vérifiez que Stripe CLI écoute bien
- Vérifiez le `STRIPE_WEBHOOK_SECRET`
- Regardez les logs dans la console Stripe Dashboard

### Si l'abonnement n'est pas créé
- Vérifiez les logs webhook dans Stripe Dashboard
- Vérifiez que les métadonnées (userId, planName) sont bien passées
- Vérifiez les règles Firestore

---

## 📚 Ressources

- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
