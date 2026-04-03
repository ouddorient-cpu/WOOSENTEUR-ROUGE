# Système d'Administration - WooSenteur

## 📋 Vue d'Ensemble

Le système d'administration permet à l'email `ouddorient@gmail.com` d'avoir des privilèges illimités :

- ✅ **Crédits illimités** (999,999 crédits, affichage ∞)
- ✅ **Rôle Superadmin** (accès complet)
- ✅ **Connexion Magic Link** (sans mot de passe)
- ✅ **Bypass vérifications** (pas de décrémentation de crédits)
- ✅ **Badge Admin** visible dans le Header

---

## 🔧 Modifications Techniques

### 1. Interface User (`lib/firebase/users.ts`)

```typescript
export interface User {
  // ... autres champs
  role?: 'user' | 'admin' | 'superadmin';
  isUnlimited?: boolean; // Crédits illimités
}

const SUPERADMIN_EMAIL = 'ouddorient@gmail.com';
```

**Détection automatique lors de la création :**
- Si `email === SUPERADMIN_EMAIL` → `role: 'superadmin'`, `isUnlimited: true`, `creditBalance: 999999`, `subscriptionPlan: 'premium'`
- Sinon → `role: 'user'`, `isUnlimited: false`, `creditBalance: 5`, `subscriptionPlan: 'free'`

---

### 2. Décrémentation Crédits Bypass

```typescript
export async function decrementCredits(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  
  // Bypass pour admin
  if (user.isUnlimited || user.role === 'superadmin') {
    console.log('✅ Admin détecté - crédits illimités');
    // Incrémente seulement les stats, pas de décrémentation
    return true;
  }
  
  // Vérification normale pour users
  if (user.creditBalance <= 0) return false;
  // ... décrémentation
}
```

---

### 3. Magic Link Authentication (`contexts/AuthContext.tsx`)

**Nouvelles fonctions :**

```typescript
loginWithMagicLink(email: string): Promise<void>
// Envoie un lien de connexion par email (Firebase sendSignInLinkToEmail)
// Redirection vers /auth/verify après clic

completeMagicLinkLogin(): Promise<void>
// Complète la connexion via le lien (signInWithEmailLink)
// Auto-création profil Firestore si nécessaire
```

**URL de vérification :** `http://localhost:3000/auth/verify`

---

### 4. Page Génération (`app/generate/page.tsx`)

**Vérification crédits modifiée :**

```typescript
// AVANT (bloquait admin)
if (userProfile && userProfile.creditBalance <= 0) {
  setGenerationError('❌ Crédits insuffisants');
  return;
}

// APRÈS (bypass pour admin)
if (userProfile && !userProfile.isUnlimited && userProfile.role !== 'superadmin' && userProfile.creditBalance <= 0) {
  setGenerationError('❌ Crédits insuffisants');
  return;
}
```

**Bouton génération :**
- Désactivé si : `!productName || !brand || !category || (user normal ET crédits <= 0)`
- Admin peut générer même avec 0 crédits affichés

---

### 5. Header (`components/layout/Header.tsx`)

**Badge dynamique :**

```tsx
{userProfile.isUnlimited || userProfile.role === 'superadmin' ? (
  // Badge ADMIN avec icône Shield
  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
    <Shield className="text-amber-600" />
    <span className="text-amber-700 font-bold">ADMIN</span>
    <span className="text-amber-600">∞ crédits</span>
  </div>
) : (
  // Badge normal avec nombre de crédits
  <div className="bg-gradient-to-r from-[#9333EA]/10 to-[#6B46C1]/10">
    <CreditCard className="text-[#9333EA]" />
    <span>{userProfile.creditBalance} crédits</span>
  </div>
)}
```

**Design mobile :** Icône Shield + "ADMIN ∞" sous l'avatar

---

### 6. Composant AdminLoginButton (`components/auth/AdminLoginButton.tsx`)

**Fonctionnalités :**
- Bouton "Connexion Admin (Magic Link)"
- Couleurs : dégradé amber/orange (différent du violet principal)
- Icône : Shield (bouclier)
- Envoie lien automatique à `ouddorient@gmail.com`
- Alert de confirmation avec instructions
- États : loading → success → check email

**Intégration :**
- Ajouté dans `LoginForm.tsx` après le bouton Google OAuth
- Séparateur "Accès Admin" avec bordure pointillée

---

### 7. Page Vérification Magic Link (`app/auth/verify/page.tsx`)

**Workflow :**
1. User clique sur lien dans email → redirigé vers `/auth/verify`
2. Page exécute `completeMagicLinkLogin()` automatiquement
3. États :
   - **Loading** : Loader2 "Vérification en cours..."
   - **Success** : CheckCircle2 → auto-redirect vers `/generate` (2s)
   - **Error** : AlertCircle + bouton "Retour à la connexion"

---

## 🚀 Utilisation

### Option 1 : Magic Link (Recommandé pour Admin)

1. Aller sur http://localhost:3000/login
2. Cliquer sur **"Connexion Admin (Magic Link)"**
3. Vérifier l'email `ouddorient@gmail.com`
4. Cliquer sur le lien reçu
5. ✅ Connexion automatique avec privilèges admin

### Option 2 : Email/Password Classique

Si le compte admin a déjà été créé avec mot de passe :
1. Se connecter normalement avec `ouddorient@gmail.com` + mot de passe
2. Le système détecte automatiquement le rôle superadmin

