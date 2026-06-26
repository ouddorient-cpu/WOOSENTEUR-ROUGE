/**
 * Scaffold pour les notifications push (non câblé pour le MVP).
 *
 * Flow futur prévu :
 * 1. Demander la permission via @capacitor/push-notifications.
 * 2. Récupérer le token FCM (register()).
 * 3. Envoyer le token vers Firestore: users/{uid}/devices/{token}.
 * 4. Côté serveur, envoyer des push (ex: crédits épuisés, fiche prête) via Firebase Admin Messaging.
 *
 * Nécessite google-services.json dans android/app/ une fois implémenté.
 */
export async function initPushNotifications(): Promise<void> {
  // No-op pour le MVP.
}
