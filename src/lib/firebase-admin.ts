
import * as admin from 'firebase-admin';

/**
 * A robust, singleton-pattern function to get the Firebase Admin SDK instance.
 * It initializes the app only once and handles common configuration issues gracefully.
 * 
 * @returns The initialized Firebase Admin App instance, or null if configuration is missing/invalid.
 */
export function initFirebaseAdminApp(): admin.App | null {
    // If the app is already initialized, return the cached instance immediately.
    if (admin.apps.length) {
        return admin.app();
    }

    // The service account key must be present in environment variables.
    const serviceAccountString = process.env.SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString || serviceAccountString.includes('your_service_account_key_here')) {
        console.warn("⚠️ WARNING: SERVICE_ACCOUNT_KEY is not configured in .env file. Firebase Admin features will be disabled.");
        return null;
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);

        // CRITICAL FIX: The private_key from .env often has literal "\\n" strings.
        // These must be replaced with actual newline characters for the SDK to parse the PEM key correctly.
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        // Initialize the app with the corrected credentials.
        console.log("Initializing Firebase Admin SDK for the first time...");
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        
        console.log("✅ Firebase Admin SDK initialized successfully.");
        return app;

    } catch (e: any) {
        console.error("❌ ERROR: SERVICE_ACCOUNT_KEY in .env file is malformed. Could not initialize Firebase Admin SDK.", e.message);
        // Do not throw, return null to allow the app to run in a degraded state.
        return null;
    }
}