### Option 3 : Google OAuth

Si l'email Gmail correspond à `ouddorient@gmail.com` :
1. Cliquer sur "Google"
2. Choisir le compte Gmail
3. ✅ Profil créé automatiquement avec privilèges admin

---

## 🔍 Vérifications Post-Connexion

### Dans le Header
- Badge **"ADMIN ∞ crédits"** avec icône Shield (couleur amber)
- Avatar avec dropdown menu

### Dans Firebase Console

**Firestore → users → {userId} :**
```json
{
  "email": "ouddorient@gmail.com",
  "role": "superadmin",
  "isUnlimited": true,
  "creditBalance": 999999,
  "subscriptionPlan": "premium",
  "subscriptionStatus": "active"
}
```

### Lors de la Génération
1. Générer un produit ("La Vie Est Belle" + "Lancôme")
2. Badge crédits reste "∞" (pas de décrémentation)
3. Console logs : `"✅ Admin détecté - crédits illimités, pas de décrémentation"`
4. Produit sauvegardé normalement dans Firestore

---

## 🛡️ Sécurité

### Firestore Rules (À implémenter)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper : vérifier propriété ou admin
    function isOwnerOrAdmin(userId) {
      return request.auth.uid == userId || 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
    
    // Users : lecture self ou admin, écriture self uniquement
    match /users/{userId} {
      allow read: if isOwnerOrAdmin(userId);
      allow create: if request.auth.uid == userId;
      allow update, delete: if request.auth.uid == userId;
      
      // Empêcher auto-promotion admin (sauf si déjà admin)
      allow update: if request.auth.uid == userId && 
                       (request.resource.data.role == resource.data.role ||
                        resource.data.role == 'superadmin');
    }
    
    // Products : propriétaire ou admin
    match /users/{userId}/products/{productId} {
      allow read, write: if isOwnerOrAdmin(userId);
    }
  }
}
```

**Protection :**
- User normal ne peut pas modifier son `role`
- Admin peut lire tous les documents
- Admin ne peut pas modifier le `role` d'autres users (sauf via code backend)

---

## 📝 Logs Console

### Création Admin
```
📝 Création profil Firestore pour ouddorient@gmail.com
✅ Utilisateur créé : {uid} (ouddorient@gmail.com)
```

### Génération
```
🤖 Normalisation de l'entrée...
🤖 Vérification d'existence (Notino, Fragrantica)...
📊 Score de confiance : 92%
💬 Message : Produit identifié avec haute confiance
✅ Admin détecté - crédits illimités, pas de décrémentation
✅ Produit sauvegardé : {productId}
💳 Crédits restants : 999999
```

---

## 🐛 Troubleshooting

### Magic Link ne fonctionne pas
1. Vérifier Firebase Console → Authentication → Sign-in method → Email link
2. Activer "Email link (passwordless sign-in)"
3. Ajouter domaine autorisé : `localhost` et URL de prod

### Badge ADMIN ne s'affiche pas
1. Console : vérifier `userProfile.role` et `userProfile.isUnlimited`
2. Firestore : vérifier document `/users/{uid}` a bien `role: "superadmin"`
3. Force refresh : `Ctrl+Shift+R` (clear cache)

### Crédits décrementés malgré admin
1. Vérifier logs console : doit afficher "Admin détecté"
2. Firestore : `isUnlimited: true` ET `role: "superadmin"`
3. Bug possible si profil créé avant modification code → **supprimer document Firestore et recréer**

---

## 📦 Fichiers Modifiés

```
lib/firebase/users.ts           +25 lignes (interface, const SUPERADMIN_EMAIL, createUser, decrementCredits)
contexts/AuthContext.tsx        +80 lignes (imports, interface, loginWithMagicLink, completeMagicLinkLogin)
app/generate/page.tsx           +1 ligne (condition bypass crédits)
components/layout/Header.tsx    +15 lignes (imports Shield, badge conditionnel, mobile)
components/auth/LoginForm.tsx   +10 lignes (import AdminLoginButton, séparateur, bouton)
components/auth/AdminLoginButton.tsx  NOUVEAU (75 lignes)
app/auth/verify/page.tsx        NOUVEAU (90 lignes)
```

**Total :** ~300 lignes ajoutées/modifiées

---

## ✅ Checklist Test Complet

- [ ] Connexion via Magic Link (email reçu + lien cliqué)
- [ ] Badge "ADMIN ∞ crédits" visible desktop
- [ ] Badge Admin visible mobile (sous avatar)
- [ ] Génération produit sans décrémentation
- [ ] Firestore document contient `role: "superadmin"`, `isUnlimited: true`
- [ ] Console logs : "Admin détecté - crédits illimités"
- [ ] Pas d'alert "Crédits insuffisants" même avec 0 affichés
- [ ] Dropdown menu Header fonctionne (Dashboard, Profil, Logout)

---

## 🎯 Prochaines Étapes (Optionnel)

1. **Dashboard Admin** : Page `/admin` avec stats globales (tous users, tous produits)
2. **Gestion Users** : Table avec filtres, modifier crédits, bannir users
3. **Analytics** : Graphiques génération par jour, top catégories
4. **Export Global** : CSV de tous les produits de tous users
5. **Logs Audit** : Traçabilité actions admin (qui a fait quoi quand)

---

**Dernière mise à jour :** 30 novembre 2025  
**Statut :** ✅ Système admin opérationnel, prêt pour test
