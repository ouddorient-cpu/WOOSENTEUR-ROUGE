# Récapitulatif des Liens de Paiement Stripe

Ce document centralise tous les liens de paiement direct pour chaque plan d'abonnement de WooSenteur.

---

## 🔵 Plan Essentiel

### Essentiel - Mensuel
- **Tarif :** 5,99 €/mois
- **Lien de production :** `https://buy.stripe.com/6oU8wOciJ7da5mr4cj2VG05`

### Essentiel - Annuel
- **Tarif :** 59,90 €/an
- **Lien de production :** `https://buy.stripe.com/7sY9ASciJfJGbKPfV12VG01`

---

## 🟢 Plan Standard (Le plus populaire)

### Standard - Mensuel
- **Tarif :** 9,99 €/mois
- **Lien de production :** `https://buy.stripe.com/aFa00i6Yp8he2af4cj2VG02`

### Standard - Annuel
- **Tarif :** 99,90 €/an
- **Lien de production :** `https://buy.stripe.com/bJe14mdmN5523ej1072VG00`

---

## 🟣 Plan Premium

### Premium - Mensuel
- **Tarif :** 24,90 €/mois
- **Lien de production :** `https://buy.stripe.com/8x2bJ096x6963ejdMT2VG03`

### Premium - Annuel
- **Tarif :** 250,00 €/an
- **Lien de production :** `https://buy.stripe.com/00w00ifuV1SQ3ej1072VG04`

---

## 📝 Utilisation

Ces liens sont utilisés dans le fichier `src/app/pricing/page.tsx`. La logique de l'application ajoute dynamiquement l'e-mail de l'utilisateur (`?prefilled_email=...`) et la référence client (`&client_reference_id=...`) à la fin de ces URLs avant de rediriger le client vers la page de paiement Stripe.
